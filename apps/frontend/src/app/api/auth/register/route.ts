import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name || cleanEmail.split("@")[0]).trim();

    const res = await auth.api.signUpEmail({
      body: {
        name: cleanName,
        email: cleanEmail,
        password,
      },
    });

    return NextResponse.json({
      success: true,
      user: res.user,
    });
  } catch (err: any) {
    console.error("POST /api/auth/register error:", err);
    const msg = err?.body?.message || err?.message || "Failed to create account";
    const status = msg.toLowerCase().includes("exist") ? 409 : 400;
    return NextResponse.json({ error: msg }, { status });
  }
}
