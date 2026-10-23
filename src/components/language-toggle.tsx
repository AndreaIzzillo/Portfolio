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
      <span className="language-toggle__flag" aria-hidden="true">
        <svg viewBox="0 0 60 40" fill="none" focusable="false">
          {language === "fr" ? (
            <>
              <path fill="#3059a6" d="M0 0h20v40H0z" />
              <path fill="#fffaf4" d="M20 0h20v40H20z" />
              <path fill="#e66978" d="M40 0h20v40H40z" />
            </>
          ) : language === "en" ? (
            <>
              <path fill="#36558e" d="M0 0h60v40H0z" />
              <path stroke="#fffaf4" strokeWidth="9" d="m0 0 60 40M60 0 0 40" />
              <path
                fill="#e66978"
                d="m0 0 27 18h-6L0 4zm60 0L33 18v-4L54 0zM0 40l27-18v4L6 40zm60 0L33 22h6l21 14z"
              />
              <path stroke="#fffaf4" strokeWidth="14" d="M30 0v40M0 20h60" />
              <path stroke="#e66978" strokeWidth="8" d="M30 0v40M0 20h60" />
            </>
          ) : (
            <>
              <path fill="#fffaf4" d="M0 0h60v40H0z" />
              <circle cx="30" cy="20" r="12" fill="#e66978" />
            </>
          )}
        </svg>
      </span>
    </button>
  );
}
