# Consignes et contexte du portfolio

## Préférences de travail

- Garder `README.md` entièrement vide. Centraliser ici la documentation technique
  et les décisions utiles aux futurs agents.
- `npm run readme:check` impose un fichier de zéro octet, y compris après résolution
  d’un conflit de merge. Ce contrôle fait partie de `npm run check` et du workflow
  `Documentation policy`, exécuté sur les PR et les push vers `main` et `dev`.
  Ne pas remettre d’ancien contenu du README lors d’un merge ; déplacer toute
  documentation pertinente ici. Conserver l’historique commun des branches plutôt
  que dupliquer les mêmes changements par cherry-pick.
- Répondre en français. Faire des changements ciblés, propres et modulaires,
  avec un formatage cohérent ; ne pas ajouter des commentaires ou refactoriser
  sans nécessité.
- Préserver le rendu et les interactions lors des optimisations. Le site doit
  rester fluide sur les configurations légères.
- Privilégier les vérifications automatisées pertinentes. Andrea prend en charge
  les vérifications manuelles de fonctionnement ; ne pas parcourir systématiquement
  toutes les interactions dans le navigateur sans demande spécifique.
- Adapter la validation au changement : documentation seule → formatage et diff ;
  code → contrôles pertinents ; export ou médias → compilation statique si nécessaire.
- Vérifier la branche et les changements existants avant toute opération Git.
  Ne pas déduire une autorisation permanente de push, de déploiement ou de réécriture
  de l’historique d’une demande ponctuelle dans une ancienne conversation.

## Architecture et points d’entrée

Portfolio Next.js 16 / React 19 / TypeScript, avec Tailwind CSS 4 et Motion.
L’hébergement utilise un export statique : aucun serveur Node.js en production.

| Sujet                                         | Fichiers principaux                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Page, structure et styles                     | `src/app/page.tsx`, `layout.tsx`, `globals.css`                                                              |
| Ouverture des bulles et sélection d’un projet | `src/components/project-orbit.tsx`                                                                           |
| Portrait, couvertures et cadrage              | `src/components/portrait-bubble.tsx`                                                                         |
| Fiche et galerie                              | `src/components/project-details.tsx`, `project-gallery.tsx`                                                  |
| Données, liens, textes et stacks              | `src/data/projects.ts`                                                                                       |
| Traductions et préférence de langue           | `src/lib/languages.ts`, `src/components/language-provider.tsx`                                               |
| Placement des bulles                          | `src/lib/orbit-layout.ts`                                                                                    |
| Modèle et rendu des particules                | `src/lib/orbit-particle-model.ts`, `src/components/orbit-particles.tsx`                                      |
| Budget et textures des particules             | `src/lib/animation-settings.ts`, `particle-sprite.ts`                                                        |
| Magnétisme mutualisé                          | `src/lib/magnetic-pointer.ts`, `src/hooks/use-magnetic-pull.ts`                                              |
| Génération et affichage des médias            | `scripts/optimize-media.mjs`, `src/lib/media.ts`, `src/components/responsive-image.tsx`, `looping-video.tsx` |

## Intentions visuelles et interactions à préserver

- Univers pastel, verre translucide, bulles flottantes et ambiance onirique.
  Les particules doivent garder une distribution irrégulière : éviter de les
  aligner en anneaux trop réguliers.
- Chaque projet reçoit à la fois des particules sur le chemin depuis le portrait
  et des particules autour de sa bulle. Un ancien couplage entre indice, type de
  particule et nombre de projets avait supprimé un des effets pour certains projets.
  Garder les tests de régression du modèle lors des changements.
- Les bulles et leurs effets se calculent depuis la liste des projets : ne pas
  coder un nombre fixe de projets ou ajouter des cas particuliers par projet
  dans le moteur de placement.
- Une fiche s’ouvre depuis sa bulle et se referme vers elle. Préserver l’accès au
  clavier, les libellés accessibles et la préférence de réduction des animations.
