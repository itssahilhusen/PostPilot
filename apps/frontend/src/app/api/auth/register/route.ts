import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createStoreUser, findUserByEmail } from "@/lib/auth-store";

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

    // 1. Try DB first
    try {
      const existingUser = await (prisma.user as any).findUnique({
        where: { email: cleanEmail },
      });

      if (existingUser) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }

      // Check or create workspace
      let workspace = await prisma.workspace.findFirst();
      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: `${cleanName}'s Workspace`,
            handle: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-ws`,
          },
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await (prisma.user as any).create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: passwordHash,
          role: "OWNER",
          workspaceId: workspace.id,
          image: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    } catch (dbErr) {
      // 2. Fallback to auth local store if DB is offline
      const existingInStore = findUserByEmail(cleanEmail);
      if (existingInStore) {
        return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      }

      const storeUser = createStoreUser({
        name: cleanName,
        email: cleanEmail,
        password,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: storeUser.id,
          name: storeUser.name,
          email: storeUser.email,
        },
      });
    }
  } catch (err: any) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}
