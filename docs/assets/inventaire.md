# Créatures, œufs et boutique : décisions et inventaire des assets

Issu de la séance de cadrage du 2026-11-19. **Ce document remplace la section 4 de `CLAUDE.md` là où ils diffèrent.**
Vocabulaire : voir `GLOSSARY.md` (Espèce, Créature, Compagnon, Qualité, Stade, Évolution, Œuf, Coffre, Besoin).

## Décisions

### Qualités
- 5 qualités, partagées par les espèces, les œufs et les badges : **Commun** (gris), **Peu commun** (vert), **Rare** (bleu), **Épique** (violet), **Légendaire** (orange).
- Les badges passent de 4 à 5 qualités (Normal → Commun, ajout de Peu commun) : changer `rarityFor`, rien à migrer.
- Règle du bestiaire : bas = animaux réels simples, haut = créatures inventées de plus en plus folles (créations originales).

### Œufs et coffre
- Un œuf par qualité de Commun à Épique (4 œufs). On voit la qualité, pas l'espèce.
- Chaque Légendaire a **son propre œuf**, qui laisse deviner la créature.
- Tout nouvel œuf (boutique, fin de partie, badge, filet de sécurité) arrive dans un **Coffre** qu'on ouvre : la surprise est à l'ouverture.
- Éclosion : secousse et fissures dessinées par le code (SVG) + une coquille cassée (image) partagée par tous les œufs.

### Stades et évolution
- 4 stades : **Bébé, Petit, Grand, Super**. Le stade se déduit de l'XP de la créature (ajouter un stade plus tard = ajouter des images).
- Le compagnon gagne 1 XP par bonne réponse, s'il est actif et pas triste.
- Seuils : Petit 150, Grand 600, Super 1 500.
- L'évolution est une mise en scène de **5 s**, déclenchée par un toucher : anticipation, clignotement blanc qui accélère avec croissance par à-coups, gonflement, flash, nouveau stade avec rebond et confettis. Aucun asset (voir le prototype `prototypes/animations/`).

### Besoins et humeur
- 3 besoins : **Faim**, **Joie**, **Énergie** (Soif est retirée).
- Baisse calculée à l'ouverture depuis la dernière visite : Faim −2/h, Joie −1,5/h (+5 par partie), Énergie −2/h.
- Humeur = moyenne des 3 : ≥ 60 contente, 30 à 60 bof, < 30 triste.
- Triste : **image triste dédiée** (une par stade), goutte et mouvement ralenti en CSS, **évolution bloquée** (🔒 « Il est triste, occupe-toi de lui ! »). Jamais perdue, jamais enfuie.
- Soins : nourriture et jouets (payants), **Faire dormir** (gratuit, immédiat, Énergie à 100).

### Affichage
- Aucune créature pendant les parties : les parties rapportent des pièces, rien ne distrait l'enfant.
- **Images fixes** ; tout mouvement est fait en **CSS seul** en v1 (ni Rive ni PixiJS). Pour éviter l'effet « autocollant » : respiration continue, point d'appui aux pieds, ombre au sol qui suit, écrasement/étirement, départs décalés au hasard.
- Chaque espèce a un **profil de mouvement** : sautille, se tortille, voltige, marche lourde, flotte, nage.
- Chaque dessin a sa propre pose (assis, debout, en vol…), imposée par le brief.
- Chaque image a un **point d'ancrage** (haut de la tête, en % de l'image) pour placer bulles et cœurs.
- Manger / jouer / dormir : même image de la créature + l'objet donné posé à côté (ou le lit de feuilles) + animation.
- Petites icônes (pièce, bulles de besoin, cœurs, larmes, Zzz, cadenas) : **emoji**.
- Silhouettes du bestiaire : image Bébé + `filter: brightness(0)`.
- Pas de décor illustré, pas d'accessoires, pas de variante shiny, pas d'image « endormie » en v1 (Zzz en CSS).

### Boutique
| Rayon | Objet | Prix | Effet |
|---|---|---|---|
| Nourriture | Pomme | 10 | Faim +20 |
| | Sandwich | 25 | Faim +50 |
| | Gâteau | 60 | Faim +100, Joie +10 |
| Jouets | Balle | 30 | Joie +30 |
| | Peluche | 80 | Joie +70 |
| | Console | 200 | Joie +100 |
| Coffre | Coffre | 800 | un œuf |

## Inventaire des assets

N = nombre d'espèces, L = nombre de Légendaires. Bestiaire retenu (`docs/Bestiaire.md`) : N = 36, L = 3.

| Asset | Nombre | Fichier |
|---|---|---|
| Créatures | 4 × N | `public/creatures/<espece>/{bebe,petit,grand,super}.webp` |
| Créatures tristes | 4 × N | `public/creatures/<espece>/{bebe,petit,grand,super}-triste.webp` |
| Œufs de base | 4 | `public/eggs/{commun,peu-commun,rare,epique}.webp` |
| Œufs légendaires | L | `public/creatures/<espece>/oeuf.webp` |
| Coquille cassée | 1 | `public/eggs/coquille.webp` |
| Coffre | 2 | `public/items/{coffre-ferme,coffre-ouvert}.webp` |
| Objets | 6 | `public/items/{pomme,sandwich,gateau,balle,peluche,console}.webp` |
| Lit de feuilles | 1 | `public/items/lit.webp` |
| **Total** | **8N + L + 14** | 36 espèces dont 3 Légendaires → 305 images, 39 planches |

Format : WebP transparent, découpé et rogné à la taille native de la planche (case de 384 × 512 px). La taille d'affichage est fixée par le code selon le stade.
Production : planches de 2 × 4 cases générées avec ChatGPT Image, puis découpées par script. Voir `docs/assets/brief-production.md`.
Données par image (pas des images) : point d'ancrage ; par espèce : qualité, nom, profil de mouvement.

## Reste à faire
1. ~~Choisir le bestiaire~~ : fait, `docs/Bestiaire.md`.
2. Générer les planches avec les prompts prêts à coller (section 10 du brief), en commençant par l'étalon (Chaton).
