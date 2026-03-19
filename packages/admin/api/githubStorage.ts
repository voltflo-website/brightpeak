interface GitHubFileResult {
  content: string;
  sha: string;
  path: string;
}

interface CacheEntry {
  data: unknown;
  sha: string;
  expiry: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30_000;

function isDeployed(): boolean {
  return process.env.REPLIT_DEPLOYMENT === "1" || process.env.USE_GITHUB_STORAGE === "true";
}

function getConfig() {
  const token = process.env.GITHUB_PERSONAL_ACCESS_TOKEN || "";
  const repo = process.env.GITHUB_REPO || "";
  const branch = process.env.GITHUB_CONTENT_BRANCH || "netlify-deploy";
  return { token, repo, branch };
}

async function githubApi(
  method: string,
  endpoint: string,
  token: string,
  repo: string,
  body?: unknown
): Promise<Response> {
  const base = `https://api.github.com/repos/${repo}`;
  const url = endpoint.startsWith("http") ? endpoint : `${base}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

export async function readGitHubFile(filePath: string): Promise<{ data: unknown; sha: string } | null> {
  const now = Date.now();
  const cached = cache.get(filePath);
  if (cached && cached.expiry > now) {
    return { data: cached.data, sha: cached.sha };
  }

  const { token, repo, branch } = getConfig();
  if (!token || !repo) return null;

  const res = await githubApi("GET", `/contents/${filePath}?ref=${branch}`, token, repo);
  if (!res.ok) {
    if (res.status === 404) return null;
    const err = await res.json();
    throw new Error(`GitHub read ${res.status}: ${(err as Record<string,string>).message || JSON.stringify(err)}`);
  }

  const file = (await res.json()) as GitHubFileResult;
  const decoded = Buffer.from(file.content, "base64").toString("utf-8");

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    parsed = decoded;
  }

  cache.set(filePath, { data: parsed, sha: file.sha, expiry: now + CACHE_TTL });
  return { data: parsed, sha: file.sha };
}

export async function writeGitHubFile(
  filePath: string,
  content: string,
  message?: string
): Promise<{ success: boolean; sha: string }> {
  const { token, repo, branch } = getConfig();
  if (!token || !repo) throw new Error("GitHub token or repo not configured");

  let existingSha: string | undefined;
  const cached = cache.get(filePath);
  if (cached) {
    existingSha = cached.sha;
  } else {
    const existing = await readGitHubFile(filePath);
    if (existing) existingSha = existing.sha;
  }

  const body: Record<string, unknown> = {
    message: message || `Update ${filePath}`,
    content: Buffer.from(content).toString("base64"),
    branch,
  };
  if (existingSha) body.sha = existingSha;

  const res = await githubApi("PUT", `/contents/${filePath}`, token, repo, body);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub write ${res.status}: ${(err as Record<string,string>).message || JSON.stringify(err)}`);
  }

  const result = (await res.json()) as { content: { sha: string } };
  const newSha = result.content.sha;

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = content;
  }
  cache.set(filePath, { data: parsed, sha: newSha, expiry: Date.now() + CACHE_TTL });

  return { success: true, sha: newSha };
}

export async function writeGitHubBinaryFile(
  filePath: string,
  contentBase64: string,
  message?: string
): Promise<{ success: boolean; sha: string }> {
  const { token, repo, branch } = getConfig();
  if (!token || !repo) throw new Error("GitHub token or repo not configured");

  let existingSha: string | undefined;
  const existingRes = await githubApi("GET", `/contents/${filePath}?ref=${branch}`, token, repo);
  if (existingRes.ok) {
    const existing = (await existingRes.json()) as { sha: string };
    existingSha = existing.sha;
  }

  const body: Record<string, unknown> = {
    message: message || `Upload ${filePath}`,
    content: contentBase64,
    branch,
  };
  if (existingSha) body.sha = existingSha;

  const res = await githubApi("PUT", `/contents/${filePath}`, token, repo, body);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub upload ${res.status}: ${(err as Record<string,string>).message || JSON.stringify(err)}`);
  }

  const result = (await res.json()) as { content: { sha: string } };
  return { success: true, sha: result.content.sha };
}

export async function deleteGitHubFile(
  filePath: string,
  message?: string
): Promise<{ success: boolean }> {
  const { token, repo, branch } = getConfig();
  if (!token || !repo) throw new Error("GitHub token or repo not configured");

  const existingRes = await githubApi("GET", `/contents/${filePath}?ref=${branch}`, token, repo);
  if (!existingRes.ok) {
    if (existingRes.status === 404) return { success: true };
    throw new Error(`GitHub delete: file lookup failed ${existingRes.status}`);
  }

  const existing = (await existingRes.json()) as { sha: string };

  const res = await githubApi("DELETE", `/contents/${filePath}`, token, repo, {
    message: message || `Delete ${filePath}`,
    sha: existing.sha,
    branch,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`GitHub delete ${res.status}: ${(err as Record<string,string>).message || JSON.stringify(err)}`);
  }

  cache.delete(filePath);
  return { success: true };
}

export async function listGitHubDirectory(
  dirPath: string
): Promise<{ name: string; path: string; type: string; sha: string; size: number }[]> {
  const { token, repo, branch } = getConfig();
  if (!token || !repo) return [];

  const res = await githubApi("GET", `/contents/${dirPath}?ref=${branch}`, token, repo);
  if (!res.ok) {
    if (res.status === 404) return [];
    const err = await res.json();
    throw new Error(`GitHub list ${res.status}: ${(err as Record<string,string>).message || JSON.stringify(err)}`);
  }

  const items = (await res.json()) as { name: string; path: string; type: string; sha: string; size: number }[];
  return Array.isArray(items) ? items : [];
}

export async function listGitHubDirectoryRecursive(
  dirPath: string
): Promise<{ name: string; path: string; type: string; sha: string; size: number }[]> {
  const results: { name: string; path: string; type: string; sha: string; size: number }[] = [];
  const items = await listGitHubDirectory(dirPath);

  for (const item of items) {
    if (item.type === "file") {
      results.push(item);
    } else if (item.type === "dir") {
      const subItems = await listGitHubDirectoryRecursive(item.path);
      results.push(...subItems);
    }
  }

  return results;
}

export function invalidateGitHubCache(pathPrefix?: string) {
  if (!pathPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(pathPrefix)) {
      cache.delete(key);
    }
  }
}

export { isDeployed };
