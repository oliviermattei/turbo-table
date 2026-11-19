# Turbo Tables

Jeu de calcul mental pour réviser les tables de multiplication. Il est fait pour un enfant de 8 ans et se joue surtout sur téléphone ou tablette.
C'est une application **Next.js 16 (App Router, React 19, TypeScript)** avec un petit serveur (routes d'API + SQLite), hébergée sur **Coolify** (Docker).
L'ancienne version en un seul fichier (artifact claude.ai) est gardée pour référence dans `legacy/turbo-tables.html`.
Lire aussi `AGENTS.md` : Next 16 diffère de ce que tu connais, sa doc est dans `node_modules/next/dist/docs/`.
Le père de l'enfant (développeur) pilote le projet. Il valide les choix de conception avant qu'on construise une grosse fonctionnalité.

---

## 1. Décisions déjà prises (ne pas revenir dessus sans demander)

- **Réponses au choix, pas de clavier.** L'enfant avait du mal à taper les chiffres. Il y a 4 réponses en **grille 2 × 2**. Une version avec les 4 réponses sur une seule ligne a été essayée puis abandonnée.
- **Pièges crédibles.** Les mauvaises réponses sont surtout des résultats voisins dans la table (`a×(b±1)`, `(a±1)×b`), puis des écarts de ±1, ±2, ±10 ou des chiffres inversés (`makeChoices`).
- **Correction affichée.** En cas d'erreur, la réponse choisie devient rouge et la bonne devient verte pendant 1,6 s.
- **Ordre des facteurs.** Les calculs sont posés dans les deux sens (7 × 8 ou 8 × 7).
- **Calculs ratés.** Ils reviennent plus souvent pendant la partie (poids `1 + 3 × nombre d'erreurs`).
- **Durées.** 30, 60, 90, 120, 150 et 180 s, toutes sur une seule ligne.
- **Clavier sur ordinateur.** Les touches 1 à 4 choisissent une réponse.
- **Textes.** Français simple, adapté à un enfant de 8 ans, phrases courtes, tutoiement.
- **Format.** Application Next.js + serveur, hébergée sur Coolify. Elle n'est pas encore une PWA.
- **Stack.** Next.js + React pour tous les écrans (menus, boutique, bestiaire…). Pas de moteur de jeu pour l'interface. Pour animer les créatures et les œufs, on ajoutera une scène ciblée (Rive ou PixiJS, à choisir à l'étape compagnon).
- **Visuels.** Une image par espèce × stade. L'humeur, le halo légendaire, l'effet shiny et les accessoires sont des calques ou des animations par-dessus, pas des images séparées.

## 2. Ce qui existe aujourd'hui

### Modes de jeu
- **Partie normale.** On choisit les tables (1 à 10) et la durée.
  - Points : `10 + min(série, 5) × 2` par bonne réponse.
  - Étoiles : calculées sur le nombre de bonnes réponses par minute (≥ 5 → 1 étoile, ≥ 12 → 2, ≥ 20 → 3).
  - Record gardé à part pour chaque durée.
- **Entraînement sur les erreurs.** Relance une partie uniquement sur les calculs ratés, depuis l'écran de fin ou depuis l'historique.
- **Examen d'une table (diplôme).**
  - 20 calculs de la table (chaque multiplicateur de 1 à 10, deux fois), en 60 s, avec 2 erreurs maximum.
  - Le chrono s'arrête pendant l'affichage d'une correction.
  - Mention : 0 erreur = Très Bien 🥇, 1 erreur = Bien 🥈, 2 erreurs = Assez Bien 🥉.
  - Le diplôme est un certificat avec le prénom et la date. Le Grand diplôme de Maître des Tables arrive quand les 10 tables sont réussies.

### Gamification
- **Niveaux infinis.**
  - Il faut `xpStep(n) = 50 + 25 × (n − 1)` XP pour passer du niveau n au suivant.
  - Le titre et l'animal changent tous les 5 niveaux (`RANKS`, de 🐣 Apprenti à 👑 Empereur des nombres au niveau 100).
- **XP gagnée.**
  - Partie normale : 2 × bonnes réponses + 5 × étoiles.
  - Entraînement : 2 × bonnes réponses.
  - Examen réussi : 20 + 10 × mention.
  - Examen raté : nombre de bonnes réponses, plafonné à 20.
