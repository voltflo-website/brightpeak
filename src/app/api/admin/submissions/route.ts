import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SUBMISSIONS_FILE = path.join(process.cwd(), "data", "contact-submissions.json");

function loadSubmissions(): any[] {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveSubmissions(submissions: any[]) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

function checkAuth(req: NextRequest): boolean {
  const pw = req.headers.get("x-admin-password") || "";
  return pw === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const submissions = loadSubmissions();
  return NextResponse.json({ submissions });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, action } = await req.json();
    const submissions = loadSubmissions();
    const idx = submissions.findIndex((s: any) => s.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (action === "markRead") {
      submissions[idx].read = true;
    } else if (action === "markUnread") {
      submissions[idx].read = false;
    } else if (action === "delete") {
      submissions.splice(idx, 1);
    }
    saveSubmissions(submissions);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
