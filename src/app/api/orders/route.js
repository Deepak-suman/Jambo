import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/getTenant";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const restaurantId = await getTenantId(req);
    const { tableNumber, customerName, cartItems, restaurantId: bodyRestaurantId } = await req.json();
    
    // allow restaurantId from either getTenantId or explicit body payload
    const finalRestaurantId = restaurantId || bodyRestaurantId;
    
    if (!finalRestaurantId) {
      return NextResponse.json({ error: "Tenant not identified. Missing restaurant context." }, { status: 400 });
    }

    // Calculate total amount for new items
    const newItemsTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Check if table already has an unpaid "Active" order (can be PREPARING or COMPLETED but not closed)
    let existingOrder = await prisma.order.findFirst({
      where: { 
        tableNumber: parseInt(tableNumber), 
        isPaid: false,
        status: { not: "CLOSED" },
        restaurantId: finalRestaurantId
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
          restaurantId: finalRestaurantId,
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

export async function GET(req) {
  try {
    const restaurantId = await getTenantId(req);
    if (!restaurantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Database se saare orders uthao jo abhi active/preparing/completed hain (closed nahi hain)
    const orders = await prisma.order.findMany({
      where: { 
        status: { not: "CLOSED" },
        restaurantId 
      },
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