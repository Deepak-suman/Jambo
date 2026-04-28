import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/uploadFile";
import { getTenantId } from "@/lib/getTenant";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const restaurantId = await getTenantId(req);
    if (!restaurantId) {
      return NextResponse.json({ error: "Tenant not identified" }, { status: 400 });
    }

    const items = await prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { category: "asc" }
    });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("GET Menu Error:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const restaurantId = await getTenantId(req);
    if (!restaurantId) {
      return NextResponse.json({ error: "Unauthorized or Tenant not identified" }, { status: 401 });
    }

    const formData = await req.formData();

    const name = formData.get("name");
    const price = formData.get("price");
    const category = formData.get("category");
    const isAvailable = formData.get("isAvailable") === "true";
    const halfPriceRaw = formData.get("halfPrice");
    const imageFile = formData.get("image");

    if (!name || !price || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let imageUrl = null;
    if (imageFile && typeof imageFile === "object") {
        imageUrl = await saveUploadedFile(imageFile);
    } else if (imageFile && typeof imageFile === 'string' && imageFile.startsWith('http')) {
        imageUrl = imageFile;
    }

    const halfPrice = halfPriceRaw && !isNaN(parseFloat(halfPriceRaw))
      ? parseFloat(halfPriceRaw)
      : null;

    const newItem = await prisma.menuItem.create({
      data: {
        name,
        price: parseFloat(price),
        halfPrice,
        image: imageUrl,
        category,
        isAvailable,
        restaurantId, // Add to schema
      }
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("POST Menu Error:", error);
    return NextResponse.json({ error: "Failed to add menu item" }, { status: 500 });
  }
}
