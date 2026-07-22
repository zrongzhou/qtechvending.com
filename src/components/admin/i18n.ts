/**
 * Shared translation helper for the admin console. Falls back to the raw key
 * when a translation is missing so the UI never crashes (it just shows the key).
 * `en.json` is the source of truth for admin keys.
 */
import en from '@/messages/en.json';

export const t = (k: string): string => (en as Record<string, string>)[k] || k;