- La galerie conserve les proportions des médias et permet de naviguer au clic
  sur l’image et avec ses commandes. Ne pas réintroduire le bouton « Image suivante »
  superposé à l’image, retiré à la demande d’Andrea.
- Les liens dépôt et démo YouTube sont indépendants et optionnels : afficher un
  bouton uniquement si son URL est renseignée, sans inventer de lien.
- Le slogan est discret, en petite police sans serif : « Turning a bunch of pixels
  into a » puis « chef d’œuvre » en italique. Il disparaît à l’ouverture des projets.

## Contenus et ajout de projets

Ajouter une entrée à `projects` dans `src/data/projects.ts` avec un identifiant
unique et stable, au moins un média, une traduction française et sa version
anglaise. Le placement et les particules prennent automatiquement en compte la
liste. La couverture peut être différente du premier média de la galerie.

Les descriptions reprennent le style d’Andrea : courtes, concrètes, semi-formelles,
avec les techniques réellement utilisées et sans surévaluer sa contribution.
Le champ `stack` apparaît sous la description, dans une couleur distincte, pour
rendre les compétences lisibles aux recruteurs. Pour une nouvelle stack, s’appuyer
sur les sources du projet fourni ou de son dépôt, sans extrapoler.

Le français et l’anglais sont actuellement activés. L’infrastructure japonaise
existe, mais certains textes sont encore des placeholders : ne pas réactiver
`ja` dans `enabledLanguages` sans contenu prêt. La langue est conservée dans
`localStorage` sous `portfolio-language`, avec repli en français.

Choix actuels à conserver sauf demande de modification :

- OuterGL : couverture `OuterGL/A_new_start.png`, position `45% 50%`, zoom `1.85`.
- Doom-Like : couverture `DoomLike/mc.png`, position `20% 50%`. Les démonstrations
  `demo_doom.gif` et `demo_mc.gif` restent présentes dans la galerie via leurs
  vidéos optimisées.
- ChromAura : couverture `ChromAura/ronaldo.png`.
- GPGPU : `GPGPU/people.png`, zoom `1.4` pour la couverture uniquement ; pas de
  dépôt ni de démo renseignés.
- PBR : couverture `REPR/side.png`, titre « Moteur de rendu PBR » / « PBR Renderer ».
  Ce n’est pas un ray-tracer. Préciser le cadre du TP et la base WebGL2 fournie ;
  la contribution porte sur les BRDF Lambert et Cook-Torrance GGX, les shaders
  et les textures d’environnement, pas sur la création intégrale du moteur.
- Portrait : `portrait.jpg`. Le cadrage combine `object-fit: cover` et la position
  CSS dans `.portrait-bubble__image` avec `translateY(-4%) scale(1.1)` dans
  `portrait-bubble.tsx`. Les couvertures utilisent leurs propres `position` et
  `zoom` : ne pas modifier tous les projets pour ajuster le portrait.

## Hébergement et pièges connus

Le dépôt est `AndreaIzzillo/Portfolio`. Le domaine personnalisé configuré dans les
conversations de mise en ligne est `andrea.izzillo.com`, avec un CNAME DNS vers
`AndreaIzzillo.github.io`. Ces éléments décrivent la configuration historique ;
vérifier les réglages effectifs si une intervention d’hébergement est demandée.

Le workflow `.github/workflows/deploy-pages.yml` publie `out/` sur un push vers
`main` ou un déclenchement manuel. Un push sur `dev` ne déclenche pas ce workflow.
`PAGES_BASE_PATH` provient de `actions/configure-pages` ; `next.config.ts` le
transmet aussi au client via `NEXT_PUBLIC_BASE_PATH` pour les médias.

Ne pas fournir `static_site_generator: next` à `actions/configure-pages@v5` :
cette action ne détecte pas `next.config.ts` et génère un `next.config.js`
concurrent, qui fait notamment échouer le formatage en CI. Garder la configuration
Next.js dans le fichier TypeScript versionné ; l’action sert uniquement à récupérer
les métadonnées Pages, dont `base_path`.

