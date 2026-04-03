import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { tableNumber, customerName, cartItems } = await req.json();

    // Calculate total amount for new items
    const newItemsTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Check if table already has an unpaid "Active" order (can be PREPARING or COMPLETED but not closed)
    let existingOrder = await prisma.order.findFirst({
      where: { 
        tableNumber: parseInt(tableNumber), 
        isPaid: false,
        status: { not: "CLOSED" }
      },
      include: { items: true }
    });

    if (existingOrder) {
      // Find the highest round number currently in the order
      const currentMaxRound = existingOrder.items.reduce(
        (max, item) => (item.roundNumber > max ? item.roundNumber : max), 
        0
      );
      const nextRound = currentMaxRound + 1;

      // Add items to existing order and reset flow
      await prisma.order.update({
        where: { id: existingOrder.id },
        data: { 
          totalAmount: existingOrder.totalAmount + newItemsTotal,
          status: "ACTIVE",
          isBillRequested: false,
          isBillApproved: false,
          paymentMode: null
        }
      });

      // Insert new items
      for (const item of cartItems) {
        await prisma.orderItem.create({
          data: { 
            orderId: existingOrder.id, 
            menuItemId: item.id, 
            quantity: item.quantity,
            size: item.size || "Full",
            roundNumber: nextRound
          }
        });
      }
      return NextResponse.json({ message: "Items added to existing order!", orderId: existingOrder.id }, { status: 200 });

    } else {
      // Create fresh order
      const newOrder = await prisma.order.create({
        data: {
          tableNumber: parseInt(tableNumber),
          customerName,
          totalAmount: newItemsTotal,
          items: {
            create: cartItems.map(item => ({
              menuItemId: item.id,
              quantity: item.quantity,
              size: item.size || "Full"
            }))
          }
        }
      });
      return NextResponse.json({ message: "New order placed!", orderId: newOrder.id }, { status: 201 });
    }
  } catch (error) {
    console.error("Order Poster Error:", error);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Database se saare orders uthao jo abhi active/preparing/completed hain (closed nahi hain)
    const orders = await prisma.order.findMany({
      where: { status: { not: "CLOSED" } },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            menuItem: true, // Saath mein menu item ka naam aur price bhi laao
          },
        },
      },
    });

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}