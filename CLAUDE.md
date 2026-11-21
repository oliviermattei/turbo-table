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
- **Stack.** Next.js + React pour tous les écrans (menus, boutique, bestiaire…). Pas de moteur de jeu pour l'interface. Les créatures et les œufs sont des images fixes animées en CSS seul (ni Rive ni PixiJS).
- **Visuels.** Une image par espèce × stade. L'humeur, le halo légendaire, l'effet shiny et les accessoires sont des calques ou des animations par-dessus, pas des images séparées.
- **Équilibrage (novembre 2026).** Une partie sur la seule table de 1 avait débloqué 17 badges et 7 coffres (dont 3 Légendaires). Depuis :
  - une bonne réponse vaut des **points** selon son facteur le plus facile (`TABLE_VALUE`) ;
  - les points baissent après une longue journée ;
  - seules les **parties qui comptent** (difficulté ≥ 0,4, au moins 5 bonnes réponses) comptent pour les badges ;
  - les badges ne donnent plus de coffres ;
  - un compagnon triste ne couve plus l'œuf.
  Tous les chiffres sont dans `lib/balance.ts`. On les règle avec le simulateur (`pnpm sim`), jamais à l'intuition.

## 2. Ce qui existe aujourd'hui

### Modes de jeu
- **Partie normale.** On choisit les tables (1 à 10) et la durée.
  - Score affiché : `10 + min(série, 5) × 2` par bonne réponse (ce n'est pas de l'argent).
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
- **Valeur d'une partie** (`lib/game/value.ts`, recalculée depuis l'historique) :
  - une bonne réponse vaut la valeur de son facteur le plus facile : ×1 → 0,05, ×10 → 0,1, ×2 → 0,3, ×5 → 0,35, ×3 et ×4 → 0,8, ×6 à ×9 → 1 ;
  - baisse du jour : les 100 premiers points de la journée comptent en entier, les 100 suivants à moitié, le reste à 20 % ;
  - une **partie qui compte** (`isSerious`) : difficulté moyenne ≥ 0,4 et au moins 5 bonnes réponses. La table de 1, 2, 5 ou 10 seule ne compte pas.
- **XP gagnée.**
  - 2 × points + 5 × étoiles (étoiles seulement dans une partie qui compte).
  - Un diplôme rapporte 20 + 10 × mention la première fois, ou quand la mention s'améliore. Sinon, l'examen rapporte comme une partie.
- **Seuils des badges** calibrés pour qu'un enfant qui joue ~4 parties par jour et connaît ses tables par cœur (~22 bonnes réponses / min) atteigne les Légendaires en ~6 mois. Repère réel : l'enfant fait ~14 / min aujourd'hui, un adulte ~32 / min.
- **Seules les parties qui comptent** comptent pour les badges : séries, vitesse, sans faute, étoiles, jours et parties joués, secrets. Les diplômes, les niveaux et les badges « Table de N » comptent tout. Dans « Table de N », 7 × 1 compte seulement pour la table de 1, et 7 × 10 seulement pour la table de 10. « Bonnes réponses » ne compte pas les × 1 et × 10.
- **149 badges avec 5 qualités**, les mêmes que les créatures : Commun (gris `#cbd5e1`), Peu commun (vert `#22c55e`), Rare (bleu `#3b82f6`), Épique (violet `#a855f7`) et Légendaire (orange `#f59e0b`). La page Badges montre une vignette par badge, regroupées par qualité, au fond de la couleur de la qualité. Les badges se répartissent ainsi :
  - 14 familles de défis à paliers (`FAMILIES`), numérotés en chiffres romains I à VII ;
  - 10 familles « Table de N », selon les bonnes réponses dans cette table (25, 100, 250, 500, 1000) ;
  - 10 badges secrets (`SECRETS`), affichés en « ❓ » avec seulement leur qualité.
  La qualité d'un palier dépend de sa place dans sa famille (`rarityFor`). Les badges Légendaires brillent (animation `glow`).
- **Écran de fin de partie.** Il affiche l'XP gagnée et la barre de niveau qui se remplit. Il montre aussi les nouveaux badges, triés par qualité. S'il n'y en a pas, il affiche le « Prochain badge », celui qui est le plus près d'être gagné.
- **Historique.** Liste des parties, statistiques et calculs les plus ratés.

