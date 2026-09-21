# Portfolio d’Andrea Izzillo

Socle technique du portfolio d’Andrea Izzillo, étudiant à EPITA en majeure IMAGE, destiné à présenter ses projets aux recruteurs.

## Installation

Prérequis : Node.js 22 ou supérieur et npm. Utiliser une version LTS de Node.js pour l’hébergement.

```bash
npm ci
npm run dev
```

Le site est accessible sur http://localhost:3000. Aucune variable d’environnement ni aucun service externe n’est nécessaire.

## Commandes

| Commande            | Utilité                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `npm run dev`       | Serveur de développement Next.js avec rechargement automatique        |
| `npm run lint`      | Vérification ESLint                                                   |
| `npm run typecheck` | Génération des types Next.js et vérification TypeScript sans émission |
| `npm run format`    | Formatage automatique avec Prettier                                   |
| `npm run check`     | Formatage, lint et typage sans modifier les fichiers                  |
| `npm run build`     | Compilation de production                                             |

Le lint est indépendant du build. Conserver `package-lock.json` dans le contrôle de version et utiliser `npm ci` pour reproduire l’installation.

Dans un environnement restreint qui bloque les ports internes de Turbopack, utiliser `npm run build -- --webpack`. Les scripts standard conservent Turbopack par défaut.

## Structure et stack

- `src/app/layout.tsx` : document HTML en français et métadonnées communes.
- `src/app/page.tsx` : page d’accueil avec le portrait au centre de l’écran.
- `src/components/portrait-bubble.tsx` : structure partagée des bulles.
- `src/components/project-orbit.tsx` : état et orchestration de l’expérience centrale.
- `src/components/project-details.tsx` et `project-gallery.tsx` : fiche d’un projet et galerie.
- `src/components/dream-background.tsx` : fond décoratif commun, composé de quatre formes pastel animées en CSS.
- `src/hooks/` : comportements réutilisables de mesure et d’attraction magnétique.
- `src/data/projects.ts` : contenus, images et liens des projets.
- `src/lib/` : types et fonctions pures pour les langues, tableaux et positions.
- `src/app/globals.css` : import Tailwind CSS 4 et styles globaux personnalisés.
- `next.config.ts` : export statique et images non optimisées côté serveur.
- `postcss.config.mjs` : intégration Tailwind CSS via PostCSS.
- `eslint.config.mjs` et `tsconfig.json` : qualité et TypeScript strict.

Next.js 16 utilise l’App Router et React. L’alias `@/*` pointe vers `src/*`. Les composants restent des Server Components par défaut ; ajouter une frontière `"use client"` uniquement lorsque les interactions le nécessitent.

Motion (`motion/react`) anime l’attraction du portrait avec des ressorts. GSAP (dont ScrollTrigger), `@gsap/react` et Lenis sont installés mais restent inactifs. Les interactions sont isolées côté client, avec nettoyage des écouteurs et respect de la préférence de mouvement réduit. WebGL, GLSL et Three.js seront envisagés uniquement si un effet futur le justifie.

## Déploiement statique

Le projet est configuré avec `output: "export"` : `npm run build` génère un site statique dans `out/`. Aucun serveur Node.js n’est nécessaire après la compilation.

```bash
npm ci
npm run build
```

Envoyer ensuite le contenu de `out/` dans le dossier web de l’hébergeur (par exemple `www/` chez OVH). Les fichiers du projet, `node_modules/`, `.next/` et la commande `npm start` ne sont pas nécessaires sur l’hébergement statique.

L’optimisation d’images Next.js est désactivée dans `next.config.ts`, car elle nécessite normalement un serveur Next.js. Les images sont donc servies directement depuis `out/`.

## Direction graphique et interactions

