import { readFile } from "node:fs/promises";

const readme = await readFile(new URL("../README.md", import.meta.url));

if (readme.length !== 0) {
  console.error("README.md doit rester vide. Placer la documentation dans AGENTS.md.");
  process.exitCode = 1;
}
