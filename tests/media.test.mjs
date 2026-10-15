import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import ts from "typescript";

const run = promisify(execFile);
const root = new URL("../", import.meta.url);
const manifestUrl = new URL("src/data/media.generated.json", root);
const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));

async function loadModule(file, replacements = {}) {
  let source = await readFile(new URL(file, root), "utf8");
  for (const [before, after] of Object.entries(replacements))
    source = source.replace(before, after);
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { mediaUrl, imageSource, imageSourceSet } = await loadModule("src/lib/media.ts", {
  'import manifest from "@/data/media.generated.json";': `const manifest = ${JSON.stringify(manifest)};`,
});
const { animationSettings, canvasPixelRatio } = await loadModule("src/lib/animation-settings.ts");

test("all originals have decodable responsive variants with preserved proportions", async () => {
  const files = (await readdir(new URL("assets/images/", root), { recursive: true }))
    .filter((name) => /\.(png|jpe?g|webp|avif|gif)$/i.test(name))
    .map((name) => name.split(path.sep).join("/"));
  assert.deepEqual(Object.keys(manifest).sort(), files.sort());
  for (const asset of Object.values(manifest)) {
    let previousWidth = 0;
    for (const variant of asset.variants) {
      const data = await readFile(new URL(`public${variant.src}`, root));
      const decoded = await sharp(data).metadata();
      assert.equal(decoded.format, "webp");
      assert.equal(decoded.width, variant.width);
      assert.equal(decoded.height, variant.height);
      assert.equal(data.length, variant.bytes);
      assert(variant.width > previousWidth && variant.width <= Math.min(1600, asset.width));
      assert(Math.abs(variant.height - (variant.width * asset.height) / asset.width) <= 1);
      previousWidth = variant.width;
    }
  }
});

test("animations preserve duration and use compatible silent H.264 streams", async () => {
  for (const [name, asset] of Object.entries(manifest)) {
    if (!asset.video) continue;
    const original = await sharp(new URL(`assets/images/${name}`, root).pathname).metadata();
    const videoPath = new URL(`public${asset.video}`, root).pathname;
    const { stdout } = await run(process.env.FFPROBE_PATH || "ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-show_format",
      "-of",
      "json",
      videoPath,
    ]);
    const { streams, format } = JSON.parse(stdout);
    assert.equal(streams.length, 1);
    assert.equal(streams[0].codec_name, "h264");
    assert.equal(streams[0].pix_fmt, "yuv420p");
    assert.equal(streams[0].width % 2, 0);
    assert.equal(streams[0].height % 2, 0);
    const originalDuration = original.delay.reduce((sum, delay) => sum + delay, 0) / 1000;
    assert(Math.abs(Number(format.duration) - originalDuration) < 0.2);
    assert(
      (await stat(videoPath)).size < (await stat(new URL(`assets/images/${name}`, root))).size,
    );
  }
});

test("responsive URLs work at the domain root and under a GitHub Pages base path", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  const asset = manifest["portrait.jpg"];
  try {
    for (const base of ["", "/Portfolio"]) {
      process.env.NEXT_PUBLIC_BASE_PATH = base;
      assert.equal(mediaUrl("/media/example.mp4"), `${base}/media/example.mp4`);
      assert.equal(imageSource(asset, 300), `${base}${asset.variants[1].src}`);
      assert.equal(imageSource(asset, 10000), `${base}${asset.variants.at(-1).src}`);
      assert(
        imageSourceSet(asset)
          .split(", ")
          .every((entry) => entry.startsWith(`${base}/media/`)),
      );
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("unchanged media builds preserve the manifest and asset modification times", async () => {
  const files = [
    manifestUrl,
    ...Object.values(manifest).flatMap((asset) => [
      ...asset.variants.map(({ src }) => new URL(`public${src}`, root)),
      ...(asset.video ? [new URL(`public${asset.video}`, root)] : []),
    ]),
  ];
  const before = await Promise.all(files.map(async (file) => (await stat(file)).mtimeMs));
  await run(process.execPath, [new URL("scripts/optimize-media.mjs", root).pathname]);
  const after = await Promise.all(files.map(async (file) => (await stat(file)).mtimeMs));
  assert.deepEqual(after, before);
});

test("canvas resolution stays within budget on small, retina and very large screens", () => {
  for (const [width, height, dpr] of [
    [390, 844, 3],
    [1440, 900, 2],
    [3840, 2160, 2],
    [1920, 1080, 1],
  ]) {
    const ratio = canvasPixelRatio(width, height, dpr);
    assert(ratio > 0 && ratio <= Math.min(dpr, 2));
    assert(width * height * ratio * ratio <= animationSettings.maxCanvasPixels + 1);
  }
  assert.equal(canvasPixelRatio(390, 844, 1), 1);
});
