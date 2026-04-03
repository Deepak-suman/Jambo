import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const tableNumber = parseInt(id);

    const activeOrder = await prisma.order.findFirst({
      where: { 
        tableNumber: tableNumber, 
        status: { in: ["ACTIVE", "PREPARING", "COMPLETED"] }
      }
    });

    if (activeOrder) {
      if (activeOrder.isPaid || activeOrder.isBillRequested) {
        return NextResponse.json({
          hasActiveOrder: true,
          isBlocked: true,
          orderId: activeOrder.id,
          customerName: activeOrder.customerName
        }, { status: 200 });
      }

      return NextResponse.json({ 
        hasActiveOrder: true, 
        orderId: activeOrder.id,
        customerName: activeOrder.customerName
      }, { status: 200 });
    }

    return NextResponse.json({ hasActiveOrder: false }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch table status" }, { status: 500 });
  }
}
