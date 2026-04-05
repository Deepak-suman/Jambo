import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { saveUploadedFile } from "@/lib/uploadFile";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    
    const name = formData.get("name");
    const priceRaw = formData.get("price");
    const category = formData.get("category");
    const isAvailableRaw = formData.get("isAvailable");
    const halfPriceRaw = formData.get("halfPrice");
    const imageFile = formData.get("image");

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (priceRaw) dataToUpdate.price = parseFloat(priceRaw);
    if (category) dataToUpdate.category = category;
    if (isAvailableRaw !== null) dataToUpdate.isAvailable = isAvailableRaw === "true";
    
    if (halfPriceRaw !== null) {
        dataToUpdate.halfPrice = halfPriceRaw && !isNaN(parseFloat(halfPriceRaw)) ? parseFloat(halfPriceRaw) : null;
    }

    if (imageFile && imageFile.name) {
       dataToUpdate.image = await saveUploadedFile(imageFile);
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const existingOrders = await prisma.orderItem.count({
      where: { menuItemId: parsedId }
    });

    if (existingOrders > 0) {
      return NextResponse.json({ 
        error: "Is item ki pehle se order history maujood hai isliye ise permanently delete nahi kiya ja sakta. Kripya isko edit karke 'Out of Stock' (Available = False) mark kar dein." 
      }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: { id: parsedId }
    });

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}