Un incident précédent venait d’un build conservant `/Portfolio/` après le passage
au domaine personnalisé. Le chemin est fixé au build : après un changement de
domaine, reconstruire avec le chemin approprié, sans coder `/Portfolio/` en dur
ou contourner les helpers de médias. Conserver la compatibilité avec la racine
et avec un sous-chemin.

## Documentation technique

Portfolio Next.js exporté en site statique pour GitHub Pages.

## Développement

Prérequis : Node.js 22+, npm et FFmpeg (`ffmpeg` et `ffprobe` dans le PATH).
Sur macOS : `brew install ffmpeg`. Sur Ubuntu : `sudo apt-get install ffmpeg`.

```sh
npm ci
npm run dev
```

`npm run check` vérifie formatage, lint, TypeScript et tests.
`npm run build` génère le site dans `out/` ; `PAGES_BASE_PATH=/Portfolio npm run build`
permet de vérifier l’export sous un sous-chemin. Le workflow GitHub Pages installe
FFmpeg et fournit automatiquement le bon chemin.

## Ajouter ou remplacer un média

1. Placer les originaux dans `assets/images/` (sous-dossiers autorisés).
2. Lancer `npm run media:build`.
3. Référencer le média dans `src/data/projects.ts` avec `getMedia("Dossier/fichier.png")`.
   Le champ `src` contient cet objet, pour les couvertures comme pour la galerie.

La génération est aussi automatique avant `dev`, `build`, `typecheck` et `test`.
Après l’ajout d’un fichier pendant que le serveur tourne, relancer `media:build`.
Les clés du manifeste sont typées : une référence inexistante échoue à la compilation.

Les originaux sont conservés pour éviter les recompressions successives, mais ne
sont jamais copiés dans le site public. Le script produit :

- des WebP de 240, 480, 800, 1 200 et 1 600 px de largeur, sans agrandissement ;
- des vidéos MP4 H.264 silencieuses pour les GIF animés, avec images d’attente ;
- un manifeste avec les dimensions, variantes et empreintes de contenu.

Le navigateur sélectionne une seule variante selon la taille d’affichage et la
densité de l’écran, en tenant compte du recadrage et du zoom des bulles. La galerie
ne monte que le média actif. Les vidéos bouclent sans contrôles comme les anciens
GIF et se mettent en pause hors écran ou dans un onglet masqué. Si la lecture
est bloquée, l’image d’attente reste affichée ; la préférence de réduction des
animations utilise une image fixe.

Les fichiers `public/media/` et `src/data/media.generated.json` sont générés et
ignorés par Git. Le cache conserve les fichiers inchangés ; les URLs comportent
une empreinte qui change avec le contenu ou les paramètres. Les paramètres de
qualité et de taille se trouvent dans `scripts/optimize-media.mjs`.
`FFMPEG_PATH` et `FFPROBE_PATH` permettent de préciser les exécutables.

## Budget d’animation

Les paramètres du canvas sont centralisés dans `src/lib/animation-settings.ts` :
60 rendus/s maximum, densité maximale de 2 et surface maximale de quatre millions
de pixels. La densité de particules et leurs trajectoires restent inchangées.
Les halos sont précalculés en petites textures, puis composités à chaque image.
Les traînées n’allouent de points que pendant les transitions.

Le fond garde ses gradients, ses flous et ses mouvements ; sa silhouette ne change
plus de `border-radius` à chaque image. Le mouvement utilise des transformations
composables. Les animations d’ambiance sont suspendues derrière une fiche ouverte
et lorsque l’onglet est masqué. L’attraction magnétique partage un seul écouteur
et un seul traitement par image, avec les lectures de géométrie regroupées avant
les mises à jour. Motion ne charge que les fonctionnalités utilisées (`domAnimation`).

Pour comparer la fluidité, utiliser un export de production avec le même viewport,
la même densité d’écran et les mêmes actions : accueil, ouverture des bulles,
ouverture d’une fiche, navigation vers une vidéo, fermeture. Le serveur de
développement ajoute du travail qui ne représente pas le site déployé.
