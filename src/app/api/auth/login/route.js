import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Simple auth check (use env vars)
    const adminUsername = process.env.ADMIN_USERNAME || "admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "supersecretpassword";

    if (username === adminUsername && password === adminPassword) {
      // Create JWT token
      const token = jwt.sign(
        { username, role: "admin" },
        process.env.JWT_SECRET || "my_super_secret_key_1234567890",
        { expiresIn: "1h" }
      );

      // Set cookie
      const response = NextResponse.json({ success: true, message: "Login successful" });
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600, // 1 hour
      });

      return response;
    } else {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}