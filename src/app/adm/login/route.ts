import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (process.env.ADMIN_ENABLED !== "true") {
    return NextResponse.json({ error: "Admin not enabled" }, { status: 403 });
  }

  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  if (!adminPassword) {
    return NextResponse.json({ success: true });
  }

  try {
    const body = await request.json();
    const provided = (body.password || "").trim();

    if (provided === adminPassword) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
