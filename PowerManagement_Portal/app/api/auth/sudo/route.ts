import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sign } from "jsonwebtoken";

const SUDO_PASSWORD = process.env.SUDOPASSWORD || "sudopassword";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password === SUDO_PASSWORD) {
      // Create a JWT token with sudo privileges
      const token = sign(
        { 
          role: "sudo",
          exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
        },
        JWT_SECRET
      );

      // Set the cookie
      (await cookies()).set("sudo_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      return NextResponse.json(
        { message: "Sudo access granted" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Invalid sudo password" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}