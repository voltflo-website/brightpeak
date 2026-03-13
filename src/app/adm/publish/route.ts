import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

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

  try {
    const dataFiles = collectFiles(DATA_BASE, DATA_BASE, "data", (name) => name.endsWith(".json"));
    const imageFiles = collectFiles(IMAGES_BASE, IMAGES_BASE, "public/images");
    const allLocalFiles = [...dataFiles, ...imageFiles];

    const mainRef = await githubApi("GET", "/git/refs/heads/main", token, undefined, 3, repo) as { object: { sha: string } };
    const baseSha = mainRef.object.sha;

    const baseCommit = await githubApi("GET", `/git/commits/${baseSha}`, token, undefined, 3, repo) as { tree: { sha: string } };
    const remoteTree = await fetchFullTree(baseCommit.tree.sha, token, repo);

    const localPaths = new Set<string>();
    const changedFiles: { relativePath: string; fullPath: string }[] = [];
    for (const file of allLocalFiles) {
      const normPath = file.relativePath.replace(/\\/g, "/");
      localPaths.add(normPath);
      const content = fs.readFileSync(file.fullPath);
      const localSha = gitBlobSha(content);
      const remoteSha = remoteTree.get(normPath);
      if (localSha !== remoteSha) {
        changedFiles.push({ ...file, relativePath: normPath });
      }
    }

    const TRACKED_PREFIXES = ["data/", "public/images/"];
    const deletedPaths: string[] = [];
    for (const remotePath of remoteTree.keys()) {
      if (TRACKED_PREFIXES.some((p) => remotePath.startsWith(p)) && !localPaths.has(remotePath)) {
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
      const content = fs.readFileSync(file.fullPath);
      const blob = await githubApi("POST", "/git/blobs", token, {
        content: content.toString("base64"),
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
      message: `Content update ${now.toISOString().split("T")[0]}\n\n${parts.join(", ")}\nPublished from admin panel`,
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
    });
  } catch (e) {
    return NextResponse.json(
      { error: `Publish failed: ${(e as Error).message}` },
      { status: 500 }
    );
  }
}
