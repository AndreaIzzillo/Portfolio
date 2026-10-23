import { getMedia, type MediaAsset } from "@/lib/media";

import { mapNonEmpty, type NonEmptyArray } from "@/lib/arrays";
import { messages, type Language } from "@/lib/languages";
const chromAuraAura = getMedia("ChromAura/aura.png");
const chromAuraColorful = getMedia("ChromAura/colorful.png");
const chromAuraGunner = getMedia("ChromAura/gunner.png");
const chromAuraRonaldo = getMedia("ChromAura/ronaldo.png");
const chromAuraZigzag = getMedia("ChromAura/zigzag.png");
const doomLikeDemo = getMedia("DoomLike/demo.png");
const doomLikeDemoDoom = getMedia("DoomLike/demo_doom.gif");
const doomLikeDemoMc = getMedia("DoomLike/demo_mc.gif");
const doomLikeDoom = getMedia("DoomLike/doom.png");
const doomLikeMc = getMedia("DoomLike/mc.png");
const doomLikeShining = getMedia("DoomLike/shining.png");
const gpgpuPeople = getMedia("GPGPU/people.png");
const ivokSignalsBoxes = getMedia("IVoKSignals/boxes.png");
const ivokSignalsBright = getMedia("IVoKSignals/bright.png");
const ivokSignalsDark = getMedia("IVoKSignals/dark.png");
const ivokSignalsTwo = getMedia("IVoKSignals/two.png");
const outerGLNewStart = getMedia("OuterGL/A_new_start.png");
const outerGLSpace = getMedia("OuterGL/A_wide_and_empty_space.png");
const outerGLEclipse = getMedia("OuterGL/Is_this_a_solar_eclipse.png");
const outerGLEnd = getMedia("OuterGL/The_end.png");
const outerGLSystem = getMedia("OuterGL/The_full_system.png");
const reprAll = getMedia("REPR/all.png");
const reprDemo = getMedia("REPR/demo.gif");
const reprSide = getMedia("REPR/side.png");
const rayTracerEarth = getMedia("RayTracer/earth.png");
const rayTracerLights = getMedia("RayTracer/lights.png");
const rayTracerSuzanne = getMedia("RayTracer/suzanne.png");

type ProjectAsset = {
  src: MediaAsset;
};

export type ProjectImage = ProjectAsset & {
  alt: string;
};

export type Project = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  stack?: readonly string[];
  images: NonEmptyArray<ProjectImage>;
  cover?: ProjectAsset & { position?: string; zoom?: number; zoomOrigin?: string };
  repoUrl?: string;
  demoUrl?: string;
  presentationUrl?: string;
};

type ProjectText = Pick<Project, "title" | "subtitle" | "description">;

export type ProjectDefinition = {
  id: number;
  stack?: Project["stack"];
  images: NonEmptyArray<ProjectAsset>;
  cover?: Project["cover"];
  repoUrl?: string;
  demoUrl?: string;
  presentationUrl?: string;
  translations: Record<"fr", ProjectText> & Partial<Record<Exclude<Language, "fr">, ProjectText>>;
};

