import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const platformSizes = {
  none: { width: undefined, height: undefined, label: 'No Platform (Pure Prompt)' },
  youtube: { width: 1280, height: 720, label: 'YouTube' },
  twitter: { width: 1200, height: 675, label: 'Twitter' },
  instagram: { width: 1080, height: 1080, label: 'Instagram' },
  facebook: { width: 1200, height: 630, label: 'Facebook' },
  linkedin: { width: 1200, height: 627, label: 'LinkedIn' },
  tiktok: { width: 1080, height: 1920, label: 'TikTok' },
  spotify: { width: 1400, height: 1400, label: 'Spotify' },
  rednote: { width: 1080, height: 1350, label: 'Rednote (小红书)' },
  wechat: { width: 1080, height: 1260, label: 'WeChat 视频号' },
  bilibili: { width: 1920, height: 1080, label: 'Bilibili' },
  twitch: { width: 1200, height: 600, label: 'Twitch' }
} as const

export const styleTemplates = [
  { id: 'tech', name: 'Tech/Gaming', preview: '/templates/tech.jpg' },
  { id: 'lifestyle', name: 'Lifestyle', preview: '/templates/lifestyle.jpg' },
  { id: 'minimal', name: 'Minimal', preview: '/templates/minimal.jpg' },
  { id: 'cartoon', name: 'Cartoon', preview: '/templates/cartoon.jpg' },
  { id: 'cyberpunk', name: 'Cyberpunk', preview: '/templates/cyberpunk.jpg' },
  { id: 'guochao', name: 'Chinese Style', preview: '/templates/guochao.jpg' }
] as const

export type Platform = keyof typeof platformSizes
export type StyleTemplate = typeof styleTemplates[number]['id']