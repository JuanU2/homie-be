export const ContentType = {
  TEXT: 'text',
  IMAGE: 'image',
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];
