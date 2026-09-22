# Portfolio d’Andrea Izzillo

## Ajouter ou retirer un projet

Les projets affichés sont les entrées de `src/data/projects.ts`, dans l’ordre de la liste.

- Ajouter les images dans `public/images/<Projet>/`, puis les importer dans ce fichier.
- Ajouter une entrée avec un `id` unique et stable, au moins une image, et les textes français dans `translations.fr`. Les traductions manquantes utilisent le français.
- `cover` est facultatif : sans lui, la première image sert de vitrine. `position` et `zoom` permettent de régler son cadrage.
- Ajouter `repoUrl` et/ou `demoUrl` uniquement si le lien existe. Un lien absent masque le bouton correspondant.
- Pour retirer un projet, supprimer son entrée sans renuméroter les autres identifiants.

Le placement, les particules, les galeries et les titres circulaires suivent automatiquement cette liste. Le japonais est conservé mais désactivé dans `enabledLanguages` (`src/lib/languages.ts`).

Vérification : `npm run check`. Aperçu : `npm run dev`.

Les particules sont générées par projet dans `src/lib/orbit-particle-model.ts`, avec une répartition explicite entre chemins et halos. `npm test` vérifie cette répartition pour différents nombres de projets, y compris les multiples de trois. Ces tests sont aussi exécutés par `npm run check`.
