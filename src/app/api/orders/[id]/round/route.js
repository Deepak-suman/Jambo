import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Order ke kisi specific round ko complete mark karne ke liye
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const orderId = id;
    const { roundNumber } = await req.json();

    if (!roundNumber || isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // Update all items in this order that belong to this round
    await prisma.orderItem.updateMany({
      where: { 
        orderId: orderId,
        roundNumber: parseInt(roundNumber)
      },
      data: { status: "COMPLETED" }
    });

    // Check if ALL items in this order are now COMPLETED
    const remainingPendingItems = await prisma.orderItem.count({
      where: {
        orderId: orderId,
        status: "PENDING"
      }
    });

    if (remainingPendingItems === 0) {
      // Mark the entire order as COMPLETED
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" }
      });
    }

    return NextResponse.json({ success: true, allCompleted: remainingPendingItems === 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update round status" }, { status: 500 });
  }
}
