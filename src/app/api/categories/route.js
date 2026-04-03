import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import path from "path";
import { existsSync, mkdirSync } from "fs";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" } // Puraane pehle
    });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const imageText = formData.get("imageText"); // if any text icon was chosen
    const file = formData.get("image"); // file upload
    
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    let iconPath = imageText || null;

    if (file && file !== "undefined" && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "uploads");
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const fileName = `${Date.now()}-${file.name.replace(/\\s+/g, "_")}`;
      const filePath = path.join(uploadDir, fileName);

      // Save file
      await writeFile(filePath, buffer);
      iconPath = `/api/uploads/${fileName}`;
    }

    const category = await prisma.category.create({
      data: {
        name,
        icon: iconPath
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    // Handling Unique Constraint Error
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