## 3. Données et stockage

**Principe : on ne stocke que les parties.** Les niveaux, l'XP, les badges et les diplômes sont tous recalculés à partir de l'historique (`computeStats`). On peut donc changer une règle sans migrer de données.
Chaque partie garde aussi une **photo de ses gains** (`gains`, écrite par `settle()` avec la version des règles) et le temps de chaque réponse (`ms`). Ces deux champs servent au Journal des gains et à l'analyse, jamais au calcul.

Une partie ressemble à ceci :

```
{ id, ts, mode: 'normal'|'practice'|'exam', duration, tables: [..], score, correct, total,
  bestStreak, stars, errors: [{a, b, n}],
  seen: { "3x7": [réussis, ratés] },   // clé = min x max ; existe depuis la version « badges à qualités »
  ms: [1200, 950, …],                   // temps de chaque réponse
  gains: { v, points, raw, difficulty, serious, xp, level, coins, badgeCoins, levelCoins, compBonus, badges, chests, balance, comp },
  // examens seulement :
  examTable, passed, mention }
```

**Où c'est stocké :**
- **Sur le serveur** : SQLite (`node:sqlite`, aucune dépendance) dans `DATA_DIR` (`/app/data` en Docker, volume persistant sur Coolify).
  - Table `games` : une ligne par partie (`id`, `ts`, `data` JSON). Une partie ne change jamais : un `id` déjà connu est ignoré.
  - Table `docs` : documents uniques (`profile`, `pet`, `reset`). Chaque document envoyé par un appareil a son validateur dans `app/api/docs/[name]/route.ts`.
  - Tables `games_archive` et `docs_archive` : ce qu'une remise à zéro a mis de côté (rien n'est supprimé).
- **Sur l'appareil** : cache `localStorage` (`tt_history`, `tt_profile`, `tt_tables`, `tt_duration`, `tt_sound`). Le jeu marche sans réseau : les parties non envoyées (`synced: false`) partent à la prochaine ouverture.
- **Accès** : un seul « code famille » (variable `FAMILY_CODE`). Le parent le tape une fois par appareil dans la page Historique, un cookie le garde environ un an. Sans le code, le jeu reste local à l'appareil.
- **API** : `GET /api/state` (toutes les parties + profil + compagnon + date de la dernière remise à zéro), `POST /api/games` (lot de parties), `PUT /api/docs/:name`, `POST /api/login`, `POST /api/reset` (code famille redemandé).
- **Remise à zéro** (Historique, bouton parent) : le serveur archive les parties et le compagnon, puis chaque appareil efface les siens à sa prochaine synchro (document `reset`). Le prénom est gardé.
- Toute donnée qui arrive (localStorage, API) passe par `clean()` (`lib/game/clean.ts`).

### Structure du code

