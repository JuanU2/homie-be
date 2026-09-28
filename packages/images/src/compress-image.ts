import sharp from 'sharp';

const COMPRESSION_THRESHOLD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 2048;
const JPEG_QUALITY = 80;
const WEBP_QUALITY = 80;

export interface CompressedImage {
  buffer: Buffer;
  contentType: string;
}

/**
 * Compresses an image that exceeds 5MB by resizing it to at most 2048px on the
 * long edge and re-encoding it. Smaller images are returned untouched, and any
 * failure to process the input (or a compression that does not shrink it) falls
 * back to the original buffer.
 *
 * JPEG, HEIC and unknown formats are re-encoded as JPEG; PNG and WebP keep
 * their format; animated GIFs are left untouched.
 */
export async function compressImage(
  input: Buffer,
  contentType: string,
): Promise<CompressedImage> {
  const normalized = contentType.toLowerCase();

  if (input.byteLength <= COMPRESSION_THRESHOLD_BYTES) {
    return { buffer: input, contentType: normalized };
  }

  try {
    const pipeline = sharp(input).rotate().resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: 'inside',
      withoutEnlargement: true,
    });

    let buffer: Buffer;
    let outputContentType = normalized;

    if (normalized === 'image/png') {
      buffer = await pipeline
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
    } else if (normalized === 'image/webp') {
      buffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    } else if (normalized === 'image/gif') {
      return { buffer: input, contentType: normalized };
    } else {
      buffer = await pipeline
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();
      outputContentType = 'image/jpeg';
    }

    if (buffer.byteLength >= input.byteLength) {
      return { buffer: input, contentType: normalized };
    }

    return { buffer, contentType: outputContentType };
  } catch {
    return { buffer: input, contentType: normalized };
  }
}
