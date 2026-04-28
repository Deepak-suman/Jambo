import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const cid = id;
    
    // Fetch to see if it has an icon
    const category = await prisma.category.findUnique({ where: { id: cid } });
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    // delete image file from disk if it was uploaded
    if (category.icon && category.icon.startsWith("/api/uploads/")) {
       const fileName = category.icon.split("/").pop();
       const filePath = path.join(process.cwd(), "uploads", fileName);
       if (fs.existsSync(filePath)) {
         fs.unlinkSync(filePath);
       }
    }

    // Since we're not using relational FK for category across MenuItem table directly, delete is safe.
    // Menu items hold string references to 'name', which might detach.
    // It is up to admin to update those menu items if needed.
    await prisma.category.delete({ where: { id: cid } });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
