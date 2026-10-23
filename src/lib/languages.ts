export const languages = ["fr", "en", "ja"] as const;
export type Language = (typeof languages)[number];

// Add "ja" here when the Japanese content is ready; its support remains in place.
export const enabledLanguages: readonly Language[] = ["fr", "en"];

export const defaultLanguage: Language = "fr";

export function isLanguage(value: string | null): value is Language {
  return languages.some((language) => language === value);
}

export function getNextLanguage(language: Language): Language {
  const currentIndex = enabledLanguages.indexOf(language);
  return enabledLanguages[(currentIndex + 1) % enabledLanguages.length] ?? defaultLanguage;
}

export const languageNames: Record<Language, string> = {
  fr: "Français",
  en: "English",
  ja: "日本語",
};

type Messages = {
  portfolioTools: string;
  showCv: string;
  cvTitle: string;
  closeCv: string;
  downloadCv: string;
  openCv: string;
  cvPreview: string;
  techStack: string;
  showProjects: string;
  hideProjects: string;
  projects: string;
  discover: string;
  closeProject: string;
  gallery: string;
  nextImage: string;
  previousImage: string;
  code: string;
  demo: string;
  newTab: string;
  portrait: string;
  showImage: (index: number) => string;
  imagePosition: (index: number, total: number) => string;
  imageAlt: (index: number, projectTitle: string) => string;
  switchLanguage: (languageName: string) => string;
};

export const messages: Record<Language, Messages> = {
  fr: {
    portfolioTools: "Ressources du portfolio",
    showCv: "Afficher mon CV",
    cvTitle: "Mon CV",
    closeCv: "Fermer le CV",
    downloadCv: "Télécharger",
    openCv: "Ouvrir le PDF",
    cvPreview: "CV d’Andrea Izzillo en français",
    techStack: "Stack technique",
    showProjects: "Afficher les projets",
    hideProjects: "Masquer les projets",
    projects: "Projets",
    discover: "Découvrir",
    closeProject: "Fermer le projet",
    gallery: "Images du projet",
    nextImage: "Image suivante",
    previousImage: "Image précédente",
    showImage: (n: number) => `Afficher l’image ${n}`,
    imagePosition: (n: number, total: number) =>
      `Image ${n} sur ${total}. Afficher l’image suivante`,
    imageAlt: (n: number, title: string) => `Image ${n} — ${title}`,
    code: "Voir le code",
    demo: "Voir la démo",
    newTab: "nouvel onglet",
    portrait: "Portrait d’Andrea Izzillo",
    switchLanguage: (next: string) => `Changer de langue : ${next}`,
  },
  en: {
    portfolioTools: "Portfolio resources",
    showCv: "View my CV",
    cvTitle: "My CV",
    closeCv: "Close CV",
    downloadCv: "Download",
    openCv: "Open PDF",
    cvPreview: "Andrea Izzillo’s CV in English",
    techStack: "Tech stack",
    showProjects: "Show projects",
    hideProjects: "Hide projects",
    projects: "Projects",
    discover: "Explore",
    closeProject: "Close project",
    gallery: "Project images",
    nextImage: "Next image",
    previousImage: "Previous image",
    showImage: (n: number) => `Show image ${n}`,
    imagePosition: (n: number, total: number) => `Image ${n} of ${total}. Show next image`,
    imageAlt: (n: number, title: string) => `Image ${n} — ${title}`,
    code: "View code",
    demo: "Watch demo",
    newTab: "new tab",
    portrait: "Portrait of Andrea Izzillo",
    switchLanguage: (next: string) => `Switch language to ${next}`,
  },
  ja: {
    portfolioTools: "ポートフォリオ資料",
    showCv: "履歴書を表示",
    cvTitle: "履歴書",
    closeCv: "履歴書を閉じる",
    downloadCv: "ダウンロード",
    openCv: "PDFを開く",
    cvPreview: "Andrea Izzilloの履歴書（フランス語）",
    techStack: "使用技術",
    showProjects: "プロジェクトを表示",
    hideProjects: "プロジェクトを閉じる",
    projects: "プロジェクト",
    discover: "詳しく見る：",
    closeProject: "プロジェクトを閉じる",
    gallery: "プロジェクトの画像",
    nextImage: "次の画像",
    previousImage: "前の画像",
    showImage: (n: number) => `画像${n}を表示`,
    imagePosition: (n: number, total: number) => `全${total}枚中${n}枚目。次の画像を表示`,
    imageAlt: (n: number, title: string) => `${title}の画像${n}`,
    code: "コードを見る",
    demo: "デモを見る",
    newTab: "新しいタブ",
    portrait: "Andrea Izzilloのポートレート",
    switchLanguage: (next: string) => `言語を${next}に切り替える`,
  },
};
