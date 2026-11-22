# Économie du jeu : guide des gains, des coûts et du rythme

Base de travail de l'équilibrage fait en novembre 2026, à reprendre si le rythme ne convient pas.
Tous les chiffres viennent de `lib/balance.ts` (la seule source de vérité) et du simulateur (`pnpm sim`, rapport détaillé dans `docs/equilibrage.md`).
Si tu changes un chiffre, relance `pnpm sim` puis mets à jour ce guide.

---

## 1. Pourquoi tout a été refait

Une seule partie sur la table de 1 (60 s, 30 bonnes réponses sans erreur) a débloqué :

- **17 badges d'un coup** : Série I à VII, Vitesse I à VII, Perfection, etc. Les badges de performance comptaient n'importe quelle partie, même la plus facile.
- **7 coffres**, dont 3 œufs Légendaires et 3 Épiques. Chaque badge Épique donnait un œuf au moins Rare, chaque badge Légendaire un œuf au moins Épique.
- **~600 🪙**, surtout grâce aux badges (550 🪙), contre ~45 🪙 pour la partie elle-même.

Le score affiché en fin de partie (1 600 points pour une partie de table de 1) n'est pas de l'argent : c'est `10 + min(série, 5) × 2` par bonne réponse.

La base en ligne était vide : la progression n'existait que sur la tablette (le code famille n'y avait jamais été tapé).

## 2. Les principes retenus

1. **Une bonne réponse vaut des points selon sa difficulté.** Plus de « 1 bonne réponse = 1 pièce ».
2. **Les points baissent après une longue journée.** Jouer souvent rapporte plus que jouer beaucoup d'un coup.
3. **Seules les parties qui comptent comptent pour les badges.** Il faut une partie assez difficile, avec assez de bonnes réponses.
4. **Les badges ne donnent plus de coffres**, seulement quelques pièces.
5. **S'occuper du compagnon a un vrai enjeu.** Un compagnon triste ne grandit plus, ne donne plus de bonus et ne couve plus l'œuf.
6. **Tout est recalculé depuis l'historique des parties.** Changer une règle ne demande aucune migration. Chaque partie garde en plus une photo de ce qu'elle a rapporté (`gains`), pour le Journal et l'analyse.
7. **Les chiffres se règlent au simulateur**, jamais à l'intuition.

---

## 3. Les gains

### 3.1 Valeur d'une bonne réponse (`TABLE_VALUE`)

Un calcul vaut la valeur de son **facteur le plus facile** : 7 × 1 vaut comme la table de 1, et 7 × 8 vaut 1.

| Facteur | ×1 | ×10 | ×2 | ×5 | ×3, ×4 | ×6, ×7, ×8, ×9 |
|---|---|---|---|---|---|---|
| Valeur | 0,05 | 0,1 | 0,3 | 0,35 | 0,8 | 1 |

**Difficulté d'une partie** : la valeur moyenne des calculs posés.

| Tables jouées | Difficulté | Compte pour les badges ? |
|---|---|---|
| 1 seule | 0,05 | non |
| 10 seule | ~0,1 | non |
| 2 seule | 0,26 | non |
| 5 seule | 0,29 | non |
| 1, 2, 5, 10 | 0,17 | non |
| 2, 3, 4, 5 | 0,42 | oui |
| toutes (1 à 10) | 0,44 | oui |
| 2 à 9 | 0,53 | oui |
| 3 seule | 0,56 | oui |
| 7 seule | 0,64 | oui |
| 6, 7, 8, 9 | ~0,7 | oui |

### 3.2 Partie qui compte (`SERIOUS`)

Une partie compte si sa difficulté est d'au moins 0,4 et qu'elle a au moins 5 bonnes réponses. Seules ces parties :

- font avancer les badges de performance (série, vitesse, sans faute, étoiles, jours et parties joués, secrets) ;
- font payer leurs étoiles ;
- donnent le bonus du jour ;
- comptent pour le filet de sécurité (jours joués sans œuf).

