import { promises as fs } from "fs";
import path from "path";

export async function saveUploadedFile(file) {
  if (!file || typeof file === 'string') return null;

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // root/uploads directory
    const uploadDir = path.join(process.cwd(), "uploads");

    // ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${uniquePrefix}-${safeName}`;
    
    const filePath = path.join(uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    // Return the relative path to be served via API route
    return `/api/uploads/${filename}`;
  } catch (error) {
    console.error("File save error:", error);
    return null;
  }
}
