"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

import {
  defaultLanguage,
  enabledLanguages,
  getNextLanguage,
  isLanguage,
  messages,
  type Language,
} from "@/lib/languages";

const storageKey = "portfolio-language";
const changeEvent = "portfolio-language-change";
let currentLanguage = defaultLanguage;

function readLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    currentLanguage = isLanguage(saved)
      ? enabledLanguages.includes(saved)
        ? saved
        : defaultLanguage
      : currentLanguage;
  } catch {
    // Local storage can be disabled; the in-memory preference remains usable.
  }

  return currentLanguage;
}

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(changeEvent, listener);
  };
}

type LanguageContextValue = {
  language: Language;
  cycleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => defaultLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function cycleLanguage() {
    currentLanguage = getNextLanguage(language);

    try {
      localStorage.setItem(storageKey, currentLanguage);
    } catch {
      // The in-memory value still keeps the preference for the current session.
    }

    window.dispatchEvent(new Event(changeEvent));
  }

  return (
    <LanguageContext.Provider value={{ language, cycleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) {
    throw new Error("useLanguage must be used within a LanguageProvider.");
  }

  return { ...value, t: messages[value.language] };
}