Ce qui compte quelle que soit la partie : les diplômes, les niveaux et les badges « Table de N ». Dans ces derniers, 7 × 1 compte seulement pour la table de 1, et 7 × 10 seulement pour la table de 10. Le badge « Bonnes réponses » ne compte pas les × 1 et × 10.

### 3.3 Baisse du jour (`DAILY`)

| Points déjà faits dans la journée | Valeur des nouveaux points |
|---|---|
| 0 à 100 | 100 % |
| 100 à 200 | 50 % |
| au-delà de 200 | 20 % |

À ~4 parties d'une minute par jour (~40 points), ton fils n'est jamais touché. La baisse ne freine que les marathons.

### 3.4 Pièces d'une partie

| Source | Gain |
|---|---|
| Points (après la baisse du jour) | 1 🪙 par point |
| Étoiles (seulement dans une partie qui compte) | 1 🪙 par étoile |
| Bonus du jour (1re partie qui compte de la journée) | +5 🪙 |
| Diplôme (nouveau, ou meilleure mention) | 10 + 10 × mention (20 / 30 / 40 🪙), une seule fois par table et par mention |
| Examen déjà réussi | rapporte comme une partie normale |
| Entraînement sur les erreurs (3 questions ou plus, partie qui compte) | +5 🪙, +5 de plus sans faute, 3 fois par jour au plus |
| Badge | 1 / 2 / 3 / 5 / 10 🪙 (Commun → Légendaire) |
| Niveau gagné | 5 🪙 |
| Doublon à l'éclosion | 5 / 10 / 20 / 40 / 80 🪙 |
| Bonus du compagnon | voir 3.6 |

**Repères :**

- Partie d'une minute, tables 2 à 9, 14 bonnes réponses par minute : **~10 🪙** (8 points + 2 étoiles). C'est le prix d'une Pomme et demie.
- La même partie en 2 ou 3 minutes : 2 à 3 fois plus.
- Partie de 30 s sur la seule table de 1, sans erreur (~40 bonnes réponses) : **2 à 4 🪙**.
- Le fourbe « tables faciles » (1, 2, 5, 10) gagne environ 2,6 fois moins par minute que ton fils.

### 3.5 XP et niveaux

- XP d'une partie : 2 × points + 5 × étoiles (étoiles seulement dans une partie qui compte).
- Diplôme : 20 + 10 × mention, la première fois ou quand la mention s'améliore.
- Niveaux : `xpStep(n) = 50 + 25 × (n − 1)` (inchangé).
- Simulation de ton fils : niveau 11 au 7ᵉ jour, 18 au 30ᵉ, 39 au 180ᵉ, 59 au 365ᵉ.

### 3.6 Bonus de pièces du compagnon

Le bonus s'ajoute aux pièces de la partie (pas aux badges ni aux niveaux), seulement si le compagnon actif n'est pas triste.

**Bonus = qualité + stade + 0,5 % par espèce trouvée.**

| | Commun | Peu commun | Rare | Épique | Légendaire |
|---|---|---|---|---|---|
| Qualité | +0 % | +15 % | +30 % | +50 % | +80 % |

| Stade | Bébé | Petit | Grand | Super |
|---|---|---|---|---|
| Bonus | +0 % | +5 % | +10 % | +15 % |
| Points pour y arriver | 0 | 150 | 600 | 1 500 |

**Historique du bonus de qualité :**

| Étape | Commun | Peu commun | Rare | Épique | Légendaire | Stade | Par espèce |
|---|---|---|---|---|---|---|---|
| Avant (en ligne) | +0 % | +100 % | +300 % | +700 % | +1 100 % | 0 / 10 / 25 / 50 % | +2 % |
| 1er réglage (jamais commité) | +0 % | +20 % | +40 % | +70 % | +100 % | 0 / 5 / 10 / 20 % | +1 % |
| **Actuel** | **+0 %** | **+15 %** | **+30 %** | **+50 %** | **+80 %** | **0 / 5 / 10 / 15 %** | **+0,5 %** |

