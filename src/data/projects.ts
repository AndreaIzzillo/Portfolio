import type { StaticImageData } from "next/image";

import { requireAtLeastOne, type NonEmptyArray } from "@/lib/arrays";
import { messages, type Language } from "@/lib/languages";
import placeholder from "../../public/images/placeholder.png";

type ProjectAsset = {
  src: StaticImageData | string;
};

export type ProjectImage = ProjectAsset & {
  alt: string;
};

export type Project = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  images: NonEmptyArray<ProjectImage>;
  repoUrl?: string;
  demoUrl?: string;
};

export type ProjectDefinition = {
  id: number;
  images: NonEmptyArray<ProjectAsset>;
  repoUrl?: string;
  demoUrl?: string;
  translations: Record<Language, Pick<Project, "title" | "subtitle" | "description">>;
};

export const projects: ProjectDefinition[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  translations: {
    fr: {
      title: `Exploration visuelle ${String(index + 1).padStart(2, "0")}`,
      subtitle: "Une rencontre entre image, technique et créativité.",
      description:
        "Ce projet explore de nouvelles façons de créer et de transformer des images. De l’idée initiale au résultat final, il associe expérimentation visuelle et développement technique. Ce texte provisoire sera remplacé par la présentation détaillée du projet.",
    },
    en: {
      title: `Visual exploration ${String(index + 1).padStart(2, "0")}`,
      subtitle: "Where imagery, technology and creativity meet.",
      description:
        "This project explores new ways to create and transform images. From the initial idea to the final result, it combines visual experimentation with technical development. This placeholder text will be replaced with a detailed presentation of the project.",
    },
    ja: {
      title: `ビジュアルの探求 ${String(index + 1).padStart(2, "0")}`,
      subtitle: "画像、技術、創造性が出会う場所。",
      description:
        "このプロジェクトでは、画像を生み出し、変化させる新しい方法を探求しています。最初のアイデアから完成まで、視覚的な実験と技術開発を組み合わせています。この仮の文章は、今後プロジェクトの詳しい紹介に差し替える予定です。",
    },
  },
  images: requireAtLeastOne(
    Array.from({ length: index === 1 ? 1 : 3 }, () => ({
      src: placeholder,
    })),
    "A project must contain at least one image.",
  ),
  // Add repoUrl and/or demoUrl when the real public links are available.
}));

export function localizeProject(project: ProjectDefinition, language: Language): Project {
  return {
    id: project.id,
    ...project.translations[language],
    images: requireAtLeastOne(
      project.images.map((image, index) => ({
        ...image,
        alt: messages[language].imageAlt(index + 1, project.id),
      })),
      "A localized project must contain at least one image.",
    ),
    ...(project.repoUrl ? { repoUrl: project.repoUrl } : {}),
    ...(project.demoUrl ? { demoUrl: project.demoUrl } : {}),
  };
}
