import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin Access only." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: { isActive },
      select: {
          id: true,
          name: true,
          isActive: true
      }
    });

    return NextResponse.json(updatedRestaurant, { status: 200 });
  } catch (error) {
    console.error("Super Admin Status Update Error:", error);
    return NextResponse.json({ error: "Failed to update restaurant status" }, { status: 500 });
  }
}