**Exemple : une partie qui rapporte 10 🪙 sans compagnon.**

| Compagnon | Commun | Peu commun | Rare | Épique | Légendaire |
|---|---|---|---|---|---|
| Avant : Bébé, 10 espèces | 12 | 22 | 42 | 82 | 122 |
| Avant : Super, 36 espèces | 22 | 32 | 52 | 92 | 132 |
| Actuel : Bébé, 10 espèces | 11 | 12 | 14 | 16 | 19 |
| Actuel : Super, 10 espèces | 12 | 14 | 15 | 17 | 20 |
| Actuel : Super, 36 espèces | 13 | 15 | 16 | 18 | 21 |

Avant, un Légendaire multipliait les gains par 12. Aujourd'hui, le meilleur cas les double à peu près.

---

## 4. Les coûts : s'occuper du compagnon

### 4.1 Besoins (`NEEDS`, `MOOD`)

| Besoin | Baisse par heure | Par jour | Remonte avec |
|---|---|---|---|
| Faim | 1,25 | 30 | la nourriture |
| Joie | 1 | 24 | les jouets, et +4 à chaque partie |
| Énergie | 2 | 48 | la sieste (gratuite) |

**Humeur :**
- **triste** si un besoin passe sous 15, ou si la moyenne passe sous 30 ;
- **contente** si la moyenne est d'au moins 60 et qu'aucun besoin n'est sous 35 ;
- **bof** entre les deux.

Avant, la sieste gratuite suffisait à éviter la tristesse : avec l'énergie à 100, la moyenne restait au-dessus du seuil. Ce n'est plus le cas.

**Un compagnon triste** :
- a l'image triste ;
- n'évolue plus ;
- ne donne plus de bonus de pièces ;
- **ne couve plus l'œuf**.

On ne perd jamais une créature. Sans nourriture, la faim passe de 100 à 15 en ~68 h, soit un peu moins de 3 jours.

### 4.2 Boutique : nourriture et jouets

| Objet | Prix | Effet | Prix par point |
|---|---|---|---|
| 🍎 Pomme | 6 | Faim +20 | 0,30 |
| 🥪 Sandwich | 13 | Faim +45 | 0,29 |
| 🎂 Gâteau | 28 | Faim +100, Joie +10 | ~0,25 |
| 🍗 Festin | 65 | Faim +240 | 0,27 |
| 🍱 Banquet | 150 | Faim +550, Joie +50 | ~0,25 |
| ⚽ Balle | 8 | Joie +20 | 0,40 |
| 🧸 Peluche | 19 | Joie +50 | 0,38 |
| 🎮 Console | 40 | Joie +110 | 0,36 |
| 🎠 Manège | 85 | Joie +240 | 0,35 |
| 🎡 Fête foraine | 210 | Joie +600 | 0,35 |

**Appétit** : un compagnon de meilleure qualité est moins rempli par le même objet : ×1 / 1,15 / 1,3 / 1,5 / 1,8 de Commun à Légendaire. Avant, c'était ×1 / 2 / 4 / 8 / 12. Le bonus et l'appétit montent ensemble, donc la part de l'entretien reste à peu près la même quelle que soit la qualité.

### 4.3 Coût de l'entretien par jour

Pour un compagnon Commun et ~4 parties par jour :
- faim : 30 points/jour, soit ~9 🪙 ;
- joie : 24 − 16 (4 parties) = 8 points/jour, soit ~3 🪙 ;
- **total : ~12 🪙/jour**, environ 1 à 1,5 partie d'une minute.

Pour un Légendaire, c'est ×1,8, soit ~22 🪙/jour, compensés par son bonus.

| Joueur simulé | Part des gains dépensée en entretien | Compagnon triste |
|---|---|---|
| Ton fils | 14 % (1er mois) → 20 % (mois 3 à 6) | 3 % des parties |
| Joue peu (2 parties/jour) | ~95 % | 19 % |
| Ne nourrit jamais | 0 % | 97 %, bloqué à 3 espèces |