- **149 badges avec 4 qualités.** Les qualités sont Normal (gris `#cbd5e1`), Rare (bleu `#3b82f6`), Épique (violet `#a855f7`) et Légendaire (orange `#f59e0b`). Les badges se répartissent ainsi :
  - 14 familles de défis à paliers (`FAMILIES`), numérotés en chiffres romains I à VII ;
  - 10 familles « Table de N », selon les bonnes réponses dans cette table (25, 100, 250, 500, 1000) ;
  - 10 badges secrets (`SECRETS`), affichés en « ❓ » avec seulement leur qualité.
  La qualité d'un palier dépend de sa place dans sa famille (`rarityFor`). Les badges Légendaires brillent (animation `glow`).
- **Écran de fin de partie.** Il affiche l'XP gagnée et la barre de niveau qui se remplit. Il montre aussi les nouveaux badges, triés par qualité. S'il n'y en a pas, il affiche le « Prochain badge », celui qui est le plus près d'être gagné.
- **Historique.** Liste des parties, statistiques et calculs les plus ratés.

## 3. Données et stockage

**Principe : on ne stocke que les parties.** Les niveaux, l'XP, les badges et les diplômes sont tous recalculés à partir de l'historique (`computeStats`). On peut donc changer une règle sans migrer de données.

Une partie ressemble à ceci :

```
{ id, ts, mode: 'normal'|'practice'|'exam', duration, tables: [..], score, correct, total,
  bestStreak, stars, errors: [{a, b, n}],
  seen: { "3x7": [réussis, ratés] },   // clé = min x max ; existe depuis la version « badges à qualités »
  // examens seulement :
  examTable, passed, mention }
```

**Où c'est stocké :**
- **Sur le serveur** : SQLite (`node:sqlite`, aucune dépendance) dans `DATA_DIR` (`/app/data` en Docker, volume persistant sur Coolify).
  - Table `games` : une ligne par partie (`id`, `ts`, `data` JSON). Une partie ne change jamais : un `id` déjà connu est ignoré.
  - Table `docs` : documents uniques (`profile`, plus tard `pet`). Chaque document a son validateur dans `app/api/docs/[name]/route.ts`.
- **Sur l'appareil** : cache `localStorage` (`tt_history`, `tt_profile`, `tt_tables`, `tt_duration`, `tt_sound`). Le jeu marche sans réseau : les parties non envoyées (`synced: false`) partent à la prochaine ouverture.
- **Accès** : un seul « code famille » (variable `FAMILY_CODE`). Le parent le tape une fois par appareil dans la page Historique, un cookie le garde environ un an. Sans le code, le jeu reste local à l'appareil.
- **API** : `GET /api/state` (toutes les parties + profil), `POST /api/games` (lot de parties), `PUT /api/docs/:name`, `POST /api/login`.
- Toute donnée qui arrive (localStorage, API) passe par `clean()` (`lib/game/clean.ts`).

### Structure du code

| Dossier | Rôle |
|---|---|
| `lib/game/` | Règles pures, sans React : `rules.ts` (niveaux, XP, badges, stats), `questions.ts` (tirage, pièges), `engine.ts` (boucle de partie), `clean.ts`. Testées par `game.test.ts`. |
| `lib/data.tsx` | Contexte React : historique, profil, réglages, synchro serveur (`useData()`). |
| `lib/server/` | Base SQLite et code famille (serveur seulement). |
| `app/` | Un écran par route : `/`, `/jouer?mode=…`, `/badges`, `/diplomes`, `/historique`, et `app/api/`. |
| `components/` | `GameSession` (compte à rebours + partie), `EndScreen`, `Certificate`, petits composants dans `ui.tsx`. |
| `public/` | Images (futures créatures : `public/creatures/<espece>/<stade>.webp`). |

Le CSS est celui de l'artifact, dans `app/globals.css`. Avec `cacheComponents`, Next garde l'écran précédent caché (`<Activity>`) : deux `.screen` peuvent exister dans le DOM.

---

## 4. PROCHAINE ÉTAPE : œuf et bestiaire (type Tamagotchi)

