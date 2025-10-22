import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { prompt, context = 'image' } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DeepSeek API key not configured' }, { status: 500 });
    }

    // Tailor the system message based on context (image generation vs video generation)
    const systemMessage = context === 'video' 
      ? 'You are an expert AI prompt engineer specializing in video generation. Your task is to enhance user prompts to make them more detailed, cinematic, and effective for AI video generation (like Sora 2). Add descriptions of camera movements, lighting, scene dynamics, motion details, and temporal elements while maintaining the core idea. Focus on creating vivid, dynamic scenes that work well for video.'
      : 'You are an expert AI prompt engineer specializing in image generation. Your task is to enhance user prompts to make them more detailed, specific, and effective for AI image generation. Add artistic details, lighting descriptions, composition elements, style references, and technical parameters while maintaining the core idea. Focus on creating clear, vivid imagery.';

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          {
            role: 'user',
            content: `Enhance this prompt for AI ${context} generation:\n\n${prompt}\n\nProvide only the enhanced prompt without any explanations or additional text.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('DeepSeek API error:', errorData);
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to enhance prompt' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;

    return NextResponse.json({
      enhancedPrompt,
      originalPrompt: prompt,
    });
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
