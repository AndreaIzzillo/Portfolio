"use client";

import { useLanguage } from "@/components/language-provider";
import { getNextLanguage, languageNames } from "@/lib/languages";

export function LanguageToggle({ inDialog = false }: { inDialog?: boolean }) {
  const { language, cycleLanguage, t } = useLanguage();
  const next = getNextLanguage(language);
  const label = `${languageNames[language]} · ${t.switchLanguage(languageNames[next])}`;

  return (
    <button
      type="button"
      className={`glass-control language-toggle${inDialog ? " language-toggle--dialog" : ""}`}
      onClick={cycleLanguage}
      aria-label={label}
      title={label}
    >
      <span lang={language} aria-hidden="true">
        {language === "ja" ? "日本語" : language.toUpperCase()}
      </span>
    </button>
  );
}
