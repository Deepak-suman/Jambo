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

    // Pehle check karein ki kya is item se jude koi purane orders hain
    // Agar hain, toh direct delete karne se error aa sakti hai. 
    // Is simplified version me hum direct delete kar rahe hain.
    await prisma.menuItem.delete({
      where: { id: parsedId }
    });

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}