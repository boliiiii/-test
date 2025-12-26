import { GoogleGenAI, Type } from "@google/genai";
import { PhotoStyle, ImageSize, ParseMenuResponse } from "../types";

// Helper to get a fresh client instance to ensure latest API key is used
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseMenuText = async (menuText: string): Promise<ParseMenuResponse> => {
  const ai = getAiClient();
  const prompt = `Extract a list of dishes from the following menu text. For each dish, provide a 'name' and a short visual 'description' suitable for an image generator. If the description is missing in the text, infer a tasty one based on the name.
  
  Menu Text:
  ${menuText}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dishes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["name", "description"],
            },
          },
        },
        required: ["dishes"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  return JSON.parse(text) as ParseMenuResponse;
};

export const generateDishImage = async (
  dishName: string,
  dishDescription: string,
  style: PhotoStyle,
  size: ImageSize
): Promise<string> => {
  const ai = getAiClient();
  
  let stylePrompt = "";
  switch (style) {
    case PhotoStyle.RUSTIC:
      stylePrompt = "Rustic aesthetic, dark moody lighting, wooden table texture, chiaroscuro, warm tones, professional culinary photography, 85mm lens.";
      break;
    case PhotoStyle.BRIGHT:
      stylePrompt = "Bright and modern aesthetic, high-key lighting, clean white or marble background, sharp focus, minimalist, vibrant colors, commercial food photography.";
      break;
    case PhotoStyle.SOCIAL:
      stylePrompt = "Social media aesthetic, flat lay, top-down view, trendy plating, perfect lighting for Instagram, high saturation, sharp details.";
      break;
  }

  const prompt = `Professional food photography of ${dishName}: ${dishDescription}. ${stylePrompt} Highly detailed, appetizing, 8k resolution.`;

  // Using gemini-3-pro-image-preview for high quality generation
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: style === PhotoStyle.SOCIAL ? "4:5" : "4:3", // 4:5 is better for social/vertical
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};

export const editDishImage = async (
  imageBase64: string,
  editInstruction: string
): Promise<string> => {
  const ai = getAiClient();
  
  // Clean base64 string
  const base64Data = imageBase64.split(',')[1];
  const mimeType = imageBase64.split(';')[0].split(':')[1] || 'image/png';

  // Using gemini-2.5-flash-image for editing as requested
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: editInstruction,
        },
      ],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No edited image returned");
};
