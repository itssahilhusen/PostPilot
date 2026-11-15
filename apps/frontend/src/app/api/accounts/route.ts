import { NextRequest, NextResponse } from "next/server";
import { rawPrisma } from "@/lib/prisma";
import { getPostWorkspace } from "@/lib/post-api";

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const accounts = await rawPrisma.socialAccount.findMany({ where: { workspaceId }, orderBy: { createdAt: "desc" }, select: {
      id: true, provider: true, name: true, handle: true, avatar: true, status: true, expiresAt: true, createdAt: true, updatedAt: true, accessToken: true,
    } });
    return NextResponse.json({ accounts: accounts.map(({ accessToken, ...account }) => ({
      ...account,
      status: accessToken ? account.status : "disconnected",
    })) });
  } catch (error) {
    console.error("GET /api/accounts failed", error);
    return NextResponse.json({ error: "Could not load accounts" }, { status: 500 });
  }
}

// Accounts must be created by a verified platform OAuth callback, not by client input.
export async function POST(req: NextRequest) {
  try {
    if (!await getPostWorkspace(req)) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    return NextResponse.json({ error: "Connect this account through its platform authorization flow" }, { status: 501 });
  } catch (error) {
    console.error("POST /api/accounts failed", error);
    return NextResponse.json({ error: "Could not connect account" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const workspaceId = await getPostWorkspace(req);
    if (!workspaceId) return NextResponse.json({ error: "Authentication and workspace required" }, { status: 401 });
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    const result = await rawPrisma.socialAccount.deleteMany({ where: { id, workspaceId } });
    if (!result.count) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/accounts failed", error);
    return NextResponse.json({ error: "Could not disconnect account" }, { status: 500 });
  }
}
