import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/orbit-particle-transitions.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { reconcileParticleTransitions: reconcile, advanceParticleTransitions: advance } =
  await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const initial = [
  { id: 10, offset: { x: -120, y: 80 } },
  { id: 20, offset: { x: 140, y: -90 } },
];

test("filtering preserves project identities and fades removed particles over time", () => {
  const targets = reconcile([], initial);
  const removed = targets[0];
  const retained = targets[1];
  const filtered = reconcile(targets, [
    { id: 10, offset: null },
    { id: 20, offset: { x: -80, y: -40 } },
  ]);
  assert.equal(filtered[0], removed);
  assert.equal(filtered[1], retained);
  assert.equal(removed.opacity, 1);
  assert.equal(retained.x, 140);
  advance(filtered, 0.2, false);
  assert(removed.opacity > 0 && removed.opacity < 1);
  assert(retained.x > -80 && retained.x < 140);
  advance(filtered, 0.5, false);
  assert.equal(removed.opacity, 0);
  assert.equal(retained.x, -80);
  assert.equal(retained.y, -40);
});

test("equal-sized filters animate exits and entries independently of array indices", () => {
  const targets = reconcile([], [initial[0], { id: 20, offset: null }]);
  reconcile(targets, [{ id: 10, offset: null }, initial[1]]);
  advance(targets, 0.2, false);
  assert(targets[0].opacity > 0 && targets[0].opacity < 1);
  assert(targets[1].opacity > 0 && targets[1].opacity < 1);
  advance(targets, 0.5, false);
  assert.equal(targets[0].opacity, 0);
  assert.equal(targets[1].opacity, 1);
});

test("rapid reversal starts from the current position and opacity without a jump", () => {
  const targets = reconcile([], initial);
  reconcile(targets, [
    { id: 10, offset: null },
    { id: 20, offset: { x: -80, y: -40 } },
  ]);
  advance(targets, 0.15, false);
  const opacity = targets[0].opacity;
  const x = targets[1].x;
  reconcile(targets, initial);
  assert.equal(targets[0].opacity, opacity);
  assert.equal(targets[1].x, x);
  advance(targets, 0.1, false);
  assert(targets[0].opacity > opacity);
  assert(targets[1].x > x);
  advance(targets, 0.6, false);
  assert.equal(targets[0].opacity, 1);
  assert.equal(targets[1].x, 140);
});

test("pausing or resuming identical destinations preserves the animation", () => {
  const targets = reconcile([], initial);
  const filtered = [{ id: 10, offset: null }, initial[1]];
  reconcile(targets, filtered);
  advance(targets, 0.2, false);
  const before = structuredClone(targets);
  reconcile(targets, filtered);
  advance(targets, 0, false);
  assert.deepEqual(targets, before);
});

test("reduced motion immediately applies the requested visibility and positions", () => {
  const targets = reconcile([], initial);
  reconcile(targets, [
    { id: 10, offset: null },
    { id: 20, offset: { x: 0, y: 100 } },
  ]);
  advance(targets, 0, true);
  assert.equal(targets[0].opacity, 0);
  assert.equal(targets[1].opacity, 1);
  assert.equal(targets[1].x, 0);
  assert.equal(targets[1].y, 100);
  assert.deepEqual(reconcile(targets, []), []);
});