| Dossier | Rôle |
|---|---|
| `lib/balance.ts` | Tous les chiffres d'équilibrage (valeurs, pièces, coffres, besoins, prix). |
| `lib/game/` | Règles pures, sans React : `value.ts` (points, difficulté, baisse du jour, pièces et XP d'une partie), `rules.ts` (niveaux, badges, stats), `questions.ts` (tirage, pièges), `engine.ts` (boucle de partie), `clean.ts`. Testées par `game.test.ts`. |
| `lib/settle.ts` | Fin de partie : tout ce qu'une partie rapporte, et la photo `gains`. Utilisé par l'écran de fin et par le simulateur. |
| `lib/sim/` | Simulateur de joueurs (`players.ts`, `run.ts`), lancé par `pnpm sim`. |
| `lib/data.tsx` | Contexte React : historique, profil, réglages, synchro serveur (`useData()`). |
| `lib/server/` | Base SQLite et code famille (serveur seulement). |
| `app/` | Un écran par route : `/`, `/jouer?mode=…`, `/badges`, `/diplomes`, `/historique`, `/journal` (parents), et `app/api/`. |
| `components/` | `GameSession` (compte à rebours + partie), `EndScreen`, `Certificate`, petits composants dans `ui.tsx`. |
| `public/` | Images (futures créatures : `public/creatures/<espece>/<stade>.webp`). |

Le CSS est celui de l'artifact, dans `app/globals.css`. Avec `cacheComponents`, Next garde l'écran précédent caché (`<Activity>`) : deux `.screen` peuvent exister dans le DOM.

---

## 4. Compagnon, œufs et bestiaire (construit)

Les parties rapportent des pièces. Avec ces pièces, l'enfant s'occupe d'une créature sortie d'un œuf et collectionne un bestiaire.
Décisions détaillées : `docs/assets/inventaire.md`. Vocabulaire : `GLOSSARY.md`. Bestiaire choisi : `docs/Bestiaire.md`.

### Règles (`lib/pet/rules.ts`, fonctions pures testées dans `pet.test.ts` ; chiffres dans `lib/balance.ts`)
- **Pièces** : recalculées depuis l'historique, plus les doublons et le bonus du compagnon. Seul le dépensé est stocké.
  - Une partie rapporte 1 🪙 par point et 1 🪙 par étoile (étoiles seulement dans une partie qui compte), soit ~10 🪙 pour une partie d'une minute sur les tables 2 à 9 à 14 bonnes réponses par minute.
  - +5 🪙 pour la première partie qui compte de la journée.
  - Diplôme : 10 + 10 × mention, une seule fois par table et par mention.
  - Entraînement sur les erreurs : +5 (+5 sans faute), 3 fois par jour au plus, seulement si la partie compte.
  - Badge : 1 / 2 / 3 / 5 / 10 selon sa qualité. Niveau : 5.
- **Coffres** : tout nouvel œuf arrive dans un coffre. On les obtient :
  - avec le premier coffre, offert ;
  - par chance en jouant : 0,1 % par point, ×2 avec 3 étoiles, 5 % au plus ;
  - à la boutique ;
  - avec le filet de sécurité : un coffre Commun après 10 jours joués sans nouvel œuf.
  Les badges ne donnent plus de coffre.
- **Taux de sortie** (`CHEST_ODDS`) :

  | Coffre | Ce qui peut sortir |
  |---|---|
  | Commun | 95 % Commun, 5 % Peu commun |
  | Peu commun | 88 % Peu commun, 12 % Rare |
  | Rare | 90 % Rare, 10 % Épique |
  | Épique | 92 % Épique, 8 % Légendaire |
  | Légendaire | 100 % Légendaire |
- **Œufs** : un œuf par qualité de Commun à Épique, un œuf propre à chaque Légendaire. Ils éclosent après 40 / 80 / 140 / 220 / 320 points gagnés pendant que l'œuf couve (`incubating.done`). Un compagnon triste ne couve pas. Pas de doublon tant qu'il manque une espèce de cette qualité ; un doublon rapporte des pièces. Une espèce n'éclot que si ses images existent (`lib/pet/assets.json`).
- **Besoins** Faim / Joie / Énergie. Ils baissent avec le temps (1,25 / 1 / 2 par heure), et chaque partie donne +4 de joie.
  - Triste : un besoin sous 15, ou une moyenne sous 30. Une sieste gratuite ne suffit donc pas.
  - Content : une moyenne ≥ 60 et aucun besoin sous 35.
  - Triste = image triste, **évolution bloquée**, pas de bonus de pièces et **l'œuf ne grandit plus**. On ne perd jamais une créature.
- **Bonus de pièces du compagnon** (s'il n'est pas triste) : qualité (+0 / 15 / 30 / 50 / 80 %) + stade (+0 / 5 / 10 / 15 %) + 0,5 % par espèce trouvée.
- **Évolution** : le compagnon gagne les points des parties s'il est actif et pas triste. Stades Bébé / Petit / Grand / Super à 0 / 150 / 600 / 1500. Scène d'évolution de 5 s au toucher.
- **Boutique** :
  - nourriture : Pomme 6, Sandwich 13, Gâteau 28, Festin 65, Banquet 150 ;
  - jouets : Balle 8, Peluche 19, Console 40, Manège 85, Fête foraine 210 ;
  - coffres Commun → Légendaire : 200 / 350 / 500 / 900 / 1 800.
- **Appétit** : nourriture et jouets remplissent ×1 / 1,15 / 1,3 / 1,5 / 1,8 fois moins selon la qualité du compagnon. Dormir est gratuit.
- **Résultat de la simulation** (`docs/equilibrage.md`). L'enfant visé joue 10 à 15 parties par jour la 1re semaine, puis ~4. Il trouve :
  - ~5 espèces en une semaine, ~13 en un mois, ~21 en trois mois ;
  - le 1er Rare vers 2 mois, le 1er Légendaire vers 7,5 mois, le bestiaire complet vers 10 mois.
  L'entretien lui coûte ~15 à 20 % de ses gains (~0,7 partie par jour) : plus cher, celui qui ne joue que 2 parties par jour ne pourrait plus nourrir son compagnon. Jouer uniquement la table de 1 donne ~11 espèces en un an ; ne jamais nourrir bloque à 3.

### Journal des gains
`/journal` (lien en bas de l'Historique) : pour chaque jour, les parties, avec :
- leurs points et la raison de leur valeur ;
- les pièces, l'XP, les badges et les coffres gagnés ;
- les achats, les soins, les ouvertures de coffres et les éclosions (journal `log` du document `pet`, 300 lignes au plus).

Un bouton exporte toutes les données en JSON.

### Écrans
`/compagnon`, `/nid`, `/boutique`, `/bestiaire`, `/refuge`, carte Compagnon sur l'accueil, pièces / coffre / œuf en fin de partie. Composants : `components/pet.tsx` (créature animée en CSS), `components/pet-scenes.tsx` (coffre, éclosion, évolution).
La créature n'apparaît jamais pendant une partie.

### Stockage
Document `pet` (`lib/pet/types.ts`) : table `docs` côté serveur (validé par `cleanPet`), `tt_pet` en local. Le plus récent (`updatedAt`) gagne à la synchro.

### Ajouter une espèce
1. Générer sa planche avec le prompt de `docs/assets/brief-production.md` (section 10).
2. La déposer en `assets-src/planches/<slug>.png` (slug = id dans `lib/pet/species.ts`).
3. `pnpm assets` : découpe en `public/creatures/<slug>/` et met à jour `lib/pet/assets.json`. L'espèce peut alors éclore.

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

- **Mode test** (développement local seulement, `pnpm dev`) : case en bas de l'Historique ; stockage à part (`ttdbg_…`), aucune synchro ; « Gagner tout de suite » (800 bonnes réponses), « +1000 🪙 », bestiaire complet. Invisible en production.

- `pnpm install`, puis copier `.env.example` en `.env.local` et remplir `FAMILY_CODE`.
- `pnpm dev` → http://localhost:3000. La base va dans `./data/`.
- `pnpm test` (Vitest, règles du jeu), `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- **Équilibrage : `pnpm sim`** (`--seeds 8 --days 365 --players enfant,fourbe`). Il simule des joueurs virtuels pendant un an, en parallèle :
  - l'enfant visé, l'enfant très motivé, le fourbe table de 1, le fourbe tables faciles, l'adulte à 32 / min, celui qui joue peu, celui qui ne nourrit jamais ;
  - chaque partie passe par `settle()`, et le joueur s'occupe du compagnon (repas, jouets, coffres) ;
  - le résultat va dans `docs/equilibrage.md`.
  Après tout changement de `lib/balance.ts`, relancer et relire le rapport (~2 min avec 4 vies, ~5 min avec 8).
- **Robots navigateur : `pnpm build && pnpm bot`** (Playwright installé sur la machine). Des robots jouent au vrai jeu (enfant, table de 1, examen de la table de 1, parent qui synchronise puis remet à zéro) et vérifient :
  - que les pièces et l'XP affichées sont celles enregistrées ;
  - le solde de la boutique et l'œuf qui avance ;
  - la remise à zéro et son archive.
  Ils utilisent leur propre base, dans `data/e2e`.
- Tests dans le navigateur avec Playwright (Chromium, écran de 375 × 780 px, et vérifier 320 px) :
  - jouer avec le clavier (touches 1 à 4) ou en lisant `.q` pour répondre juste ;
  - charger un faux historique avec `localStorage.setItem('tt_history', …)` ;
  - viser les éléments visibles (`.screen:visible`), à cause de `<Activity>`.
- **Déploiement Coolify :** https://turbotable.olm.re (projet « Turbo Tables », dépôt `oliviermattei/turbo-table`, branche `main`). Build pack Dockerfile, port 3000, volume persistant monté sur `/app/data`, variable `FAMILY_CODE`.
