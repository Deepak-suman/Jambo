import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin Access only." }, { status: 403 });
    }

    // Fetch all restaurants and count their orders
    const restaurants = await prisma.restaurant.findMany({
      include: {
        _count: {
          select: { orders: true, menuItems: true }
        },
        users: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Formatting response to be dashboard friendly
    const payload = restaurants.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      isActive: r.isActive,
      vendorName: r.users[0]?.name || "Unassigned",
      vendorEmail: r.users[0]?.email || "Unknown",
      totalOrders: r._count.orders,
      totalItems: r._count.menuItems,
      createdAt: r.createdAt
    }));

    // Generate basic platform stats
    const totalVendors = await prisma.user.count({ where: { role: "VENDOR" }});
    const platformOrders = await prisma.order.count();
    
    return NextResponse.json({ 
       stats: { totalVendors, totalRestaurants: restaurants.length, platformOrders },
       restaurants: payload 
    });

  } catch (error) {
    console.error("Super Admin Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
