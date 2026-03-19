import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  isDeployed,
  listGitHubDirectoryRecursive,
} from "../../../../packages/admin/api/githubStorage";
import {
  isDbAvailable,
  readAllContentFiles,
} from "../../../../packages/admin/api/dbStorage";

export const dynamic = "force-dynamic";

const DATA_BASE = path.join(process.cwd(), "data");
const IMAGES_BASE = path.join(process.cwd(), "public", "images");

function checkAuth(request: NextRequest): boolean {
  if (process.env.ADMIN_ENABLED !== "true") return false;
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  if (!adminPassword) return false;
  const provided = (
    request.headers.get("x-admin-password") ||
    new URL(request.url).searchParams.get("pw") ||
    ""
  ).trim();
  return provided === adminPassword;
}

async function githubApi(method: string, endpoint: string, token: string, body?: unknown, retries = 3, repo?: string): Promise<Record<string, unknown>> {
  const apiBase = repo ? `https://api.github.com/repos/${repo}` : "";
  const url = endpoint.startsWith("http") ? endpoint : `${apiBase}${endpoint}`;
  for (let attempt = 0; attempt < retries; attempt++) {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (res.ok) return data as Record<string, unknown>;
    const isRateLimit = res.status === 403 || res.status === 429;
    if (isRateLimit && attempt < retries - 1) {
      const retryAfter = res.headers.get("retry-after");
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 30000 + attempt * 15000;
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    throw new Error(`GitHub API ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  throw new Error("GitHub API: max retries exceeded");
}

function collectFiles(dir: string, base: string, prefix: string, filter?: (name: string) => boolean): { relativePath: string; fullPath: string }[] {
  const results: { relativePath: string; fullPath: string }[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(base, fullPath);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, base, prefix, filter));
    } else if (!filter || filter(entry.name)) {
      results.push({ relativePath: `${prefix}/${relPath}`, fullPath });
    }
  }
  return results;
}

function gitBlobSha(content: Buffer): string {
  const header = `blob ${content.length}\0`;
  const store = Buffer.concat([Buffer.from(header), content]);
  return crypto.createHash("sha1").update(store).digest("hex");
}

interface TreeEntry {
  path: string;
  mode: string;
  type: string;
  sha: string;
  url?: string;
}

async function fetchFullTree(treeSha: string, token: string, repo: string): Promise<Map<string, string>> {
  const tree = await githubApi("GET", `/git/trees/${treeSha}?recursive=1`, token, undefined, 3, repo) as { tree: TreeEntry[] };
  const map = new Map<string, string>();
  for (const entry of tree.tree) {
    if (entry.type === "blob") {
      map.set(entry.path, entry.sha);
    }
  }
  return map;
}

async function collectDataFromDb(): Promise<{ relativePath: string; content: Buffer }[]> {
  const results: { relativePath: string; content: Buffer }[] = [];
  const allFiles = await readAllContentFiles();

  for (const [filename, data] of allFiles) {
    const content = JSON.stringify(data, null, 2) + "\n";
    results.push({
      relativePath: `data/${filename}`,
      content: Buffer.from(content, "utf-8"),
    });
  }

  return results;
}

async function collectImagesFromGitHub(): Promise<{ relativePath: string; content: Buffer }[]> {
  const results: { relativePath: string; content: Buffer }[] = [];
  const errors: string[] = [];

  const imageItems = await listGitHubDirectoryRecursive("public/images");
  for (const item of imageItems) {
    if (item.type !== "file") continue;
    try {
      const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/git/blobs/${item.sha}`, {
        headers: {
          Authorization: `token ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (!res.ok) {
        throw new Error(`Blob fetch failed: ${res.status}`);
      }
      const blob = await res.json() as { content: string; encoding: string };
      if (blob.encoding === "base64") {
        results.push({
          relativePath: item.path,
          content: Buffer.from(blob.content, "base64"),
        });
      }
    } catch (e) {
      errors.push(`${item.path}: ${(e as Error).message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(`Failed to fetch ${errors.length} image blob(s): ${errors.join("; ")}`);
  }

  return results;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });
  }
  const repo = process.env.GITHUB_REPO || "";
  if (!repo) {
    return NextResponse.json({ error: "GITHUB_REPO environment variable not configured" }, { status: 500 });
  }

  const deployed = isDeployed();

  try {
    let allLocalFiles: { relativePath: string; fullPath?: string; content?: Buffer }[];

    const dbReady = isDbAvailable();

    let dataFiles: { relativePath: string; fullPath?: string; content?: Buffer }[];
    let dataSource = "local";
    if (dbReady) {
      try {
        dataFiles = await collectDataFromDb();
        dataSource = "db";
      } catch (e) {
        if (deployed) {
          return NextResponse.json(
            { error: `Failed to read content from database: ${(e as Error).message}` },
            { status: 500 }
          );
        }
        console.error(`[Publish] DB read failed, falling back to local JSON:`, (e as Error).message);
        dataFiles = collectFiles(DATA_BASE, DATA_BASE, "data", (name) => name.endsWith(".json"));
        dataSource = "local-fallback";
      }
    } else if (!deployed) {
      dataFiles = collectFiles(DATA_BASE, DATA_BASE, "data", (name) => name.endsWith(".json"));
    } else {
      return NextResponse.json(
        { error: "No content source available (DATABASE_URL not configured)" },
        { status: 500 }
      );
    }

    let imageFiles: { relativePath: string; fullPath?: string; content?: Buffer }[];
    if (deployed) {
      imageFiles = await collectImagesFromGitHub();
    } else {
      imageFiles = collectFiles(IMAGES_BASE, IMAGES_BASE, "public/images");
    }

    allLocalFiles = [...dataFiles, ...imageFiles];

    const mainRef = await githubApi("GET", "/git/refs/heads/main", token, undefined, 3, repo) as { object: { sha: string } };
    const baseSha = mainRef.object.sha;

    const baseCommit = await githubApi("GET", `/git/commits/${baseSha}`, token, undefined, 3, repo) as { tree: { sha: string } };
    const remoteTree = await fetchFullTree(baseCommit.tree.sha, token, repo);

    const localPaths = new Set<string>();
    const changedFiles: { relativePath: string; content: Buffer }[] = [];

    for (const file of allLocalFiles) {
      const normPath = file.relativePath.replace(/\\/g, "/");
      localPaths.add(normPath);

      let content: Buffer;
      if (file.content) {
        content = file.content;
      } else if (file.fullPath) {
        content = fs.readFileSync(file.fullPath);
      } else {
        continue;
      }

      const localSha = gitBlobSha(content);
      const remoteSha = remoteTree.get(normPath);
      if (localSha !== remoteSha) {
        changedFiles.push({ relativePath: normPath, content });
      }
    }

    const deletedPaths: string[] = [];
    for (const remotePath of remoteTree.keys()) {
      if (remotePath.startsWith("public/images/") && !localPaths.has(remotePath)) {
        deletedPaths.push(remotePath);
      }
    }

    if (changedFiles.length === 0 && deletedPaths.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
        filesCount: 0,
      });
    }

    const now = new Date();
    const suffix = Math.random().toString(36).substring(2, 6);
    const branchName = `content-update-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}-${suffix}`;

    await githubApi("POST", "/git/refs", token, { ref: `refs/heads/${branchName}`, sha: baseSha }, 3, repo);

    const treeItems = [];
    for (let i = 0; i < changedFiles.length; i++) {
      const file = changedFiles[i];
      const blob = await githubApi("POST", "/git/blobs", token, {
        content: file.content.toString("base64"),
        encoding: "base64",
      }, 3, repo);
      treeItems.push({
        path: file.relativePath,
        mode: "100644" as const,
        type: "blob" as const,
        sha: (blob as { sha: string }).sha,
      });
      if ((i + 1) % 20 === 0) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    for (const delPath of deletedPaths) {
      treeItems.push({
        path: delPath,
        mode: "100644" as const,
        type: "blob" as const,
        sha: null as unknown as string,
      });
    }

    const tree = await githubApi("POST", "/git/trees", token, {
      base_tree: baseCommit.tree.sha,
      tree: treeItems,
    }, 3, repo);

    const changedDataCount = changedFiles.filter((f) => f.relativePath.startsWith("data/")).length;
    const changedImageCount = changedFiles.filter((f) => f.relativePath.startsWith("public/")).length;
    const totalChanges = changedFiles.length + deletedPaths.length;

    const parts = [];
    if (changedDataCount > 0) parts.push(`${changedDataCount} data file(s)`);
    if (changedImageCount > 0) parts.push(`${changedImageCount} image(s)`);
    if (deletedPaths.length > 0) parts.push(`${deletedPaths.length} file(s) removed`);

    const commit = await githubApi("POST", "/git/commits", token, {
      message: `Content update ${now.toISOString().split("T")[0]}\n\n${parts.join(", ")}\nPublished from admin panel${deployed ? " (deployed)" : ""}${dbReady ? " [data from DB]" : ""}`,
      tree: (tree as { sha: string }).sha,
      parents: [baseSha],
    }, 3, repo);

    await githubApi("PATCH", `/git/refs/heads/${branchName}`, token, { sha: (commit as { sha: string }).sha }, 3, repo);

    return NextResponse.json({
      success: true,
      branch: branchName,
      url: `https://github.com/${repo}/compare/main...${branchName}`,
      filesCount: totalChanges,
      dataFiles: changedDataCount,
      imageFiles: changedImageCount,
      deletedFiles: deletedPaths.length,
      totalScanned: allLocalFiles.length,
      storage: dbReady ? "db" : (deployed ? "github" : "local"),
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Publish failed: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
