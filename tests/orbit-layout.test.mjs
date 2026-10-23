import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/orbit-layout.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getProjectLayout } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const screens = [
  [320, 568],
  [360, 740],
  [390, 844],
  [593, 740],
  [639, 800],
  [640, 800],
  [641, 800],
  [768, 1024],
  [844, 390],
  [1024, 600],
  [1440, 900],
  [1920, 1080],
  [2560, 1440],
];

function distanceToRectangle(x, y, left, right, top, bottom) {
  return Math.hypot(Math.max(left - x, 0, x - right), Math.max(top - y, 0, y - bottom));
}

function fitEllipse(offsets) {
  let x4 = 0,
    y4 = 0,
    x2y2 = 0,
    x2 = 0,
    y2 = 0;
  for (const { x, y } of offsets) {
    x4 += x ** 4;
    y4 += y ** 4;
    x2y2 += x * x * y * y;
    x2 += x * x;
    y2 += y * y;
  }
  const determinant = x4 * y4 - x2y2 * x2y2;
  return {
    a: (x2 * y4 - y2 * x2y2) / determinant,
    b: (y2 * x4 - x2 * x2y2) / determinant,
  };
}

for (const [width, viewportHeight] of screens) {
  test(`layout protects bubbles, portrait and controls at ${width}×${viewportHeight}`, () => {
    // Float reaches 18px; magnetic pull adds at most 9px, with a 6% hover scale.
    const projectRadius = Math.min(116, width * 0.22, viewportHeight * 0.22) / 2;
    const body = projectRadius * 1.06 + 27;
    const portrait = (Math.min(170, width * 0.32, viewportHeight * 0.32) / 2) * 1.06 + 27;
    const title = Math.max(projectRadius, (projectRadius + 24) * 0.9) * 1.06 + 27;

    for (const count of [1, 2, 3, 4, 5, 6, 7, 9, 12, 20, 121]) {
      const { height, offsets } = getProjectLayout(width, viewportHeight, count);
      assert(height >= viewportHeight);
      assert.equal(offsets.length, count);
      assert.equal(new Set(offsets.map(({ x, y }) => `${x},${y}`)).size, count);
      offsets.forEach((point, index) => {
        assert(Number.isFinite(point.x) && Number.isFinite(point.y));
        const x = width / 2 + point.x;
        const y = height / 2 + point.y;
        assert(x >= title && x <= width - title, `${count}: title clipped horizontally`);
        assert(y >= title && y <= height - title, `${count}: title clipped vertically`);
        assert(y - title >= 80, `${count}: top controls space occupied`);
        assert(height - y - title >= 80, `${count}: bottom controls space occupied`);
        assert(Math.hypot(point.x, point.y) >= body + portrait + 12, `${count}: portrait overlap`);
        assert(distanceToRectangle(x, y, 22, 70, 22, 190) >= title, `${count}: toolbar overlap`);
        assert(
          distanceToRectangle(x, y, width - 70, width - 22, 22, 70) >= title,
          `${count}: language overlap`,
        );
        for (const other of offsets.slice(0, index)) {
          assert(
            Math.hypot(point.x - other.x, point.y - other.y) >= body * 2 + 12,
            `${count}: bubble overlap`,
          );
        }
      });
    }
  });
}

test("six projects occupy one ellipse and remain balanced on each screen", () => {
  for (const [width, viewportHeight] of screens) {
    const { height, offsets } = getProjectLayout(width, viewportHeight, 6);
    const { a, b } = fitEllipse(offsets);
    assert(a > 0 && b > 0);
    for (const { x, y } of offsets) assert(Math.abs(a * x * x + b * y * y - 1) < 1e-8);
    const mean = offsets.reduce((sum, p) => ({ x: sum.x + p.x / 6, y: sum.y + p.y / 6 }), {
      x: 0,
      y: 0,
    });
    assert(Math.abs(mean.x) < width * 0.1);
    assert(Math.abs(mean.y) < height * 0.1);
    assert(offsets.filter((p) => p.x > 0).length >= 2);
    assert(offsets.filter((p) => p.y > 0).length >= 2);
    assert(offsets.filter((p) => p.x < 0).length >= 2);
    assert(offsets.filter((p) => p.y < 0).length >= 2);
  }
});

test("wide ellipses space projects by arc length rather than equal angles", () => {
  const { offsets } = getProjectLayout(1920, 900, 6);
  const { a, b } = fitEllipse(offsets);
  const rx = 1 / Math.sqrt(a);
  const ry = 1 / Math.sqrt(b);
  const angles = offsets.map(({ x, y }) => Math.atan2(y / ry, x / rx)).sort((x, y) => x - y);
  const lengths = angles.map((start, index) => {
    const end = angles[index + 1] ?? angles[0] + Math.PI * 2;
    let length = 0;
    let previous = { x: Math.cos(start) * rx, y: Math.sin(start) * ry };
    for (let i = 1; i <= 200; i++) {
      const angle = start + ((end - start) * i) / 200;
      const point = { x: Math.cos(angle) * rx, y: Math.sin(angle) * ry };
      length += Math.hypot(point.x - previous.x, point.y - previous.y);
      previous = point;
    }
    return length;
  });
  assert(Math.max(...lengths) / Math.min(...lengths) < 1.35);
});

test("six projects keep a compact oval and control space without desktop scrolling", () => {
  for (const [width, height] of [
    [1440, 900],
    [1920, 1080],
    [2560, 1440],
    [768, 1024],
  ]) {
    const layout = getProjectLayout(width, height, 6);
    assert.equal(layout.height, height);
    assert(Math.max(...layout.offsets.map((p) => Math.abs(p.x))) > width * 0.18);
    assert(Math.max(...layout.offsets.map((p) => Math.abs(p.x))) <= width * 0.35);
    const { a } = fitEllipse(layout.offsets);
    assert(2 / Math.sqrt(a) <= 1280 + 1e-6);
    assert(Math.max(...layout.offsets.map((p) => Math.abs(p.y))) > height * 0.25);
  }
});

test("reopening and restoring a viewport reproduce the same positions", () => {
  const initial = getProjectLayout(1440, 900, 6);
  getProjectLayout(390, 844, 6);
  getProjectLayout(1440, 900, 9);
  assert.deepEqual(getProjectLayout(1440, 900, 6), initial);
  for (const [width, height] of [
    [0, 0],
    [390, 0],
    [0, 844],
  ]) {
    assert.deepEqual(getProjectLayout(width, height, 6).offsets, []);
  }
  assert.deepEqual(getProjectLayout(390, 844, 0).offsets, []);
});