Le but est de garder l'enfant motivé pendant des semaines ou des mois. Ses parties lui font gagner des pièces. Avec ces pièces, il s'occupe d'une créature sortie d'un œuf, et il collectionne tout un bestiaire.

> **Mis à jour le 2026-11-19 :** les décisions de `docs/assets/inventaire.md` (5 qualités, coffre, 4 stades, besoins Faim/Joie/Énergie, pas de créature en partie ni d'accessoires, animations en CSS seul au lieu de Rive/PixiJS) **remplacent cette section là où elles diffèrent**. Vocabulaire : `GLOSSARY.md`.

### 4.1 Questions encore ouvertes (à poser au père avant de construire)

1. **Absence de plusieurs jours.**
   - **Par défaut conseillé :** la créature devient triste mais n'est jamais perdue.
   - Autres options : elle peut s'enfuir, ou rien ne baisse.
2. **Style des créatures.**
   - **Par défaut conseillé :** animaux emoji.
   - Autre option : créatures inventées et dessinées en SVG.
3. **Fréquence des nouveaux œufs.**
   - **Par défaut conseillé :** environ 1 par semaine en jouant tous les jours.
   - Autres options : 1 tous les 2-3 jours, ou 1 par mois.

Le reste du plan ci-dessous suit les choix par défaut.

### 4.2 Pièces 🪙

Gains :
- **Partie :** 1 pièce par bonne réponse, plus 5 par étoile.
- **Examen réussi :** 20, 30 ou 40 selon la mention.
- **Nouveau badge, selon sa qualité :** Normal 5, Rare 15, Épique 40, Légendaire 100.
- **Passage de niveau :** 20.

Repère : 4 parties de 60 s par jour rapportent environ **100 pièces par jour**.

**Le solde se calcule ainsi : `gagné − dépensé`.**
- Le « gagné » se recalcule à partir de l'historique et des badges, comme l'XP.
- Seul le total dépensé est stocké, dans l'état du compagnon.

### 4.3 Œufs 🥚

- **Premier œuf** offert dès l'ouverture de l'écran Compagnon.
- **Un seul œuf couve à la fois.** Il éclot après un nombre de bonnes réponses qui dépend de sa qualité (barre d'éclosion visible sur l'accueil et en fin de partie) :

  | Qualité de l'œuf | Bonnes réponses pour éclore |
  |---|---|
  | Normal | 50 |
  | Rare | 100 |
  | Épique | 200 |
  | Légendaire | 400 |

- **Le nid.** Les autres œufs attendent leur tour. L'enfant choisit lequel mettre à couver.
- **Comment on obtient un nouvel œuf :**
  - **En fin de partie normale :** 4 % de chance, ou 8 % avec 3 étoiles. Cela fait environ 1 œuf par semaine avec 4 parties par jour.
  - **Avec un badge Épique :** un œuf au moins Rare.
  - **Avec un badge Légendaire :** un œuf au moins Épique.
  - **En boutique :** 800 🪙.
  - **Filet de sécurité :** un œuf garanti s'il n'en a reçu aucun depuis 10 jours de jeu.
- **Qualité d'un œuf tiré au hasard :** Normal 60 %, Rare 28 %, Épique 10 %, Légendaire 2 %.
- **Créature qui sort de l'œuf :** une espèce de la qualité de l'œuf. On choisit en priorité une espèce pas encore possédée, dans 80 % des cas.
- **Astuce pour les chances en fin de partie :** le tirage peut se déduire de l'identifiant de la partie (par exemple un hachage de `game.id` comparé au pourcentage). Ce tirage peut se recalculer et ne se triche pas en rechargeant la page. Il faut quand même enregistrer les œufs reçus dans l'état (voir 4.8).
- **Mises en scène :**
  - œuf qui arrive : il tombe et rebondit ;
  - éclosion : l'œuf se secoue, se fissure, puis la créature apparaît avec la couleur de sa qualité et des confettis.

### 4.4 Bestiaire 📖 (34 espèces, emoji)

| Qualité | Espèces |
|---|---|
| Normal (12) | 🐶 Chiot, 🐱 Chaton, 🐹 Hamster, 🐰 Lapinou, 🐥 Poussin, 🐸 Grenouille, 🐢 Tortue, 🐟 Poisson, 🐌 Escargot, 🐞 Coccinelle, 🐷 Cochon, 🐮 Veau |
| Rare (10) | 🦊 Renard, 🐼 Panda, 🐨 Koala, 🦉 Hibou, 🐧 Pingouin, 🦔 Hérisson, 🐬 Dauphin, 🦜 Perroquet, 🦦 Loutre, 🐙 Pieuvre |
| Épique (7) | 🦁 Lion, 🐯 Tigre, 🐺 Loup, 🦅 Aigle, 🦈 Requin, 🦖 T-Rex, 🐊 Crocodile |
| Légendaire (5) | 🐉 Dragon, 🦄 Licorne, 🐲 Dragon de jade, 🦚 Paon royal, 🐋 Baleine céleste |

- **Page Bestiaire :** une grille par qualité. Les espèces pas encore trouvées apparaissent en silhouette grise avec « ❓ ». Un compteur indique le total trouvé (par exemple « 12 / 34 »).
- **Nom :** l'enfant peut renommer chaque créature.
- **Doublons :** une espèce déjà possédée peut ressortir. Le double se transforme en pièces (25, 60, 150 ou 400 selon la qualité) ou en un accessoire.

### 4.5 Compagnon et besoins 🍎💧😊

- **Un seul compagnon actif à la fois.** Les autres créatures se reposent au « Refuge ». Leurs besoins sont figés : pas de corvée multipliée.
- **Trois jauges de 0 à 100 :**

  | Jauge | Baisse |
  |---|---|
  | Faim | −1 toutes les 30 min (environ 2 jours de 100 à 0) |
  | Soif | −1 toutes les 25 min |
  | Joie | −1 toutes les 40 min, +5 à chaque partie jouée |

- **Pas de minuterie en arrière-plan.** La baisse se calcule à l'ouverture de la page, à partir de `lastTick`.
- **Humeur, d'après la moyenne des jauges :**

  | Moyenne | Humeur |
  |---|---|
  | ≥ 60 | 😄 content : il saute de joie à chaque bonne réponse |
  | 30 à 60 | 😐 bof |
  | < 30 | 😢 triste : il ne grandit plus |

  Il n'est **jamais perdu**. Il retrouve sa forme dès qu'on s'en occupe.
- **Pendant la partie,** le compagnon apparaît en petit dans un coin. Il saute sur une bonne réponse et fait une petite moue sur une erreur.
- **Sur l'accueil,** une carte Compagnon montre la créature animée, les 3 jauges et un bouton « S'occuper de lui ».

### 4.6 Évolution 🌱

- **XP du compagnon :** chaque bonne réponse lui donne 1 XP, seulement s'il est actif et pas triste.
- **Les trois stades :**

  | Stade | XP nécessaire | Affichage |
  |---|---|---|
  | Bébé | 0 | petit, avec 🍼 |
  | Jeune | 300 | taille moyenne |
  | Adulte | 1 000 | grande taille, halo de la couleur de sa qualité |

- **Badges à prévoir :** des familles « Soigneur » (nombre de soins donnés), « Collectionneur » (espèces trouvées) et « Éleveur » (créatures adultes).

### 4.7 Boutique 🛒

| Onglet | Objet | Prix | Effet |
|---|---|---|---|
| Nourriture | 🍎 Pomme | 10 | Faim +20 |
| | 🥪 Sandwich | 25 | Faim +50 |
| | 🎂 Gâteau | 60 | Faim +100, Joie +10 |
| Boissons | 💧 Eau | 8 | Soif +25 |
| | 🧃 Jus | 20 | Soif +60 |
| | 🥤 Smoothie | 45 | Soif +100, Joie +10 |
| Jouets | ⚽ Balle | 30 | Joie +30 |
| | 🧸 Peluche | 80 | Joie +70 |
| | 🎮 Console | 200 | Joie +100 |
| Accessoires (permanents) | 🧢 Casquette | 120 | — |
| | 🕶️ Lunettes | 150 | — |
| | 🎀 Nœud | 150 | — |
| | 🎩 Chapeau | 250 | — |
| | 👑 Couronne | 500 | — |
| Œufs | 🥚 Œuf mystère | 800 | — |

- **Inventaire :** les objets achetés y vont. On les donne au compagnon en les touchant.
- **Accessoires :** ils s'affichent au-dessus de l'emoji, et chaque créature peut porter les siens.

### 4.8 État à stocker (document `pet`)

```
{
  spent: 0,                        // pièces dépensées (le gain se recalcule)
  inventory: { pomme: 2, eau: 1 },
  accessoriesOwned: ['casquette'],
  eggs: [ { id, rarity, source: 'start'|'drop'|'badge'|'shop'|'pity', gotAt, incubating: false, startCorrect } ],
  grantedBadgeEggs: ['serie:4'],   // pour ne donner qu'une seule fois l'œuf d'un badge
  lastEggAt: ts,                   // pour le filet de sécurité de 10 jours
  creatures: [ { id, species, name, rarity, bornAt, petXp, stage, needs: { faim, soif, joie }, lastTick, wearing: [] } ],
  activeId,
  careCount: 0
}
```

- **Serveur :** document `pet` dans la table `docs` (ajouter son validateur dans `DOCS`, `app/api/docs/[name]/route.ts`) et le renvoyer dans `GET /api/state`.
- **Appareil :** clé `tt_pet` dans `localStorage`.
- **Écritures :** une seule à la fois sur ce document (attendre chaque `set`). On écrit seulement après une vraie action : soin, achat, éclosion, fin de partie.

### 4.9 Écrans à ajouter

1. **Carte Compagnon sur l'accueil.** Elle remplace ou complète la carte joueur.
2. **Écran Compagnon.** Créature en grand, jauges, inventaire, et boutons Boutique, Nid, Refuge et Bestiaire.
3. **Boutique.** Avec des onglets.
4. **Nid.** Les œufs en attente et l'œuf qui couve, avec sa progression.
5. **Bestiaire.**
6. **Fin de partie.** Ajouter « +X 🪙 », la progression de l'œuf, et les animations d'œuf trouvé ou d'éclosion.

### 4.10 Ordre de construction conseillé

1. Pièces : calcul du gain, état `pet`, affichage du solde.
2. Premier œuf, couvaison, éclosion, compagnon actif.
3. Jauges, baisse avec le temps, boutique (nourriture, boissons, jouets), inventaire.
4. Bestiaire et nouveaux œufs (fin de partie, badges, boutique, filet de sécurité).
5. Évolution, accessoires et refuge.
6. Nouveaux badges liés aux créatures.

---

## 5. Autres idées pour le garder motivé sur la durée

- **Quêtes du jour.** 3 petits défis qui changent chaque jour, avec des pièces à gagner.
- **Carte de maîtrise.** Une grille 10 × 10 colorée selon la maîtrise de chaque calcul, construite à partir de `seen`. Elle permet aussi une révision espacée des calculs fragiles.
- **Défi du « fantôme ».** Battre sa propre meilleure partie.
- **Mode duel.** Deux joueurs sur la même tablette.
- **Récompenses réelles.** Fixées par les parents à certains paliers.

## 6. Idée technique

- Transformer le jeu en vraie PWA (manifest + service worker, par exemple Serwist) pour pouvoir l'installer et y jouer hors ligne.
- Comptes séparés si un autre enfant joue (aujourd'hui : un seul joueur par serveur).

## 7. Comment lancer et tester

- `pnpm install`, puis copier `.env.example` en `.env.local` et remplir `FAMILY_CODE`.
- `pnpm dev` → http://localhost:3000. La base va dans `./data/`.
- `pnpm test` (Vitest, règles du jeu), `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- Tests dans le navigateur avec Playwright (Chromium, écran de 375 × 780 px, et vérifier 320 px) :
  - jouer avec le clavier (touches 1 à 4) ou en lisant `.q` pour répondre juste ;
  - charger un faux historique avec `localStorage.setItem('tt_history', …)` ;
  - viser les éléments visibles (`.screen:visible`), à cause de `<Activity>`.
- **Déploiement Coolify :** build pack Dockerfile, port 3000, volume persistant monté sur `/app/data`, variable `FAMILY_CODE`.
