import { unlink } from 'fs/promises';
import { join } from 'path';

export async function deleteFile(
  filename: string | null | undefined,
): Promise<void> {
  if (!filename) return;
  const filePath = join(process.cwd(), 'public', filename);
  try {
    await unlink(filePath);
  } catch {
    // File may not exist — non-critical
  }
}

export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE_LIMIT = 10;

export function clampLimit(limit?: number): number {
  const val = limit ?? DEFAULT_PAGE_LIMIT;
  return Math.min(Math.max(val, 1), MAX_PAGE_LIMIT);
}

export const encodeBase64 = (value: string) =>
  Buffer.from(value).toString('base64');

export const decodeBase64 = (value: string) =>
  Buffer.from(value, 'base64').toString('utf-8');
