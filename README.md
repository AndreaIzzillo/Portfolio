# Portfolio d’Andrea Izzillo

## GIF animés dans les projets

Les GIF s’ajoutent à la liste `images` comme les PNG et JPEG. Privilégier un import statique pour connaître leurs dimensions dès le premier affichage et conserver la compatibilité avec le sous-chemin de déploiement :

```tsx
import demo from "../../public/images/REPR/demo.gif";

// Dans la définition du projet :
images: [{ src: demo }],
```

La galerie conserve le fichier original et son animation. Un chemin texte est également accepté ; ses proportions sont calculées au chargement. Le GIF peut être mélangé à des images fixes dans la même galerie.
