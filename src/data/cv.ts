import type { Language } from "@/lib/languages";
import { getMedia } from "@/lib/media";

const cvs = {
  fr: {
    file: "/cv/CV_Andrea_Izzillo_FR.pdf",
    preview: getMedia("CV/fr.png"),
  },
  en: {
    file: "/cv/CV_Andrea_Izzillo_EN.pdf",
    preview: getMedia("CV/en.png"),
  },
};

export function getCv(language: Language) {
  return cvs[language === "en" ? "en" : "fr"];
}
