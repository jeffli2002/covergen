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
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private authTimeout: NodeJS.Timeout | null = null;

  constructor(private options: OAuthPopupOptions = {}) {
    this.options = {
      width: 500,
      height: 800,
      ...options
    };
  }

  open(url: string): void {
    // Calculate center position
    const left = (window.screen.width - (this.options.width || 500)) / 2;
    const top = (window.screen.height - (this.options.height || 800)) / 2;

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

    // Set up a timeout for the OAuth flow (5 minutes)
    this.authTimeout = setTimeout(() => {
      this.cleanup();
      this.options.onError?.(new Error('OAuth authentication timed out. Please try again.'));
    }, 5 * 60 * 1000);

    // Note: We don't check popup.closed due to Cross-Origin-Opener-Policy restrictions.
    // Instead, we rely on postMessage communication and the timeout mechanism.
    // The popup callback page will send appropriate messages for success/error/close scenarios.
  }

  private handleSuccess(data: any): void {
    // Clear the auth timeout on success
    if (this.authTimeout) {
      clearTimeout(this.authTimeout);
    }
    this.cleanup();
    this.options.onSuccess?.(data);
  }

  private handleError(error: Error): void {
    // Clear the auth timeout on error
    if (this.authTimeout) {
      clearTimeout(this.authTimeout);
    }
    this.cleanup();
    this.options.onError?.(error);
  }

  private cleanup(): void {
    // Don't try to close popup due to COOP restrictions
    // The popup will handle its own lifecycle
    
    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
    }
    if (this.authTimeout) {
      clearTimeout(this.authTimeout);
    }
    
    this.popup = null;
    this.messageListener = null;
    this.authTimeout = null;
  }

  close(): void {
    this.cleanup();
  }
}