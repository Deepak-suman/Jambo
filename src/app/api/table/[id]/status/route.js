import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/getTenant";

export async function GET(req, { params }) {
  try {
    const restaurantId = await getTenantId(req);
    if (!restaurantId) return NextResponse.json({ error: "Missing restaurant context" }, { status: 400 });

    const { id } = await params;
    const tableNumber = parseInt(id);

    const activeOrder = await prisma.order.findFirst({
      where: { 
        restaurantId,
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
