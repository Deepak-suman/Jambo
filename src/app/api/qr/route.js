import { NextResponse } from "next/server";
import { generateQRForTable } from "@/lib/qrGenerator";

export async function POST(req) {
  try {
    const { tableNumber } = await req.json();

    if (!tableNumber) {
      return NextResponse.json({ error: "Table number is required" }, { status: 400 });
    }

    // Assuming we're picking up host from the request headers to support dynamic host/port
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const baseUrl = `${protocol}://${host}`;

    const qrDataUrl = await generateQRForTable(tableNumber, baseUrl);

    return NextResponse.json({ tableNumber, qrDataUrl }, { status: 200 });
  } catch (error) {
    console.error("QR POST Route Error:", error);
    return NextResponse.json({ error: "Failed to generate QR" }, { status: 500 });
  }
}
