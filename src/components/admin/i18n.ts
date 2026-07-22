/**
 * Shared translation helper for the admin console. Falls back to the raw key
 * when a translation is missing so the UI never crashes (it just shows the key).
 * 后台默认使用中文翻译（zh.json）。
 */
import zh from '@/messages/zh.json';

export const t = (k: string): string => (zh as Record<string, string>)[k] || k;
