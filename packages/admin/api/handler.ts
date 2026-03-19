import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { VALID_FILES } from "../config";
import { ensureDataFiles } from "../schema";
import { isDeployed } from "./githubStorage";
import {
  isDbAvailable,
  readContentFile,
  writeContentFile,
  readAllContentFiles,
  seedDbFromLocal,
  syncDbToLocal,
  getContentFileCount,
} from "./dbStorage";

let _invalidateCache: (() => void) | null = null;
export function setInvalidateCacheCallback(fn: () => void) {
  _invalidateCache = fn;
}

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
  let initPromise: Promise<void> | null = null;

  async function initOnce() {
    if (initialized) return;
    if (initPromise) return initPromise;

    initPromise = (async () => {
      initialized = true;
      const deployed = isDeployed();
      const dbReady = isDbAvailable();

      if (!deployed) {
        try {
          ensureDataFiles(dataBaseDir);
        } catch {}
      }

      if (dbReady && !deployed) {
        try {
          const count = await getContentFileCount();
          if (count === 0) {
            const seeded = await seedDbFromLocal(dataBaseDir, VALID_FILES);
            console.log(`[DB] Seeded ${seeded} files from local JSON into database`);
          } else {
            const synced = await syncDbToLocal(dataBaseDir);
            console.log(`[DB] Synced ${synced} files from database to local JSON`);
          }
        } catch (e) {
          console.error(`[DB] Startup sync failed, falling back to local files:`, (e as Error).message);
        }
      }
    })();

    return initPromise;
  }

  async function GET(request: NextRequest) {
    if (!checkAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initOnce();

    const dbReady = isDbAvailable();
    const { searchParams } = new URL(request.url);
    const file = searchParams.get("file");
    const headers = { "Cache-Control": "no-store, no-cache, must-revalidate" };

    try {
      if (file) {
        const fullPath = toFullPath(file);
        if (!fullPath) {
          return NextResponse.json({ error: "Invalid file" }, { status: 400 });
        }

        let data: unknown = null;
        let source = "local";

        if (dbReady) {
          try {
            data = await readContentFile(fullPath);
            source = "db";
          } catch {
            data = null;
          }
        }

        if (data === null && !isDeployed()) {
          const filePath = path.join(dataBaseDir, fullPath);
          const result = readJsonFile(filePath);
          if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 500, headers });
          }
          data = result.data;
          source = "local";
        }

        if (data === null) {
          return NextResponse.json({ error: "File not found" }, { status: 500, headers });
        }

        return NextResponse.json({ file, data, source }, { headers });
      }

      const files = [];

      if (dbReady) {
        try {
          const allDbFiles = await readAllContentFiles();
          for (const f of VALID_FILES) {
            const key = toApiKey(f);
            const dbData = allDbFiles.get(f);
            if (dbData !== undefined) {
              files.push({ file: key, data: dbData });
            } else if (!isDeployed()) {
              const filePath = path.join(dataBaseDir, f);
              const result = readJsonFile(filePath);
              if (result.error) {
                files.push({ file: key, data: {}, error: result.error });
              } else {
                files.push({ file: key, data: result.data });
              }
            } else {
              files.push({ file: key, data: {}, error: "Not found in database" });
            }
          }
          return NextResponse.json({ files, source: "db" }, { headers });
        } catch {
        }
      }

      if (!isDeployed()) {
        for (const f of VALID_FILES) {
          const key = toApiKey(f);
          const filePath = path.join(dataBaseDir, f);
          const result = readJsonFile(filePath);
          if (result.error) {
            files.push({ file: key, data: {}, error: result.error });
          } else {
            files.push({ file: key, data: result.data });
          }
        }
        return NextResponse.json({ files, source: "local" }, { headers });
      }

      return NextResponse.json({ error: "No storage available" }, { status: 500, headers });
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

      const saveData = typeof data === "object" && data !== null && !Array.isArray(data)
        ? Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith("_")))
        : data;

      const deployed = isDeployed();
      const dbReady = isDbAvailable();
      let dbWriteOk = false;
      let dbError: string | undefined;

      if (dbReady) {
        try {
          await writeContentFile(fullPath, saveData);
          dbWriteOk = true;
        } catch (e) {
          dbError = (e as Error).message;
          if (deployed) {
            return NextResponse.json(
              { error: `Database write failed: ${dbError}` },
              { status: 500 }
            );
          }
        }
      } else if (deployed) {
        return NextResponse.json(
          { error: "No storage available in deployed mode (DATABASE_URL not configured)" },
          { status: 500 }
        );
      }

      if (!deployed) {
        const jsonContent = JSON.stringify(saveData, null, 2) + "\n";
        const filePath = path.join(dataBaseDir, fullPath);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, jsonContent);
      }

      if (_invalidateCache) _invalidateCache();

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

      let storage: string;
      if (dbWriteOk && !deployed) storage = "db+local";
      else if (dbWriteOk) storage = "db";
      else storage = "local";

      const response: Record<string, unknown> = { success: true, file, storage };
      if (dbError && !deployed) {
        response.dbWarning = `DB write failed (saved to local): ${dbError}`;
      }

      return NextResponse.json(response);
    } catch (e) {
      return NextResponse.json({ error: `Save failed: ${(e as Error).message}` }, { status: 500 });
    }
  }

  return { GET, PUT };
}
