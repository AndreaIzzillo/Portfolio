# Portfolio d’Andrea Izzillo

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
