// Triggering redeploy for Razorpay and Forgot Password updates
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!dbOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!process.env.RAZOR_KEY || !process.env.RAZOR_SECRET_KEY) {
      return NextResponse.json({ error: "Razorpay API credentials are not set on the server." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZOR_KEY,
      key_secret: process.env.RAZOR_SECRET_KEY,
    });

    const amountInPaise = Math.round(dbOrder.totalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${dbOrder.id}`,
    };

    const rzpOrder = await razorpay.orders.create(options);

    await prisma.order.update({
      where: { id: dbOrder.id },
      data: { razorpayOrderId: rzpOrder.id }
    });

    return NextResponse.json({
      id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: process.env.RAZOR_KEY,
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
