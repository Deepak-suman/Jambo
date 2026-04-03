import { promises as fs } from "fs";
import path from "path";

export async function saveUploadedFile(file) {
  if (!file || typeof file === 'string') return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Instead of saving to disk, return a Base64 string (Data URL)
    const base64Data = buffer.toString('base64');
    const mimeType = file.type || "image/jpeg";
    
    // Return standard Data URL format
    return `data:${mimeType};base64,${base64Data}`;
  } catch (error) {
    console.error("File processing error:", error);
    return null;
  }
}
