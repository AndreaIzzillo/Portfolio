import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

// Compile the actual pure modules with the project's existing TypeScript dependency.
async function loadModule(path) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const { createOrbitParticles } = await loadModule("../src/lib/orbit-particle-model.ts");
const { getProjectOffsets, getProjectSceneHeight } = await loadModule("../src/lib/orbit-layout.ts");

for (const compact of [true, false]) {
  for (const count of [1, 2, 3, 4, 5, 6, 9, 12, 20, 121]) {
    test(`${count} projects, ${compact ? "mobile" : "desktop"}: every project has paths and halos`, () => {
      const particles = createOrbitParticles(count, compact);
      const expectedSize = particles.length / count;
      for (let group = 0; group < count; group++) {
        const own = particles.filter((particle) => particle.group === group);
        assert.equal(own.length, expectedSize);
        assert(own.some((particle) => particle.kind === "path"));
        assert(own.some((particle) => particle.kind === "halo"));
        assert.equal(
          own.filter((particle) => particle.kind === "path").length,
          Math.ceil(expectedSize / 3),
        );
      }
      assert(particles.every((particle) => particle.group >= 0 && particle.group < count));
      assert(particles.every((particle) => Number.isFinite(particle.phase)));
      assert(particles.every((particle) => particle.seed >= 0 && particle.seed < 1));
      if (count <= 120) assert(particles.length <= 360);
    });
  }
}

test("an empty project list has no particles or destinations", () => {
  assert.deepEqual(createOrbitParticles(0, false), []);
  assert.deepEqual(getProjectOffsets(360, 740, 0), []);
});

test("reopening preserves seeds but creates independent mutable trails", () => {
  const first = createOrbitParticles(3, false);
  const second = createOrbitParticles(3, false);
  assert.deepEqual(first, second);
  first[0].trail.push({ x: 1, y: 2 });
  assert.equal(second[0].trail.length, 0);
  assert.equal(first[1].trail.length, 0);
});

for (const width of [360, 593, 1440]) {
  test(`adding and removing projects keeps particle destinations valid at width ${width}`, () => {
    for (const count of [0, 1, 2, 3, 4, 5, 6, 8, 12, 20]) {
      const height = Math.max(740, getProjectSceneHeight(width, count));
      const offsets = getProjectOffsets(width, height, count);
      assert.equal(offsets.length, count);
      assert.equal(new Set(offsets.map(({ x, y }) => `${x},${y}`)).size, count);
      for (const particle of createOrbitParticles(count, width <= 640)) {
        const target = offsets[particle.group];
        assert(target);
        assert(Number.isFinite(target.x) && Number.isFinite(target.y));
        assert(Math.abs(target.x) < width / 2 && Math.abs(target.y) < height / 2);
      }
    }
  });
}
