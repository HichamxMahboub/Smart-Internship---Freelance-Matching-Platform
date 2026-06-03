import { API_BASE_URL } from '../config/env';

/** Resolve relative upload paths to absolute URLs for images served by the API host. */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url?.trim()) return undefined;
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return trimmed.startsWith('/') ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}
