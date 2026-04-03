import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    // Check credentials from .env
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      // Secret key ko format karein
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      
      // JWT Token banayein (8 ghante ke liye valid)
      const token = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("8h")
        .sign(secret);

      // Response banayein aur HTTP-only cookie set karein
      const response = NextResponse.json({ success: true }, { status: 200 });
      response.cookies.set({
        name: "admin_token",
        value: token,
        httpOnly: true, // Client-side JS isko read nahi kar sakta (Secure against XSS)
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8, // 8 hours
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}