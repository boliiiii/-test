export interface Dish {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isGenerating: boolean;
  isEditing: boolean;
}

export enum PhotoStyle {
  RUSTIC = 'Rustic/Dark',
  BRIGHT = 'Bright/Modern',
  SOCIAL = 'Social Media (Top-down)',
}

export type ImageSize = '1K' | '2K' | '4K';

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

export interface ParseMenuResponse {
  dishes: { name: string; description: string }[];
}