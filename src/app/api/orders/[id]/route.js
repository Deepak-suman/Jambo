import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Order ka status update karne ke liye (PATCH request)
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const parsedId = id;
    const { status, isBillRequested, isBillApproved, paymentMode } = await req.json();

    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (isBillRequested !== undefined) dataToUpdate.isBillRequested = isBillRequested;
    if (isBillApproved !== undefined) dataToUpdate.isBillApproved = isBillApproved;
    if (paymentMode !== undefined) dataToUpdate.paymentMode = paymentMode;

    const updatedOrder = await prisma.order.update({
      where: { id: parsedId },
      data: dataToUpdate
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
  }
}

// Single order ki detail laane ke liye (Customer tracking ke liye)
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const parsedId = id;
    const order = await prisma.order.findUnique({
      where: { id: parsedId },
      include: { items: { include: { menuItem: true } } }
    });
    
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}