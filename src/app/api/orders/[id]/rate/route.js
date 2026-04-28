import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const orderId = id;

    const data = await req.json();
    const { foodTaste, service, cleanliness, chef, staff, seatingComfort } = data;

    // Ensure the order exists
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Rate only once
    const existingRating = await prisma.orderRating.findUnique({ where: { orderId } });
    if (existingRating) {
      return NextResponse.json({ error: "Rating already submitted" }, { status: 400 });
    }

    // Save rating
    const rating = await prisma.orderRating.create({
      data: {
        orderId,
        foodTaste: parseInt(foodTaste) || 0,
        service: parseInt(service) || 0,
        cleanliness: parseInt(cleanliness) || 0,
        chef: parseInt(chef) || 0,
        staff: parseInt(staff) || 0,
        seatingComfort: parseInt(seatingComfort) || 0,
      }
    });

    return NextResponse.json({ message: "Rating submitted successfully!", rating }, { status: 201 });
  } catch (error) {
    console.error("Submit Rating Error:", error);
    return NextResponse.json({ error: "Failed to submit rating" }, { status: 500 });
  }
}
