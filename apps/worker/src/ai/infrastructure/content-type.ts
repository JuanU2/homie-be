export const ContentType = {
  TEXT: 'text',
  IMAGE: 'image',
  DOCUMENT: 'document',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];
