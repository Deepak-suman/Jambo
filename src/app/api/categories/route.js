import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const name = formData.get("name");
    const imageText = formData.get("imageText");

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    // On Vercel, local filesystem is read-only. 
    // We only support emoji/text icons (no file upload).
    const iconPath = imageText || null;

    const category = await prisma.category.create({
      data: {
        name,
        icon: iconPath
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }
    console.error("POST category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
