import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { VALID_FILES } from "../config";
import { ensureDataFiles } from "../schema";

export function createAdminHandler(dataBaseDir: string) {
  function toApiKey(fullPath: string): string {
    if (fullPath.startsWith("home/")) return fullPath.replace("home/", "");
    return fullPath;
  }

  function toFullPath(apiKey: string): string | null {
    if (VALID_FILES.includes(apiKey)) return apiKey;
    const homePath = "home/" + apiKey;
    if (VALID_FILES.includes(homePath)) return homePath;
    return null;
  }

  function isAdminEnabled(): boolean {
    return process.env.ADMIN_ENABLED === "true";
  }

  function checkAuth(request: NextRequest): boolean {
    if (!isAdminEnabled()) return false;
    const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
    if (!adminPassword) return true;
    const provided = (
      request.headers.get("x-admin-password") ||
      new URL(request.url).searchParams.get("pw") ||
      ""
    ).trim();
    return provided === adminPassword;
  }

  function readJsonFile(filePath: string): { data: unknown; error?: string } {
    try {
      if (!fs.existsSync(filePath)) {
        return { data: null, error: "File not found" };
      }
      const content = fs.readFileSync(filePath, "utf-8");
      return { data: JSON.parse(content) };
    } catch (e) {
      return { data: null, error: `Failed to read file: ${(e as Error).message}` };
    }
  }

  let initialized = false;

  function initOnce() {
    if (initialized) return;
    initialized = true;
    try {
      ensureDataFiles(dataBaseDir);
    } catch {}
  }

  async function GET(request: NextRequest) {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    initOnce();

    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");
    const headers = { "Cache-Control": "no-store, no-cache, must-revalidate" };

    try {
      if (file) {
        const fullPath = toFullPath(file);
        if (!fullPath) {
          return NextResponse.json({ error: "Invalid file" }, { status: 400 });
        }
        const filePath = path.join(dataBaseDir, fullPath);
        const result = readJsonFile(filePath);
        if (result.error) {
          return NextResponse.json({ error: result.error }, { status: 500, headers });
        }
        return NextResponse.json({ file, data: result.data }, { headers });
      }

      const files = [];
      for (const f of VALID_FILES) {
        const filePath = path.join(dataBaseDir, f);
        const result = readJsonFile(filePath);
        const key = toApiKey(f);
        if (result.error) {
          files.push({ file: key, data: {}, error: result.error });
        } else {
          files.push({ file: key, data: result.data });
        }
      }

      return NextResponse.json({ files }, { headers });
    } catch (e) {
      return NextResponse.json({ error: `Server error: ${(e as Error).message}` }, { status: 500, headers });
    }
  }

  async function PUT(request: NextRequest) {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const body = await request.json();
      const { file, data } = body;

      const fullPath = toFullPath(file);
      if (!file || !fullPath) {
        return NextResponse.json({ error: "Invalid file" }, { status: 400 });
      }

      if (data === undefined) {
        return NextResponse.json({ error: "No data provided" }, { status: 400 });
      }

      const filePath = path.join(dataBaseDir, fullPath);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const saveData = typeof data === "object" && data !== null && !Array.isArray(data)
        ? Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith("_")))
        : data;
      fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2) + "\n");

      try {
        revalidatePath("/", "layout");
        revalidatePath("/");
        if (fullPath === "pages/CustomPages.json") {
          const customData = data as { pages?: { slug?: string }[] };
          if (customData.pages) {
            for (const pg of customData.pages) {
              if (pg.slug) {
                revalidatePath(`/${pg.slug.replace(/^\//, "")}`);
              }
            }
          }
        } else if (fullPath.startsWith("pages/")) {
          const pageName = fullPath.replace("pages/", "").replace("Page.json", "").replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "");
          revalidatePath(`/${pageName}`);
        }
      } catch {}

      return NextResponse.json({ success: true, file });
    } catch (e) {
      return NextResponse.json({ error: `Save failed: ${(e as Error).message}` }, { status: 500 });
    }
  }

  return { GET, PUT };
}
