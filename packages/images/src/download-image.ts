const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 15_000;

export interface DownloadedImage {
  buffer: Buffer;
  contentType: string;
}

export interface DownloadImageOptions {
  maxBytes?: number;
  timeoutMs?: number;
}

/**
 * Downloads an image over HTTP(S) and returns its bytes plus a normalized
 * (lowercased, parameter-stripped) content type.
 *
 * Throws a plain `Error` on failure — never an HTTP exception — so callers can
 * translate it into their own error type (e.g. NestJS `BadRequestException`).
 */
export async function downloadImage(
  url: string,
  options: DownloadImageOptions = {},
): Promise<DownloadedImage> {
  const maxBytes = options.maxBytes ?? MAX_DOWNLOAD_BYTES;
  const timeoutMs = options.timeoutMs ?? DOWNLOAD_TIMEOUT_MS;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid image URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https image URLs are supported');
  }

  const response = await fetch(parsed.toString(), {
    redirect: 'follow',
    headers: { Accept: 'image/*' },
    signal: AbortSignal.timeout(timeoutMs),
  }).catch(() => {
    throw new Error('Could not download the image from the URL');
  });

  if (!response.ok) {
    throw new Error(`Failed to download the image (HTTP ${response.status})`);
  }

  const rawContentType = response.headers.get('content-type') ?? '';
  const contentType = rawContentType.split(';')[0].trim().toLowerCase();
  if (!contentType.startsWith('image/')) {
    throw new Error('Downloaded content is not an image');
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > maxBytes) {
    throw new Error('Image is too large');
  }

  return { buffer, contentType };
}
