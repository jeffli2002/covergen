const KIE_IMAGE_T2I_MODEL = 'google/nano-banana';
const KIE_IMAGE_I2I_MODEL = 'google/nano-banana-edit';

export interface KIEImageGenerationParams {
  prompt: string;
  imageSize?:
    | '1:1'
    | '9:16'
    | '16:9'
    | '3:4'
    | '4:3'
    | '3:2'
    | '2:3'
    | '5:4'
    | '4:5'
    | '21:9'
    | 'auto';
  outputFormat?: 'png' | 'jpeg';
  imageUrl?: string;
  imageUrls?: string[];
  callBackUrl?: string;
}

export interface KIETaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

export interface KIETaskStatus {
  code: number;
  msg: string;
  data: {
    taskId: string;
    state: 'success' | 'fail' | 'pending' | 'processing';
    status?: 'pending' | 'processing' | 'completed' | 'failed';
    resultJson?: string;
    result?: {
      imageUrl?: string;
      resultUrls?: string[];
    };
    error?: string;
    failMsg?: string;
  };
}

type KIEImageTaskInput = {
  prompt: string;
  image_urls?: string[];
  image_size?: KIEImageGenerationParams['imageSize'];
  output_format?: KIEImageGenerationParams['outputFormat'];
};

type KIEImageTaskRequest = {
  model: string;
  input: KIEImageTaskInput;
  callBackUrl?: string;
};

export class KIEAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.kie.ai/api/v1';

  constructor(apiKey?: string) {
    const key = apiKey || process.env.KIE_API_KEY;
    if (!key) {
      throw new Error('KIE_API_KEY is not configured');
    }
    this.apiKey = key;
  }

  async generateImage(params: KIEImageGenerationParams): Promise<KIETaskResponse> {
    const isI2I = !!(params.imageUrl || (params.imageUrls && params.imageUrls.length > 0));
    const model = isI2I ? KIE_IMAGE_I2I_MODEL : KIE_IMAGE_T2I_MODEL;

    if (isI2I && !params.imageUrl && (!params.imageUrls || params.imageUrls.length === 0)) {
      throw new Error('Image URL is required for image-to-image generation');
    }

    return await this.createImageTask(model, params);
  }

  private async createImageTask(
    model: string,
    params: KIEImageGenerationParams
  ): Promise<KIETaskResponse> {
    const input: KIEImageTaskInput = {
      prompt: params.prompt,
    };

    if (params.imageUrls && params.imageUrls.length > 0) {
      input.image_urls = params.imageUrls.slice(0, 10);
    } else if (params.imageUrl) {
      input.image_urls = [params.imageUrl];
    }

    if (params.imageSize) {
      input.image_size = params.imageSize;
    }
    if (params.outputFormat) {
      input.output_format = params.outputFormat;
    }

    const requestBody: KIEImageTaskRequest = {
      model,
      input,
    };

    if (params.callBackUrl) {
      requestBody.callBackUrl = params.callBackUrl;
    }

    console.log('[KIE API] Creating image task:', {
      model,
      prompt: params.prompt.substring(0, 100),
      hasImages: !!input.image_urls,
      imageCount: input.image_urls?.length || 0,
    });

    const response = await fetch(`${this.baseUrl}/jobs/createTask`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    if (!response.ok || !responseText) {
      const errorMsg = responseText || response.statusText;
      console.error(`KIE API error (${model}):`, {
        status: response.status,
        statusText: response.statusText,
        responseText: errorMsg.substring(0, 500),
      });
      throw new Error(`KIE API error (${model}): ${errorMsg}`);
    }

    let data: KIETaskResponse;
    try {
      data = JSON.parse(responseText) as KIETaskResponse;
    } catch (_error) {
      console.error(`KIE API parse error (${model}):`, responseText.substring(0, 500));
      throw new Error(`KIE API parse error (${model}): ${(responseText || '').slice(0, 200)}`);
    }

    if (data.code !== 200) {
      const errorMsg = data.msg || `Failed to create image generation task (${model})`;
      console.error(`KIE API task creation failed (${model}):`, {
        code: data.code,
        msg: errorMsg,
      });
      throw new Error(errorMsg);
    }

    console.log('[KIE API] Task created successfully:', data.data.taskId);
    return data;
  }

  async getTaskStatus(taskId: string): Promise<KIETaskStatus> {
    const response = await fetch(`${this.baseUrl}/jobs/recordInfo?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const responseText = await response.text();
    if (!response.ok || !responseText) {
      console.error(`[KIE API] getTaskStatus failed for task ${taskId}:`, {
        status: response.status,
        statusText: response.statusText,
        responseText: responseText.substring(0, 500),
      });
      throw new Error(`KIE API error: ${responseText || response.statusText}`);
    }

    let data: KIETaskStatus;
    try {
      data = JSON.parse(responseText) as KIETaskStatus;
    } catch (parseError) {
      console.error(`[KIE API] Failed to parse response for task ${taskId}:`, {
        responseText: responseText.substring(0, 500),
        error: parseError instanceof Error ? parseError.message : String(parseError),
      });
      throw new Error(
        `KIE API response parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`
      );
    }

    if (data.data?.resultJson) {
      try {
        const resultData = JSON.parse(data.data.resultJson);
        if (resultData.resultUrls && Array.isArray(resultData.resultUrls)) {
          data.data.result = {
            ...data.data.result,
            resultUrls: resultData.resultUrls,
            imageUrl: resultData.resultUrls[0],
          };
        }
      } catch (e) {
        console.warn('Failed to parse resultJson:', e);
      }
    }

    if (data.data?.state && !data.data.status) {
      data.data.status =
        data.data.state === 'success'
          ? 'completed'
          : data.data.state === 'fail'
            ? 'failed'
            : data.data.state === 'pending'
              ? 'pending'
              : 'processing';
    }

    return data;
  }

  async pollTaskStatus(
    taskId: string,
    maxAttempts = 60,
    intervalMs = 5000
  ): Promise<{ imageUrl: string; status: string }> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getTaskStatus(taskId);

      console.log(`[KIE API] Task ${taskId} status: ${status.data?.state || status.data?.status} (attempt ${attempt + 1}/${maxAttempts})`);

      if (status.data?.status === 'completed' || status.data?.state === 'success') {
        const imageUrl =
          status.data?.result?.imageUrl ||
          status.data?.result?.resultUrls?.[0] ||
          (status.data?.resultJson
            ? JSON.parse(status.data.resultJson).resultUrls?.[0]
            : undefined);

        if (imageUrl) {
          return { imageUrl, status: 'completed' };
        }
      }

      if (status.data?.status === 'failed' || status.data?.state === 'fail') {
        throw new Error(status.data?.failMsg || status.data?.error || 'Image generation failed');
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Task polling timeout');
  }
}

let _kieApiService: KIEAPIService | null = null;

export function getKieApiService(): KIEAPIService {
  if (!_kieApiService) {
    _kieApiService = new KIEAPIService();
  }
  return _kieApiService;
}
