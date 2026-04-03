import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Sirf /admin waale routes ko check karo
  if (path.startsWith('/admin')) {
    // Agar user already login page pe hai, toh check mat karo
    if (path === '/admin/login') {
      return NextResponse.next();
    }

    // Browser cookies se token nikalo
    const token = request.cookies.get('auth-token')?.value;

    // Agar token nahi hai, toh login pe bhej do
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Token verify karo .env ki secret key se
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "my_super_secret_key_1234567890");
      await jwtVerify(token, secret);
      
      // Token sahi hai, aage jaane do
      return NextResponse.next();
    } catch (error) {
      // Token expire ho gaya ya galat hai, login pe bhej do
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  // Customer pages (/menu) ke liye kuch mat roko
  return NextResponse.next();
}

// Ye config batati hai ki middleware kis URL par chalega
export const config = {
  matcher: ['/admin/:path*'],
};