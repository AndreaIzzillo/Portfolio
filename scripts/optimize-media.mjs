import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { access, mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot = path.join(root, "assets/images");
const outputRoot = path.join(root, "public/media");
const manifestPath = path.join(root, "src/data/media.generated.json");
// Changing these settings invalidates the cache and produces new immutable URLs.
const settings = { version: 1, widths: [240, 480, 800, 1200, 1600], quality: 85, videoCrf: 20 };

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory()
        ? walk(file)
        : /\.(png|jpe?g|webp|avif|gif)$/i.test(file)
          ? [file]
          : [];
    }),
  );
  return nested.flat().sort();
}

await mkdir(outputRoot, { recursive: true });
let previous = {};
try {
  previous = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  // First build (generated assets are intentionally not committed).
}
const manifest = {};
const usedFiles = new Set();
let originalBytes = 0;
let generatedCount = 0;

// Sequential processing bounds peak memory even with very large source images.
for (const source of await walk(sourceRoot)) {
  const key = path.relative(sourceRoot, source).split(path.sep).join("/");
  const input = await readFile(source);
  originalBytes += input.length;
  const hash = createHash("sha256")
    .update(input)
    .update(JSON.stringify(settings))
    .digest("hex")
    .slice(0, 16);
  const cached = previous[key];
  const cachedFiles = cached
    ? [...cached.variants.map(({ src }) => src), ...(cached.video ? [cached.video] : [])]
    : [];
  if (
    cached?.hash === hash &&
    (await Promise.all(cachedFiles.map((src) => exists(path.join(root, "public", src))))).every(
      Boolean,
    )
  ) {
    manifest[key] = cached;
    cachedFiles.forEach((src) => usedFiles.add(path.basename(src)));
    continue;
  }

  const metadata = await sharp(input).metadata();
  const { width, height } = metadata.autoOrient;
  const animated = (metadata.pages ?? 1) > 1;
  const frameHeight = animated ? (metadata.pageHeight ?? height) : height;
  const stem = `${path.parse(source).name.replace(/[^a-zA-Z0-9_-]/g, "-")}-${hash}`;
  const widths = [...new Set(settings.widths.map((size) => Math.min(size, width)))];
  const variants = [];
  for (const size of widths) {
    const name = `${stem}-${size}.webp`;
    const result = await sharp(input)
      .rotate()
      .resize({ width: size, withoutEnlargement: true })
      .webp({ quality: settings.quality, effort: 5 })
      .toFile(path.join(outputRoot, name));
    usedFiles.add(name);
    variants.push({
      src: `/media/${name}`,
      width: result.width,
      height: result.height,
      bytes: result.size,
    });
  }

  let video;
  if (animated) {
    const name = `${stem}.mp4`;
    try {
      await run(process.env.FFMPEG_PATH || "ffmpeg", [
        "-nostdin",
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        source,
        "-an",
        "-vf",
        "pad=ceil(iw/2)*2:ceil(ih/2)*2",
        "-c:v",
        "libx264",
        "-crf",
        String(settings.videoCrf),
        "-preset",
        "slow",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-fps_mode",
        "vfr",
        path.join(outputRoot, name),
      ]);
    } catch (error) {
      throw new Error(
        `Could not convert ${key}. Install FFmpeg (or set FFMPEG_PATH). ${error.message}`,
      );
    }
    usedFiles.add(name);
    video = `/media/${name}`;
  }
  manifest[key] = { hash, width, height: frameHeight, variants, ...(video ? { video } : {}) };
  generatedCount++;
}

const json = `${JSON.stringify(manifest, null, 2)}\n`;
if (!(await exists(manifestPath)) || (await readFile(manifestPath, "utf8")) !== json) {
  await writeFile(`${manifestPath}.tmp`, json);
  await rename(`${manifestPath}.tmp`, manifestPath);
}
// Only remove obsolete files from this script's dedicated output directory.
for (const name of await readdir(outputRoot)) {
  if (!usedFiles.has(name)) await rm(path.join(outputRoot, name), { force: true });
}
console.log(
  `Media: ${Object.keys(manifest).length} assets, ${generatedCount} rebuilt, ${(originalBytes / 1e6).toFixed(1)} MB of originals kept outside public/.`,
);