**Point ouvert** : la cible de départ était ~30 % (« une partie et demie par jour »). En valeur, on y est (~12 🪙), mais en pourcentage ton fils est à 15-20 %, parce qu'il joue plus de 4 parties et des parties plus longues. Monter l'entretien rendrait le jeu impossible pour celui qui joue 2 parties par jour. Le bonus du jour (+5 🪙) a été ajouté justement pour lui.

---

## 5. Les coffres et les œufs

### 5.1 D'où viennent les coffres

| Source | Règle |
|---|---|
| Cadeau de départ | 1 coffre Commun (toujours un œuf Commun) |
| Chance en jouant | 0,1 % par point, ×2 avec 3 étoiles dans une partie qui compte, 5 % au plus (~1 % pour une partie d'une minute) |
| Boutique | voir 5.3 |
| Filet de sécurité | 1 coffre Commun après 10 jours joués (parties qui comptent) sans nouvel œuf |
| Badges | **plus rien** (avant : badge Épique → œuf ≥ Rare, Légendaire → ≥ Épique) |

### 5.2 Taux de sortie (`CHEST_ODDS`)

| Coffre | Ce qui peut sortir |
|---|---|
| Commun | 95 % Commun, 5 % Peu commun |
| Peu commun | 88 % Peu commun, 12 % Rare |
| Rare | 90 % Rare, 10 % Épique |
| Épique | 92 % Épique, 8 % Légendaire |
| Légendaire | 100 % Légendaire |

Avant, un coffre Commun pouvait tout donner (50 / 28 / 14 / 6 / 2 %).

### 5.3 Prix des coffres et leur historique

| Étape | Commun | Peu commun | Rare | Épique | Légendaire | Bestiaire complet (ton fils simulé) |
|---|---|---|---|---|---|---|
| 0. Avant (en ligne aujourd'hui) | 250 | 350 | 800 | 1 800 | 5 000 | (ancienne économie) |
| 1. Premier essai, pas simulé sur un an | 120 | 300 | 650 | 1 300 | 2 800 | — |
| 2. 1re simulation sur un an | 200 | 400 | 800 | 1 500 | 3 000 | ~320 j, seulement 2 vies sur 6 complètent |
| 3. 2e simulation | 200 | 400 | 700 | 1 200 | 2 400 | pas complet en un an (35/36) |
| 4. 3e simulation | 200 | 350 | 600 | 1 000 | 2 000 | ~305 j |
| 5. Commit `4d7b4c7` | 200 | 350 | 500 | 900 | 1 800 | 304 j (243 à 363) |
| Essai écarté (trop rapide) | 160 | 260 | 380 | 650 | 1 300 | 209 j |
| 6. Commit `2a313d4` | 180 | 300 | 430 | 750 | 1 500 | 238 j (214 à 333) |
| **7. Commit `9c35fea` (actuel)** : mêmes prix + Légendaires sans doublon | **180** | **300** | **430** | **750** | **1 500** | **215 j (194 à 230)** |
| Hausse proposée puis refusée | 180 | 300 | 480 | 850 | 1 800 | — |

Aux étapes 1 à 4, d'autres réglages changeaient en même temps : les durées ne dépendent pas que des prix.

### 5.4 Combien de parties pour payer un coffre

Hypothèses : une partie d'une minute à 10 🪙 sans compagnon, ~10 espèces trouvées, bonus arrondi à chaque partie comme dans le jeu. Le nombre de parties est arrondi au-dessus.

**Compagnon au stade Bébé** (gain par partie : 11 / 12 / 14 / 16 / 19 🪙) :

| Compagnon ↓ / Coffre → | Commun (180) | Peu commun (300) | Rare (430) | Épique (750) | Légendaire (1 500) |
|---|---|---|---|---|---|
| Commun | 17 | 28 | 40 | 69 | 137 |
| Peu commun | 15 | 25 | 36 | 63 | 125 |
| Rare | 13 | 22 | 31 | 54 | 108 |
| Épique | 12 | 19 | 27 | 47 | 94 |
| Légendaire | 10 | 16 | 23 | 40 | 79 |

**Compagnon au stade Super** (gain par partie : 12 / 14 / 15 / 17 / 20 🪙) :

| Compagnon ↓ / Coffre → | Commun (180) | Peu commun (300) | Rare (430) | Épique (750) | Légendaire (1 500) |
|---|---|---|---|---|---|
| Commun | 15 | 25 | 36 | 63 | 125 |
| Peu commun | 13 | 22 | 31 | 54 | 108 |
| Rare | 12 | 20 | 29 | 50 | 100 |
| Épique | 11 | 18 | 26 | 45 | 89 |
| Légendaire | 9 | 15 | 22 | 38 | 75 |

Le stade Super fait gagner 5 à 15 % de parties en moins. Il demande 1 500 points avec le même compagnon actif et pas triste, soit environ 1 à 1,5 mois de jeu pour ton fils.

**Pour passer aux jours** : à ~4 parties par jour, l'entretien prend ~0,7 partie et le bonus du jour en rend ~0,5. Il reste donc ~3,8 parties utiles par jour : divise les tableaux par ~3,8.
- Compagnon Commun, coffre Peu commun : 28 parties, ~1 semaine.
- Compagnon Épique, coffre Légendaire : 94 parties, ~3,5 semaines.

Les parties plus longues ou plus rapides (il progresse vers 20 bonnes réponses par minute) raccourcissent ces délais : c'est pour ça que la simulation complète le bestiaire plus vite que ces tableaux ne le laissent penser.

### 5.5 Éclosion (`HATCH`)

| Œuf | Commun | Peu commun | Rare | Épique | Légendaire |
|---|---|---|---|---|---|
| Points pour éclore | 40 | 80 | 140 | 220 | 320 |
| Parties d'une minute (~8 points) | ~5 | ~10 | ~18 | ~28 | ~40 |

- L'œuf avance des points des parties jouées pendant qu'il couve. La progression est gardée dans l'œuf (`incubating.done`).
- **Un compagnon triste ne couve pas.** Sans compagnon (premier œuf), l'œuf avance toujours.
- Une seule couveuse : les autres œufs attendent au nid.

### 5.6 Hasard et doublons

**Les tirages sont aléatoires, mais recharger la page ne sert à rien :**
- **Un coffre après une partie** : tiré à partir de l'identifiant de la partie. Une partie donne toujours le même résultat, sur tous les appareils.
- **La qualité de l'œuf dans un coffre** : tirée de la même façon, une fois pour toutes, quand le coffre arrive.
- **L'espèce qui éclot** (Commun à Épique) : tirée à l'éclosion, puis enregistrée.

**Pas de doublon tant qu'il manque une espèce de cette qualité.** L'espèce tirée est toujours une espèce que l'enfant n'a pas, tant qu'il en reste une dans cette qualité.

**Œufs Légendaires (variante A, active depuis `9c35fea`).** Leur espèce est choisie dès l'arrivée du coffre, parce que chaque Légendaire a son propre œuf. Avant, ce choix ignorait les espèces déjà possédées : dans la simulation, ton fils achetait 6 coffres Légendaires pour 3 espèces (~4 500 🪙 perdues). Maintenant, l'œuf prend un Légendaire ni possédé ni déjà dans un autre œuf.

**Doublons restants** : les coffres Communs gratuits (chance, filet de sécurité) une fois les 11 Communs trouvés. Chaque doublon rapporte 5 🪙.

**Variante B, testée et non retenue (« œuf toujours nouveau »).** Un œuf dont la qualité est complète donnerait une espèce de la qualité suivante qui manque. Elle reste disponible pour le simulateur : `SIM_FRESH=climb pnpm sim`.

| Variante | Ton fils | Enfant très motivé | Joue peu (en 1 an) |
|---|---|---|---|
| Sans A ni B | 238 j (214–333) | 122 j | 13 espèces |
| **A (actuel)** | **215 j (194–230)** | **107 j** | **13 espèces** |
| A + B | 156 j (143–169) | 83 j | 28 espèces |

B est écartée parce qu'en fin de jeu, un coffre Commun gratuit finirait par donner des Épiques et des Légendaires : les coffres chers n'auraient plus d'intérêt.

---

## 6. Le rythme : temps pour compléter le jeu

### 6.1 Les joueurs simulés

| Joueur | Profil |
|---|---|
| Ton fils (cas visé) | 14 → 22 bonnes réponses/min en 6 mois, 10-15 parties/jour la 1re semaine puis ~4, tables variées, examens et entraînements |
| Enfant très motivé | pareil, mais 30 parties/jour la 1re semaine puis 8/jour |
| Fourbe table de 1 | uniquement la table de 1 en 30 s (20 parties/jour), examen de la table de 1, entraînements pour le bonus |
| Fourbe tables faciles | tables 1, 2, 5 et 10, 10 parties d'une minute par jour |
| Adulte rapide | 32 bonnes réponses/min, 2 % d'erreurs, toutes les tables, 4 parties de 1 à 3 min par jour |
| Joue peu | 12 bonnes réponses/min, 2 parties d'une minute par jour, tables 2 à 5 |
| Ne nourrit jamais | comme ton fils, mais il ne donne jamais à manger ni à jouer |

### 6.2 Résultats actuels (8 vies par joueur, médianes)

**Espèces trouvées (36 au total) :**

| Joueur | J1 | J7 | J30 | J90 | J180 | J270 | J365 | Bestiaire complet |
|---|---|---|---|---|---|---|---|---|
| Ton fils | 1 | 5 | 14 | 24 | 33 | 36 | 36 | **215 j (194–230)**, ~7 mois |
| Enfant très motivé | 1 | 7 | 18 | 33 | 36 | 36 | 36 | 107 j |
| Fourbe table de 1 | 0 | 1 | 3 | 5 | 6 | 10 | 12 | jamais |
| Fourbe tables faciles | 0 | 2 | 7 | 19 | 31 | 36 | 36 | 241 j |
| Adulte rapide | 1 | 6 | 21 | 36 | 36 | 36 | 36 | 85 j |
| Joue peu | 0 | 1 | 2 | 6 | 12 | 12 | 13 | jamais |
| Ne nourrit jamais | 1 | 3 | 3 | 3 | 3 | 3 | 3 | jamais |

**Première espèce de chaque qualité pour ton fils** : Peu commun au 14ᵉ jour, Rare au 43ᵉ, Épique au 123ᵉ, Légendaire au 177ᵉ (~6 mois).

**Pièces gagnées par jour (ton fils)** : 151 🪙 la 1re semaine (beaucoup de parties), 79 🪙 jusqu'au 30ᵉ jour, 66 🪙 jusqu'au 90ᵉ, 95 🪙 jusqu'au 180ᵉ, puis 133 🪙 (il est plus rapide et son compagnon meilleur).

**Badges (ton fils)** : au 30ᵉ jour, 24 Communs, 31 Peu communs, 22 Rares, 18 Épiques et 2 Légendaires. Au 180ᵉ jour, 19 Légendaires. Les badges tombent vite, mais ne rapportent plus que quelques pièces.

### 6.3 Comparaison avant / après pour la partie qui a tout déclenché

| | Avant | Après |
|---|---|---|
| Badges | 17, dont 3 Légendaires et 4 Épiques | 1 ou 2 Communs |
| Coffres | 7, dont 3 Légendaires | aucun |
| Pièces | ~600 | 2 à 4 |

---

## 7. Les leviers : que changer si le rythme ne convient pas

Effets mesurés pendant cette session sur ton fils simulé. Tous les réglages sont dans `lib/balance.ts`.

| Pour… | Levier | Effet mesuré ou attendu |
|---|---|---|
| Aller plus vite | Baisser les prix des coffres (`PRICES`) | −15 % sur les prix : 238 → 209 jours |
| Aller plus lentement | Monter les prix des coffres | +10 à 20 % sur Rare, Épique et Légendaire : environ 8 mois au lieu de 7 (estimation, essai interrompu) |
| Moins dépendre de la chance | Doublons de Légendaires (fait, variante A) | 238 → 215 jours, pire cas 333 → 230 |
| Beaucoup plus vite | Variante B, œuf toujours nouveau (`FRESH.climb`) | 215 → 156 jours |
| Un entretien plus cher | `NEEDS` (baisse par heure) ou prix de la nourriture | « joue peu » devient vite triste et bloqué |
| Un entretien moins cher | `NEEDS.joyPerGame`, prix | le compagnon perd son enjeu |
| Freiner les marathons | `DAILY` (100 / 100 / 20 %) | ne touche pas 4 parties/jour |
| Durcir l'anti-triche | `TABLE_VALUE`, `SERIOUS.difficulty` | table de 1 : 12 espèces en un an aujourd'hui |
| Faire éclore plus vite ou plus lentement | `HATCH` | le temps d'éclosion n'est pas le facteur limitant aujourd'hui (c'est l'achat des coffres) |
| Rendre les coffres gratuits plus fréquents | `DROP.perPoint`, `PITY.days` | ton fils reçoit ~27 coffres par chance et ~13 par le filet de sécurité en un an |

**Méthode :**
1. Changer un chiffre dans `lib/balance.ts`.
2. Lancer `pnpm sim --players enfant,petit` (~1 min) pour un essai rapide, puis `pnpm sim` (8 vies, ~4 min) pour le rapport complet.
3. Relire `docs/equilibrage.md`, puis mettre à jour ce guide et `CLAUDE.md`.

---

## 8. Les outils

| Outil | À quoi il sert |
|---|---|
| `pnpm sim` | Simule les 7 joueurs pendant un an avec le vrai code de fin de partie (`settle()`), et écrit `docs/equilibrage.md`. Options : `--seeds 8 --days 365 --players enfant,fourbe`. Variante B : `SIM_FRESH=climb`. |
| `pnpm build && pnpm bot` | Des robots jouent au vrai jeu dans Chromium (enfant, table de 1, examen de la table de 1, parent qui synchronise puis remet à zéro). Ils vérifient que les pièces et l'XP affichées sont celles enregistrées, le solde de la boutique, l'œuf qui avance, et la remise à zéro avec son archive. 35 vérifications, toutes au vert. Base séparée dans `data/e2e`. |
| Page `/journal` (parents) | Pour chaque partie : points et raison de leur valeur, pièces (badges, niveau, compagnon), XP, badges, coffres, solde. Pour le compagnon : achats, soins, coffres, éclosions, évolutions. Bouton d'export en JSON. |
| Photo `gains` + temps `ms` | Enregistrés dans chaque partie, pour analyser une vraie progression. |
| Remise à zéro (Historique, parents) | Code famille redemandé. Le serveur archive les parties et le compagnon (`games_archive`, `docs_archive`), et chaque appareil efface ses données à la prochaine synchro. Le prénom est gardé. |

---

## 9. Points ouverts et suites possibles

- **Entretien** : ~15-20 % des gains de ton fils, en dessous de la cible de 30 %, à cause de celui qui joue peu (voir 4.3).
- **Badge « Table de 1 · V »** : un Légendaire reste possible après 1 000 bonnes réponses en table de 1. Il ne rapporte que 10 🪙 et aucun coffre. À retirer si ça gêne.
- **Comptes séparés** : plusieurs codes famille ou plusieurs joueurs par serveur, pour d'autres enfants.
- **Mise en ligne** :
  1. Fusionner la branche dans `main` (Coolify redéploie).
  2. Sur la tablette, aller dans Historique, puis « Remettre la progression à zéro », et taper le code (ça relie aussi la tablette au serveur).
  3. Changer le code famille dans Coolify, puisqu'il a circulé dans une conversation.
