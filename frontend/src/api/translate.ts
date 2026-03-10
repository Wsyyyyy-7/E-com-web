import { getAPIBaseURL } from '../lib/config';

const cache = new Map<string, string>();

export function hasCJK(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  return /[\u4e00-\u9fff]/.test(text);
}

export async function translateToEnglish(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const key = text.trim();
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  try {
    const base = getAPIBaseURL();
    const res = await fetch(`${base}/api/v1/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: key }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = (data && data.translated) ? data.translated : text;
    cache.set(key, translated);
    return translated;
  } catch {
    return text;
  }
}
