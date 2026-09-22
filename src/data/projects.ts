import type { StaticImageData } from "next/image";

import { requireAtLeastOne, type NonEmptyArray } from "@/lib/arrays";
import { messages, type Language } from "@/lib/languages";
import outerGLNewStart from "../../public/images/OuterGL/A_new_start.png";
import outerGLSpace from "../../public/images/OuterGL/A_wide_and_empty_space.png";
import outerGLEclipse from "../../public/images/OuterGL/Is_this_a_solar_eclipse.png";
import outerGLEnd from "../../public/images/OuterGL/The_end.png";
import outerGLSystem from "../../public/images/OuterGL/The_full_system.png";
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
  cover?: ProjectAsset & { position?: string; zoom?: number };
  repoUrl?: string;
  demoUrl?: string;
};

export type ProjectDefinition = {
  id: number;
  images: NonEmptyArray<ProjectAsset>;
  cover?: Project["cover"];
  repoUrl?: string;
  demoUrl?: string;
  translations: Record<Language, Pick<Project, "title" | "subtitle" | "description">>;
};

export const projects: ProjectDefinition[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  ...(index === 0 ? { cover: { src: outerGLNewStart, position: "45% 50%", zoom: 1.85 } } : {}),
  translations: {
    fr:
      index === 0
        ? {
            title: "OuterGL",
            subtitle: "Système solaire miniature imaginaire",
            description:
              "Simulation en temps réel d’un système solaire miniature, développée en C++ avec OpenGL. Création de corps célestes mettant en scène différents styles artistiques à l’aide de shaders procéduraux, de textures et de modèles 3D.",
          }
        : {
            title: `Exploration visuelle ${String(index + 1).padStart(2, "0")}`,
            subtitle: "Une rencontre entre image, technique et créativité.",
            description:
              "Ce projet explore de nouvelles façons de créer et de transformer des images. De l’idée initiale au résultat final, il associe expérimentation visuelle et développement technique. Ce texte provisoire sera remplacé par la présentation détaillée du projet.",
          },
    en:
      index === 0
        ? {
            title: "OuterGL",
            subtitle: "Miniature imaginary solar system",
            description:
              "Real-time 3D space simulation built with C++ and OpenGL. Featuring celestial bodies with various artistic styles using procedural shaders, textures and 3D models.",
          }
        : {
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
    index === 0
      ? [
          { src: outerGLEclipse },
          { src: outerGLNewStart },
          { src: outerGLSpace },
          { src: outerGLSystem },
          { src: outerGLEnd },
        ]
      : Array.from({ length: index === 1 ? 1 : 3 }, () => ({
          src: placeholder,
        })),
    "A project must contain at least one image.",
  ),
  // Replace these placeholder links with each project's repository and video.
  repoUrl: index === 0 ? "https://github.com/AndreaIzzillo/OuterGL" : "https://github.com/",
  ...(index === 0 ? {} : { demoUrl: "https://www.youtube.com/" }),
}));

export function localizeProject(project: ProjectDefinition, language: Language): Project {
  return {
    id: project.id,
    ...(project.cover ? { cover: project.cover } : {}),
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
