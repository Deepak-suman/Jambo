import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Mark order as paid
    await prisma.order.update({
      where: { id: orderId },
      data: { isPaid: true }
    });

    return NextResponse.json({ success: true, message: "Payment recorded successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
