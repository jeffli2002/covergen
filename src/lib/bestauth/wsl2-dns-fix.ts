// WSL2 DNS resolution fix for OAuth providers
import dns from 'dns';

// Force Node.js to use Google's DNS servers in WSL2
export function setupWSL2DNSFix() {
  // Check if we're in WSL2
  const isWSL2 = process.platform === 'linux' && 
    process.env.WSL_DISTRO_NAME !== undefined;
  
  if (isWSL2) {
    console.log('[WSL2] Applying DNS fix for OAuth connectivity');
    
    // Use Google's DNS servers
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    
    // Alternative: Use Cloudflare DNS
    // dns.setServers(['1.1.1.1', '1.0.0.1']);
  }
}

// Custom fetch wrapper with better error handling and retries for WSL2
export async function fetchWithWSL2Fix(url: string, options: RequestInit): Promise<Response> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Add a shorter initial timeout for WSL2
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout per attempt
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.log(`[WSL2] Fetch attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after retries');
}