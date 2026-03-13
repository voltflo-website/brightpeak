import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const dynamic = "force-dynamic";

const IMAGES_DIR = path.join(process.cwd(), "public/images");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg"]);
const MAX_DIMENSION = 2000;
const WEBP_QUALITY = 80;

function checkAuth(request: NextRequest): boolean {
  const adminEnabled = process.env.ADMIN_ENABLED;
  if (adminEnabled !== "true") return false;
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();
  if (!adminPassword) return true;
  const provided = (
    request.headers.get("x-admin-password") ||
    new URL(request.url).searchParams.get("pw") ||
    ""
  ).trim();
  return provided === adminPassword;
}

function getImagesRecursive(dir: string, baseDir: string): { path: string; name: string; folder: string; size: number }[] {
  const results: { path: string; name: string; folder: string; size: number }[] = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getImagesRecursive(fullPath, baseDir));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IMAGE_EXTENSIONS.has(ext)) {
          const stat = fs.statSync(fullPath);
          const relativePath = "/" + path.relative(path.join(baseDir, ".."), fullPath).replace(/\\/g, "/");
          const folder = path.relative(baseDir, dir).replace(/\\/g, "/") || "/";
          results.push({
            path: relativePath,
            name: entry.name,
            folder: folder === "." ? "/" : folder,
            size: stat.size,
          });
        }
      }
    }
  } catch {}
  return results;
}

function getFolders(dir: string, baseDir: string): string[] {
  const folders: string[] = ["/"];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const rel = path.relative(baseDir, path.join(dir, entry.name)).replace(/\\/g, "/");
        folders.push(rel);
        folders.push(...getFolders(path.join(dir, entry.name), baseDir).filter((f) => f !== "/"));
      }
    }
  } catch {}
  return folders;
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = getImagesRecursive(IMAGES_DIR, IMAGES_DIR);
  const folders = getFolders(IMAGES_DIR, IMAGES_DIR);

  return NextResponse.json({ images, folders: [...new Set(folders)].sort() });
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "/";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const targetDir = path.resolve(folder === "/" ? IMAGES_DIR : path.join(IMAGES_DIR, folder));

    if (targetDir !== IMAGES_DIR && !targetDir.startsWith(IMAGES_DIR + path.sep)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    fs.mkdirSync(targetDir, { recursive: true });

    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "-").toLowerCase();
    let outputName: string;
    let outputBuffer: Buffer;

    if (ext === ".svg") {
      outputName = `${baseName}.svg`;
      outputBuffer = buffer;
    } else {
      outputName = `${baseName}.webp`;

      const image = sharp(buffer);
      const metadata = await image.metadata();

      let pipeline = image;
      if (metadata.width && metadata.width > MAX_DIMENSION) {
        pipeline = pipeline.resize({ width: MAX_DIMENSION, withoutEnlargement: true });
      } else if (metadata.height && metadata.height > MAX_DIMENSION) {
        pipeline = pipeline.resize({ height: MAX_DIMENSION, withoutEnlargement: true });
      }

      outputBuffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    }

    let finalName = outputName;
    let counter = 1;
    while (fs.existsSync(path.join(targetDir, finalName))) {
      const nameBase = path.basename(outputName, path.extname(outputName));
      finalName = `${nameBase}-${counter}${path.extname(outputName)}`;
      counter++;
    }

    const outputPath = path.join(targetDir, finalName);
    fs.writeFileSync(outputPath, outputBuffer);

    const publicPath = "/images/" + (folder === "/" ? "" : folder + "/") + finalName;
    const cleanPath = publicPath.replace(/\/+/g, "/");

    return NextResponse.json({
      success: true,
      path: cleanPath,
      name: finalName,
      size: outputBuffer.length,
      originalSize: buffer.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function findReferences(imagePath: string): string[] {
  const references: string[] = [];
  const dataDirs = [
    path.join(process.cwd(), "data/home"),
    path.join(process.cwd(), "data/pages"),
    path.join(process.cwd(), "data"),
  ];

  for (const dir of dataDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) continue;
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.includes(imagePath)) {
          const relative = path.relative(process.cwd(), filePath);
          references.push(relative);
        }
      } catch {}
    }
  }

  return [...new Set(references)];
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imagePath, force } = await request.json();
    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json({ error: "No image path provided" }, { status: 400 });
    }

    const fullPath = path.resolve(path.join(process.cwd(), "public", imagePath));
    if (fullPath !== IMAGES_DIR && !fullPath.startsWith(IMAGES_DIR + path.sep)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const references = findReferences(imagePath);

    if (references.length > 0 && !force) {
      return NextResponse.json({
        warning: true,
        references,
        message: `This image is referenced in ${references.length} file(s). Delete anyway?`,
      });
    }

    fs.unlinkSync(fullPath);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
