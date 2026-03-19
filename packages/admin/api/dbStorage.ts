import pg from "pg";
import fs from "fs";
import path from "path";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL not configured");
    }
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function isDbAvailable(): boolean {
  return !!process.env.DATABASE_URL;
}

export async function readContentFile(filename: string): Promise<unknown | null> {
  const p = getPool();
  const result = await p.query(
    "SELECT data FROM content_files WHERE filename = $1",
    [filename]
  );
  if (result.rows.length === 0) return null;
  return result.rows[0].data;
}

export async function writeContentFile(filename: string, data: unknown): Promise<void> {
  const p = getPool();
  await p.query(
    `INSERT INTO content_files (filename, data, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (filename) DO UPDATE SET data = $2, updated_at = NOW()`,
    [filename, JSON.stringify(data)]
  );
}

export async function readAllContentFiles(): Promise<Map<string, unknown>> {
  const p = getPool();
  const result = await p.query("SELECT filename, data FROM content_files ORDER BY filename");
  const map = new Map<string, unknown>();
  for (const row of result.rows) {
    map.set(row.filename, row.data);
  }
  return map;
}

export async function deleteContentFile(filename: string): Promise<void> {
  const p = getPool();
  await p.query("DELETE FROM content_files WHERE filename = $1", [filename]);
}

export async function getContentFileCount(): Promise<number> {
  const p = getPool();
  const result = await p.query("SELECT COUNT(*) as count FROM content_files");
  return parseInt(result.rows[0].count, 10);
}

export async function seedDbFromLocal(dataBaseDir: string, validFiles: string[]): Promise<number> {
  let seeded = 0;
  for (const f of validFiles) {
    const filePath = path.join(dataBaseDir, f);
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const data = JSON.parse(content);
      await writeContentFile(f, data);
      seeded++;
    } catch {
    }
  }
  return seeded;
}

export async function syncDbToLocal(dataBaseDir: string): Promise<number> {
  const allFiles = await readAllContentFiles();
  let synced = 0;
  for (const [filename, data] of allFiles) {
    const filePath = path.join(dataBaseDir, filename);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = JSON.stringify(data, null, 2) + "\n";
    fs.writeFileSync(filePath, content);
    synced++;
  }
  return synced;
}

export async function testConnection(): Promise<boolean> {
  try {
    const p = getPool();
    await p.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
