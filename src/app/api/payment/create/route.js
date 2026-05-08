// Hybrid Payment Gateway — Smart Selection (Free=Admin, Paid=Vendor)
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  try {
    const { orderId } = await req.json();

    // Fetch order with restaurant details (for gateway selection)
    const dbOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            plan: true,
            razorpayKeyId: true,
            razorpayKeySecret: true,
            platformFee: true,
            commissionPercent: true,
            gstPercent: true,
          }
        }
      }
    });

    if (!dbOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const restaurant = dbOrder.restaurant;

    // --- SMART GATEWAY SELECTION ---
    let keyId, keySecret, gatewayType;

    if (restaurant.plan === "PAID" && restaurant.razorpayKeyId && restaurant.razorpayKeySecret) {
      // PAID Plan → Use Vendor's own Razorpay credentials
      keyId = restaurant.razorpayKeyId;
      keySecret = restaurant.razorpayKeySecret;
      gatewayType = "VENDOR";
    } else {
      // FREE Plan → Use Admin/Platform Razorpay credentials
      keyId = process.env.RAZOR_KEY;
      keySecret = process.env.RAZOR_SECRET_KEY;
      gatewayType = "ADMIN";
    }

    if (!keyId || !keySecret) {
      return NextResponse.json({ 
        error: gatewayType === "VENDOR" 
          ? "Vendor Razorpay credentials are incomplete. Contact support." 
          : "Platform Razorpay credentials are not configured on the server." 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Calculate charges
    let baseAmount = dbOrder.totalAmount;
    let platformFee = restaurant.platformFee || 0;
    let commissionAmount = baseAmount * ((restaurant.commissionPercent || 0) / 100);
    let subtotalWithCharges = baseAmount + platformFee + commissionAmount;
    let gstAmount = subtotalWithCharges * ((restaurant.gstPercent || 0) / 100);
    let finalAmount = subtotalWithCharges + gstAmount;

    const amountInPaise = Math.round(finalAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${dbOrder.id}`,
      notes: {
        orderId: dbOrder.id,
        restaurantId: restaurant.id,
        gatewayType: gatewayType,
        baseAmount: baseAmount.toFixed(2),
        platformFee: platformFee.toFixed(2),
        commission: commissionAmount.toFixed(2),
        gst: gstAmount.toFixed(2),
      }
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
      key: keyId,
      gatewayType,
      restaurantName: restaurant.name,
      // Charges breakdown for frontend display
      charges: {
        baseAmount,
        platformFee,
        commissionAmount: parseFloat(commissionAmount.toFixed(2)),
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        finalAmount: parseFloat(finalAmount.toFixed(2)),
      }
    });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 });
  }
}