Un essaim Canvas 2D (`src/components/orbit-particles.tsx`) accompagne les bulles : 225 particules sur grand écran, 125 sur mobile, halo central au repos, dispersion avec traînées à l’ouverture, chemins courbes et petits essaims autour des projets, puis réaspiration à la fermeture. Les positions des projets et les destinations des particules partagent `src/lib/orbit-layout.ts`. Les transitions repartent de leur progression actuelle en cas de clics rapides. La résolution du canvas est plafonnée à un ratio de pixels de 2 ; la boucle s’arrête lorsque l’onglet ou la scène n’est plus visible. Avec la réduction des mouvements, le canvas affiche une constellation fixe adaptée à l’état ouvert ou fermé.

Le portfolio suit une direction **Frutiger Aero**, simple et épurée. Le premier élément réalisé est un fond lumineux avec de longues formes floues menthe, bleu ciel, lilas et pêche. Elles se déplacent et se déforment lentement, avec des cycles décalés pour éviter un mouvement synchronisé. Le fond est fixe, adapté aux petits écrans, ignoré par les lecteurs d’écran et ne capte aucune interaction. Les animations s’arrêtent lorsque `prefers-reduced-motion` est activé.

Les couleurs, dimensions et durées du fond sont définies par les variables CSS des classes `.dream-ribbon--*` dans `src/app/globals.css`. Le fond utilise uniquement CSS, sans JavaScript d’animation ni WebGL, avec un grain SVG fixe.

La bulle centrale affiche `public/images/portrait.jpg` avec `next/image`, un recadrage circulaire, un bord pastel progressif changeant et des reflets légers. Elle flotte de quelques pixels autour du centre. Sur les appareils avec souris, l’attraction apparaît à moins de 120 px du bord et reste limitée à 9 px, avec un retour au centre amorti. Le repère de mesure reste immobile pour éviter une rétroaction du mouvement. Les mouvements sont désactivés avec la préférence de réduction des animations. Un clic sur le portrait déploie cinq bulles projet plus petites ; un second clic les réaspire vers le centre. La touche Échap les referme également et rend le focus au portrait. Les bulles masquées sont inaccessibles au clavier pendant leur disparition.

Les cinq projets provisoires sont définis dans `src/data/projects.ts`. Ils partagent le composant `FloatingBubble` avec le portrait : vignette pastel, reflets, attraction de proximité et survol à +6 %. Leurs flottements sont décalés. Sur mobile, ils se répartissent au-dessus et en dessous du portrait ; sur écran très bas, la scène conserve 560 px de hauteur et peut défiler.

Cliquer une bulle ouvre une fiche de verre dépoli depuis son point d’origine. La galerie circulaire avance au clic sur l’image ; les flèches, les points et les touches gauche/droite sur l’image permettent également de naviguer. Une image unique masque les commandes de navigation. La fiche se referme vers la bulle avec la croix, un clic à l’extérieur ou Échap. Le dialogue natif conserve le focus pendant son ouverture et le rend au déclencheur à la fermeture. Sur mobile, la galerie passe au-dessus des textes et la fiche défile si nécessaire.

Chaque projet contient `translations.fr`, `translations.en` et `translations.ja`, chacune avec `title`, `subtitle` et `description`, ainsi qu’un tableau non vide `images` (champs `src` et `alt`). La première image sert aussi de couverture à la petite bulle. Ajouter `repoUrl` pour afficher « Voir le code » et `demoUrl` pour afficher « Voir la démo » avec une URL YouTube. Ces champs sont indépendants et facultatifs : aucun bouton ni espace d’action vide n’est affiché en leur absence. Les liens s’ouvrent dans un nouvel onglet. Les données actuelles utilisent des textes provisoires traduits et `public/images/placeholder.png`, sans URL fictive. Le deuxième projet illustre le cas d’une image unique ; les autres en contiennent trois.

Le bouton rond en haut à droite parcourt français → anglais → japonais. Il est aussi présent dans les fiches ouvertes, sans réinitialiser leur galerie. La préférence est mémorisée sous `portfolio-language` dans le stockage local ; le français est utilisé par défaut. `src/lib/languages.ts` centralise les libellés des commandes et les textes accessibles. L’attribut `lang` du document suit la sélection ; le slogan conserve ses langues explicitement déclarées.
