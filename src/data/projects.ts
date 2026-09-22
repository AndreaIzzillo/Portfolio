import type { StaticImageData } from "next/image";

import { mapNonEmpty, type NonEmptyArray } from "@/lib/arrays";
import { messages, type Language } from "@/lib/languages";
import chromAuraAura from "../../public/images/ChromAura/aura.png";
import chromAuraColorful from "../../public/images/ChromAura/colorful.png";
import chromAuraGunner from "../../public/images/ChromAura/gunner.png";
import chromAuraRonaldo from "../../public/images/ChromAura/ronaldo.png";
import chromAuraZigzag from "../../public/images/ChromAura/zigzag.png";
import doomLikeDemo from "../../public/images/DoomLike/demo.png";
import doomLikeDoom from "../../public/images/DoomLike/doom.png";
import doomLikeMc from "../../public/images/DoomLike/mc.png";
import doomLikeShining from "../../public/images/DoomLike/shining.png";
import outerGLNewStart from "../../public/images/OuterGL/A_new_start.png";
import outerGLSpace from "../../public/images/OuterGL/A_wide_and_empty_space.png";
import outerGLEclipse from "../../public/images/OuterGL/Is_this_a_solar_eclipse.png";
import outerGLEnd from "../../public/images/OuterGL/The_end.png";
import outerGLSystem from "../../public/images/OuterGL/The_full_system.png";

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

type ProjectText = Pick<Project, "title" | "subtitle" | "description">;

export type ProjectDefinition = {
  id: number;
  images: NonEmptyArray<ProjectAsset>;
  cover?: Project["cover"];
  repoUrl?: string;
  demoUrl?: string;
  translations: Record<"fr", ProjectText> & Partial<Record<Exclude<Language, "fr">, ProjectText>>;
};

// Add or remove an entry here; bubbles and particles use this list automatically.
export const projects: ProjectDefinition[] = [
  {
    id: 1,
    cover: { src: outerGLNewStart, position: "45% 50%", zoom: 1.85 },
    images: [
      { src: outerGLEclipse },
      { src: outerGLNewStart },
      { src: outerGLSpace },
      { src: outerGLSystem },
      { src: outerGLEnd },
    ],
    repoUrl: "https://github.com/AndreaIzzillo/OuterGL",
    translations: {
      fr: {
        title: "OuterGL",
        subtitle: "Système solaire miniature imaginaire",
        description:
          "Simulation en temps réel d’un système solaire miniature, développée en C++ avec OpenGL. Création de corps célestes mettant en scène différents styles artistiques à l’aide de shaders procéduraux, de textures et de modèles 3D.",
      },
      en: {
        title: "OuterGL",
        subtitle: "Miniature imaginary solar system",
        description:
          "Real-time 3D space simulation built with C++ and OpenGL. Featuring celestial bodies with various artistic styles using procedural shaders, textures and 3D models.",
      },
      ja: {
        title: "ビジュアルの探求 01",
        subtitle: "画像、技術、創造性が出会う場所。",
        description:
          "このプロジェクトでは、画像を生み出し、変化させる新しい方法を探求しています。最初のアイデアから完成まで、視覚的な実験と技術開発を組み合わせています。この仮の文章は、今後プロジェクトの詳しい紹介に差し替える予定です。",
      },
    },
  },
  {
    id: 2,
    cover: { src: doomLikeDoom, position: "85% 50%" },
    images: [
      { src: doomLikeDoom },
      { src: doomLikeDemo },
      { src: doomLikeMc },
      { src: doomLikeShining },
    ],
    repoUrl: "https://github.com/AndreaIzzillo/DoomLike-Engine",
    translations: {
      fr: {
        title: "Moteur Doom-Like",
        subtitle: "Moteur de ray casting 2.5D",
        description:
          "Création d’un moteur de jeu inspiré des techniques de rendu de Doom (1993). Le moteur prend en charge des environnements organisés en secteurs, avec des sols, des plafonds et des murs texturés, ainsi que des sprites. Il propose également des fonctionnalités supplémentaires, comme l’éclairage dynamique.",
      },
      en: {
        title: "Doom-Like Engine",
        subtitle: "2.5D ray casting engine",
        description:
          "Game engine inspired by the rendering techniques of Doom (1993). Featuring sectors with textured floors, ceilings and walls, sprites, and extra features such as dynamic lighting.",
      },
      ja: {
        title: "ビジュアルの探求 02",
        subtitle: "画像、技術、創造性が出会う場所。",
        description:
          "このプロジェクトでは、画像を生み出し、変化させる新しい方法を探求しています。最初のアイデアから完成まで、視覚的な実験と技術開発を組み合わせています。この仮の文章は、今後プロジェクトの詳しい紹介に差し替える予定です。",
      },
    },
  },
  {
    id: 3,
    cover: { src: chromAuraRonaldo },
    images: [
      { src: chromAuraAura },
      { src: chromAuraColorful },
      { src: chromAuraGunner },
      { src: chromAuraRonaldo },
      { src: chromAuraZigzag },
    ],
    repoUrl: "https://github.com/Ggabin018/ChromAura",
    translations: {
      fr: {
        title: "ChromAura",
        subtitle: "Donnez vie à votre silhouette",
        description:
          "Création et production d’une expérience immersive plongeant l’utilisateur dans un monde onirique à l’aide d’une Kinect. Génération de particules et développement de nombreuses fonctionnalités avec Godot. Conçu à l’occasion de la Codefest Week organisée à l’EPITA, le projet a obtenu la deuxième place parmi cinq projets à l’issue du vote du jury.",
      },
      en: {
        title: "ChromAura",
        subtitle: "Bring your silhouette to life",
        description:
          "Creation and production of an immersive experience taking users into a dreamlike world using a Kinect. Featuring particle generation and various features implemented with Godot. Created during Codefest Week at EPITA, the project placed second out of five projects following the jury’s vote.",
      },
      ja: {
        title: "ビジュアルの探求 03",
        subtitle: "画像、技術、創造性が出会う場所。",
        description:
          "このプロジェクトでは、画像を生み出し、変化させる新しい方法を探求しています。最初のアイデアから完成まで、視覚的な実験と技術開発を組み合わせています。この仮の文章は、今後プロジェクトの詳しい紹介に差し替える予定です。",
      },
    },
  },
];

export function localizeProject(project: ProjectDefinition, language: Language): Project {
  const translation = project.translations[language] ?? project.translations.fr;
  const { images, id, cover, repoUrl, demoUrl } = project;
  return {
    id,
    cover,
    repoUrl,
    demoUrl,
    ...translation,
    images: mapNonEmpty(images, (image, index) => ({
      ...image,
      alt: messages[language].imageAlt(index + 1, translation.title),
    })),
  };
}
