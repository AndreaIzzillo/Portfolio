import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/orbit-expansion.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { orbitExpansionReducer: transition } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("a closed home stays collapsed when no exit is pending", () => {
  assert.equal(transition("closed", "close"), "closed");
  assert.equal(transition("closed", "finishClosing"), "closed");
});

test("the expanded scene survives until the last bubble has finished exiting", () => {
  const opened = transition("closed", "open");
  assert.equal(opened, "open");
  const closing = transition(opened, "close");
  assert.equal(closing, "closing");
  assert.equal(transition(closing, "close"), "closing");
  assert.equal(transition(closing, "finishClosing"), "closed");
});

test("reopening during the exit ignores a late completion callback", () => {
  const closing = transition(transition("closed", "open"), "close");
  const reopened = transition(closing, "open");
  assert.equal(reopened, "open");
  assert.equal(transition(reopened, "finishClosing"), "open");
});

test("reduced motion or an empty scene can close without waiting for an exit", () => {
  for (const state of ["open", "closing", "closed"]) {
    assert.equal(transition(state, "closeImmediately"), "closed");
  }
});
