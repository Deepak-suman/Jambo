import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  try {
    const { id, itemId } = await params;
    const pOrderId = parseInt(id);
    const pItemId = parseInt(itemId);

    // Fetch the order and item
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: pItemId },
      include: { menuItem: true, order: true }
    });

    if (!orderItem || orderItem.orderId !== pOrderId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if within 30 seconds
    const timeDiff = Date.now() - new Date(orderItem.addedAt).getTime();
    if (timeDiff > 30000) {
      return NextResponse.json({ error: "Time window expired" }, { status: 400 });
    }

    // Recalculate price
    const itemPrice = orderItem.size === 'Half' && orderItem.menuItem.halfPrice 
      ? orderItem.menuItem.halfPrice 
      : orderItem.menuItem.price;
    const reductionAmount = itemPrice * orderItem.quantity;

    // Delete item and update total amount transactionally
    await prisma.$transaction([
      prisma.orderItem.delete({ where: { id: pItemId } }),
      prisma.order.update({
        where: { id: pOrderId },
        data: { totalAmount: { decrement: reductionAmount } }
      })
    ]);

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Item Error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id, itemId } = await params;
    const pOrderId = parseInt(id);
    const pItemId = parseInt(itemId);
    const { quantity } = await req.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: pItemId },
      include: { menuItem: true, order: true }
    });

    if (!orderItem || orderItem.orderId !== pOrderId) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const timeDiff = Date.now() - new Date(orderItem.addedAt).getTime();
    if (timeDiff > 30000) {
      return NextResponse.json({ error: "Time window expired" }, { status: 400 });
    }

    const itemPrice = orderItem.size === 'Half' && orderItem.menuItem.halfPrice 
      ? orderItem.menuItem.halfPrice 
      : orderItem.menuItem.price;

    const oldTotal = itemPrice * orderItem.quantity;
    const newTotal = itemPrice * quantity;
    const amountDifference = newTotal - oldTotal;

    await prisma.$transaction([
      prisma.orderItem.update({
        where: { id: pItemId },
        data: { quantity }
      }),
      prisma.order.update({
        where: { id: pOrderId },
        data: { totalAmount: { increment: amountDifference } }
      })
    ]);

    return NextResponse.json({ message: "Item updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Update Item Error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
