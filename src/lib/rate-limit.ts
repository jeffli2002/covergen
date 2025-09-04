import * as crypto from 'crypto';

export const FREE_TIER_LIMITS = {
  MONTHLY_COVERS: 10,
  ALLOWED_PLATFORMS: ['youtube', 'instagram', 'tiktok', 'spotify', 'wechat'] as const,
};

export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PRO_PLUS: 'pro_plus',
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
export type AllowedFreePlatform = typeof FREE_TIER_LIMITS.ALLOWED_PLATFORMS[number];

// Generate device fingerprint from various browser/device characteristics
export function generateDeviceFingerprint(): string {
  if (typeof window === 'undefined') return '';
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
  };
  
  const fingerprintString = JSON.stringify(fingerprint);
  
  // Use SubtleCrypto API for browser compatibility
  if (window.crypto && window.crypto.subtle) {
    return fingerprintString; // Will be hashed asynchronously
  }
  
  return fingerprintString;
}

// Hash fingerprint using SubtleCrypto API
export async function hashFingerprint(fingerprint: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) return fingerprint;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.substring(0, 16);
}

// Get client IP address (server-side only)
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  return cfConnectingIP || realIP || forwardedFor?.split(',')[0] || 'unknown';
}

// Generate unique identifier for anonymous users
export async function generateAnonymousId(deviceFingerprint: string, ip?: string): Promise<string> {
  const combinedId = ip ? `${ip}-${deviceFingerprint}` : deviceFingerprint;
  
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(combinedId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 32);
  }
  
  // Server-side fallback
  return crypto
    .createHash('sha256')
    .update(combinedId)
    .digest('hex')
    .substring(0, 32);
}

// Get current month key for tracking
export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Check if platform is allowed for free tier
export function isPlatformAllowedForFreeTier(platform: string): boolean {
  return FREE_TIER_LIMITS.ALLOWED_PLATFORMS.includes(platform.toLowerCase() as AllowedFreePlatform);
}

// Storage keys
export const STORAGE_KEYS = {
  DEVICE_FINGERPRINT: 'covergen_device_fp',
  ANONYMOUS_ID: 'covergen_anon_id',
  USAGE_DATA: 'covergen_usage',
} as const;

// Anonymous usage tracking interface
export interface AnonymousUsage {
  monthKey: string;
  count: number;
  lastUsed: string;
  anonymousId: string;
}

// Get anonymous usage from localStorage
export function getAnonymousUsage(): AnonymousUsage | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USAGE_DATA);
    if (!data) return null;
    
    const usage = JSON.parse(data) as AnonymousUsage;
    const currentMonth = getCurrentMonthKey();
    
    // Reset if new month
    if (usage.monthKey !== currentMonth) {
      return null;
    }
    
    return usage;
  } catch {
    return null;
  }
}

// Update anonymous usage in localStorage
export function updateAnonymousUsage(anonymousId: string): AnonymousUsage {
  const currentMonth = getCurrentMonthKey();
  const existingUsage = getAnonymousUsage();
  
  const usage: AnonymousUsage = {
    monthKey: currentMonth,
    count: existingUsage ? existingUsage.count + 1 : 1,
    lastUsed: new Date().toISOString(),
    anonymousId,
  };
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.USAGE_DATA, JSON.stringify(usage));
  }
  
  return usage;
}

// Check if user has reached free tier limit
export function hasReachedFreeLimit(usage: AnonymousUsage | null): boolean {
  if (!usage) return false;
  return usage.count >= FREE_TIER_LIMITS.MONTHLY_COVERS;
}

// Get remaining free covers
export function getRemainingFreeCovers(usage: AnonymousUsage | null): number {
  if (!usage) return FREE_TIER_LIMITS.MONTHLY_COVERS;
  return Math.max(0, FREE_TIER_LIMITS.MONTHLY_COVERS - usage.count);
}