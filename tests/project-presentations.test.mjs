import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function loadModule(path, imports = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const compiledModule = { exports: {} };
  const resolve = (name) => (Object.hasOwn(imports, name) ? imports[name] : require(name));
  new Function("require", "module", "exports", outputText)(
    resolve,
    compiledModule,
    compiledModule.exports,
  );
  return compiledModule.exports;
}

const manifest = JSON.parse(
  await readFile(new URL("../src/data/media.generated.json", import.meta.url), "utf8"),
);
const media = await loadModule("../src/lib/media.ts", { "@/data/media.generated.json": manifest });
const languages = await loadModule("../src/lib/languages.ts");
const arrays = await loadModule("../src/lib/arrays.ts");
const { projects, localizeProject } = await loadModule("../src/data/projects.ts", {
  "@/lib/media": media,
  "@/lib/arrays": arrays,
  "@/lib/languages": languages,
});

let language = "fr";
const { ProjectDetails } = await loadModule("../src/components/project-details.tsx", {
  "@/components/bubble-dialog": {
    BubbleDialog: ({ children }) => createElement("article", null, children),
  },
  "@/components/language-provider": { useLanguage: () => ({ t: languages.messages[language] }) },
  "@/components/language-toggle": { LanguageToggle: () => null },
  "@/components/project-gallery": { ProjectGallery: () => null },
  "@/lib/media": media,
});

function render(project) {
  return renderToStaticMarkup(
    createElement(ProjectDetails, {
      project,
      origin: { x: 0, y: 0 },
      closing: false,
      onRequestClose() {},
      onDismiss() {},
    }),
  );
}

const ivok = projects.find((project) => project.translations.fr.title === "IVoK Signals");

test("IVoK has both translations, all supplied images and its local presentation", async () => {
  assert(ivok);
  assert.equal(new Set(projects.map((project) => project.id)).size, projects.length);
  assert.equal(ivok.images.length, 4);
  for (const image of ["boxes", "bright", "dark", "two"]) {
    assert(ivok.images.some(({ src }) => src === manifest[`IVoKSignals/${image}.png`]));
  }
  for (const code of ["fr", "en"]) {
    assert(ivok.translations[code]?.description);
    assert.equal(localizeProject(ivok, code).presentationUrl, ivok.presentationUrl);
  }
  const pdf = await readFile(new URL(`../public${ivok.presentationUrl}`, import.meta.url));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
});

test("a presentation-only project renders its translated PDF link at root and under a base path", () => {
  const previous = process.env.NEXT_PUBLIC_BASE_PATH;
  try {
    for (const base of ["", "/Portfolio"]) {
      process.env.NEXT_PUBLIC_BASE_PATH = base;
      for (language of ["fr", "en"]) {
        const html = render(localizeProject(ivok, language));
        assert(html.includes(`href="${base}/presentations/ivok-signals.pdf"`));
        assert(html.includes(languages.messages[language].presentation));
        assert(html.includes(`(PDF, ${languages.messages[language].newTab})`));
        assert(html.includes('target="_blank"'));
        assert(html.includes('rel="noopener noreferrer"'));
        assert.equal((html.match(/<a\b/g) ?? []).length, 1);
      }
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = previous;
  }
});

test("project actions remain independent and external presentation URLs remain intact", () => {
  language = "fr";
  const project = localizeProject(ivok, language);
  const html = render({
    ...project,
    repoUrl: "https://example.com/code",
    demoUrl: "https://example.com/demo",
    presentationUrl: "https://example.com/slides.pdf",
  });
  for (const url of ["code", "demo", "slides.pdf"])
    assert(html.includes(`href="https://example.com/${url}"`));
  assert.equal((html.match(/<a\b/g) ?? []).length, 3);
  const withoutPresentation = render({ ...project, presentationUrl: undefined });
  assert(!withoutPresentation.includes("project-detail__actions"));
  const repositoryOnly = render({
    ...project,
    presentationUrl: undefined,
    repoUrl: "https://example.com/code",
  });
  assert(repositoryOnly.includes(languages.messages.fr.code));
  assert(!repositoryOnly.includes(languages.messages.fr.presentation));
});
