// OAuth Popup Handler for better UX

export interface OAuthPopupOptions {
  width?: number;
  height?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export class OAuthPopupHandler {
  private popup: Window | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private messageListener: ((event: MessageEvent) => void) | null = null;

  constructor(private options: OAuthPopupOptions = {}) {
    this.options = {
      width: 500,
      height: 600,
      ...options
    };
  }

  open(url: string): void {
    // Calculate center position
    const left = (window.screen.width - (this.options.width || 500)) / 2;
    const top = (window.screen.height - (this.options.height || 600)) / 2;

    // Open popup window
    this.popup = window.open(
      url,
      'oauth-popup',
      `width=${this.options.width},height=${this.options.height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    if (!this.popup) {
      this.options.onError?.(new Error('Failed to open popup window. Please check your popup blocker settings.'));
      return;
    }

    // Set up message listener for cross-window communication
    this.messageListener = (event: MessageEvent) => {
      // Verify origin matches our domain
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'oauth-success') {
        this.handleSuccess(event.data.payload);
      } else if (event.data.type === 'oauth-error') {
        this.handleError(new Error(event.data.error || 'OAuth authentication failed'));
      }
    };

    window.addEventListener('message', this.messageListener);

    // Check if popup is closed
    this.checkInterval = setInterval(() => {
      if (this.popup?.closed) {
        this.cleanup();
        this.options.onClose?.();
      }
    }, 500);
  }

  private handleSuccess(data: any): void {
    this.cleanup();
    this.options.onSuccess?.(data);
  }

  private handleError(error: Error): void {
    this.cleanup();
    this.options.onError?.(error);
  }

  private cleanup(): void {
    if (this.popup && !this.popup.closed) {
      this.popup.close();
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
    this.popup = null;
    this.checkInterval = null;
    this.messageListener = null;
  }

  close(): void {
    this.cleanup();
  }
}