// Add or remove an entry here; bubbles and particles use this list automatically.
export const projects: ProjectDefinition[] = [
  {
    id: 1,
    stack: ["C++17", "OpenGL 4.3", "GLSL", "GLEW", "FreeGLUT", "GLM", "tinygltf", "CMake"],
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
    stack: ["C++17", "SFML 3", "OpenMP", "CMake"],
    cover: { src: doomLikeMc, position: "20% 50%" },
    images: [
      { src: doomLikeDoom },
      { src: doomLikeDemoDoom },
      { src: doomLikeDemo },
      { src: doomLikeMc },
      { src: doomLikeDemoMc },
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
    stack: ["Godot 4", "C#", ".NET 8", "GDScript", "MediaPipe / GDMP", "Kinect / gd-depthcam"],
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
  {
    id: 4,
    stack: ["C++17", "CUDA", "cuRAND", "GStreamer", "CMake"],
    cover: { src: gpgpuPeople, zoom: 1.4 },
    images: [{ src: gpgpuPeople }],
    translations: {
      fr: {
        title: "Projet GPGPU",
        subtitle: "Détection de mouvement accélérée sur GPU",
        description:
          "Développement d’un filtre GStreamer en C++ et CUDA pour distinguer les objets mobiles du fond d’une vidéo. Le traitement estime le fond, nettoie le masque de mouvement et met les zones détectées en évidence en rouge. Comparaison des performances des versions CPU et GPU.",
      },
      en: {
        title: "GPGPU Project",
        subtitle: "GPU-accelerated motion detection",
        description:
          "Development of a GStreamer filter in C++ and CUDA to separate moving objects from the background of a video. The processing estimates the background, cleans up the motion mask and highlights detected areas in red. Performance comparison of the CPU and GPU versions.",
      },
    },
  },
  {
    id: 5,
    stack: ["TypeScript", "WebGL 2", "GLSL", "Vite"],
    cover: { src: reprSide },
    images: [{ src: reprSide }, { src: reprAll }, { src: reprDemo }],
    translations: {
      fr: {
        title: "Moteur de rendu PBR",
        subtitle: "BRDF photoréalistes et éclairage par environnement",
        description:
          "Réalisation d’un rendu PBR dans le cadre d’un TP, à partir d’une base de code WebGL2 fournie. Écriture de shaders intégrant la BRDF diffuse de Lambert et la BRDF spéculaire de Cook-Torrance GGX pour faire varier la rugosité et la métallicité des matériaux. Chargement et transfert des textures d’environnement vers le GPU pour l’éclairage et les réflexions précalculées, selon une approche notamment utilisée par Unreal Engine 4.",
      },
      en: {
        title: "PBR Renderer",
        subtitle: "Photorealistic BRDFs and environment lighting",
        description:
          "PBR rendering project created for a course assignment using a provided WebGL2 codebase. Development of shaders combining a Lambertian diffuse BRDF and a Cook-Torrance GGX specular BRDF to vary material roughness and metallicity. Loading and transferring environment textures to the GPU for lighting and precomputed reflections, following an approach also used by Unreal Engine 4.",
      },
    },
  },
  {
    id: 6,
    stack: ["C++17", "Make"],
    cover: { src: rayTracerSuzanne },
    images: [{ src: rayTracerSuzanne }, { src: rayTracerLights }, { src: rayTracerEarth }],
    repoUrl: "https://github.com/AndreaIzzillo/ISIM-TP-RayTracer",
    translations: {
      fr: {
        title: "Raytracer CPU",
        subtitle: "Rendu par lancer de rayons et modèle de Phong",
        description:
          "Développement d’un raytracer CPU en C++ dans le cadre d’un TP de synthèse d’images. Le rendu suit le modèle d’éclairage de Phong, avec gestion des ombres, des réflexions récursives et des textures. Prise en charge de sphères et de maillages chargés depuis des fichiers OBJ.",
      },
      en: {
        title: "CPU Raytracer",
        subtitle: "Ray tracing with the Phong shading model",
        description:
          "Development of a CPU raytracer in C++ for a computer graphics course assignment. Rendering uses the Phong shading model, with shadows, recursive reflections and textures. Support for spheres and meshes loaded from OBJ files.",
      },
    },
  },
  {
    id: 7,
    stack: ["Python", "C++", "HOG", "HSV", "Linear SVM"],
    cover: {
      src: ivokSignalsTwo,
      position: "-30% 50%",
      zoom: 2.35,
      zoomOrigin: "40% 70%",
    },
    images: [
      { src: ivokSignalsBright },
      { src: ivokSignalsDark },
      { src: ivokSignalsTwo },
      { src: ivokSignalsBoxes },
    ],
    presentationUrl: "/presentations/ivok-signals.pdf",
    translations: {
      fr: {
        title: "IVoK Signals",
        subtitle: "Détection de panneaux routiers",
        description:
          "Développement en binôme d’un programme de détection et de reconnaissance de panneaux routiers, prototypé en Python puis réimplémenté en C++. Recherche de zones candidates à partir des couleurs et des contours, puis extraction de descripteurs HOG, d’un histogramme HSV et de statistiques de couleur. Un premier SVM distingue les panneaux du décor, puis un second identifie leur classe.",
      },
      en: {
        title: "IVoK Signals",
        subtitle: "Traffic sign detection",
        description:
          "Traffic sign detection and recognition program developed in a team of two, prototyped in Python then reimplemented in C++. Candidate regions are located using colours and contours, then described using HOG features, an HSV histogram and colour statistics. A first SVM separates signs from the background, and a second identifies their class.",
      },
    },
  },
];

export function localizeProject(project: ProjectDefinition, language: Language): Project {
  const translation = project.translations[language] ?? project.translations.fr;
  const { images, id, cover, repoUrl, demoUrl, presentationUrl, stack } = project;
  return {
    id,
    stack,
    cover,
    repoUrl,
    demoUrl,
    presentationUrl,
    ...translation,
    images: mapNonEmpty(images, (image, index) => ({
      ...image,
      alt: messages[language].imageAlt(index + 1, translation.title),
    })),
  };
}
