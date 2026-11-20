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
- **Seuils des badges** calibrés pour qu'un enfant qui joue ~4 parties par jour et connaît ses tables par cœur (~22 bonnes réponses / min) atteigne les Légendaires en ~6 mois. Repère réel : l'enfant fait ~14 / min aujourd'hui, un adulte ~34 / min.
- **149 badges avec 5 qualités**, les mêmes que les créatures : Commun (gris `#cbd5e1`), Peu commun (vert `#22c55e`), Rare (bleu `#3b82f6`), Épique (violet `#a855f7`) et Légendaire (orange `#f59e0b`). La page Badges montre une vignette par badge, regroupées par qualité, au fond de la couleur de la qualité. Les badges se répartissent ainsi :
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

## 4. Compagnon, œufs et bestiaire (construit)

Les parties rapportent des pièces. Avec ces pièces, l'enfant s'occupe d'une créature sortie d'un œuf et collectionne un bestiaire.
Décisions détaillées : `docs/assets/inventaire.md`. Vocabulaire : `GLOSSARY.md`. Bestiaire choisi : `docs/Bestiaire.md`.

### Règles (`lib/pet/rules.ts`, fonctions pures testées dans `pet.test.ts`)
- **Pièces** : recalculées depuis l'historique (partie : bonnes réponses + 5 × étoiles ; examen réussi : 10 + 10 × mention ; badge selon sa qualité ; 20 par niveau) + doublons. Seul le dépensé est stocké.
- **Coffres** : tout nouvel œuf arrive dans un coffre (premier coffre offert, 4 % des parties normales ou 8 % avec 3 étoiles, tirage déduit de `game.id` ; badge Épique → œuf ≥ Rare ; Légendaire → ≥ Épique ; boutique 800 🪙 ; filet de sécurité après 10 jours de jeu sans œuf).
- **Œufs** : un œuf par qualité de Commun à Épique, un œuf propre à chaque Légendaire. Éclosion après 25 / 60 / 120 / 200 / 300 bonnes réponses ; pas de doublon tant qu'il manque une espèce de cette qualité. Réglé avec la simulation `lib/pet/economy.sim.test.ts` (`SIM=1 pnpm vitest run lib/pet/economy.sim.test.ts --reporter=verbose`) : bestiaire complet en ~5 mois, ~9 espèces le 1er mois, ~19 au bout de 2 mois. Une espèce n'éclot que si ses images existent (`lib/pet/assets.json`). Doublon → pièces.
- **Besoins** Faim / Joie / Énergie, baisse calculée à l'ouverture. Humeur = moyenne (≥ 60 content, < 30 triste). Triste = image triste et **évolution bloquée**. Jamais perdu.
- **Bonus de pièces du compagnon** (s'il n'est pas triste) : qualité (+0 à +25 %) + stade (+0 / 10 / 25 / 50 %) + 2 % par espèce trouvée. Les gains grandissent avec la progression.
- **Évolution** : 1 XP par bonne réponse si actif et pas triste. Stades Bébé / Petit / Grand / Super à 0 / 150 / 600 / 1500. Scène d'évolution de 5 s au toucher.
- **Boutique** : nourriture (10 / 20 / 45), jouets (25 / 60 / 150), coffres Commun → Légendaire (500 / 1 000 / 2 000 / 4 000 / 8 000). Dormir est gratuit. Calibré pour ~100 🪙 par jour : l'entretien coûte ~30 % des gains.

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

- `pnpm install`, puis copier `.env.example` en `.env.local` et remplir `FAMILY_CODE`.
- `pnpm dev` → http://localhost:3000. La base va dans `./data/`.
- `pnpm test` (Vitest, règles du jeu), `pnpm typecheck`, `pnpm lint`, `pnpm build`.
- Tests dans le navigateur avec Playwright (Chromium, écran de 375 × 780 px, et vérifier 320 px) :
  - jouer avec le clavier (touches 1 à 4) ou en lisant `.q` pour répondre juste ;
  - charger un faux historique avec `localStorage.setItem('tt_history', …)` ;
  - viser les éléments visibles (`.screen:visible`), à cause de `<Activity>`.
- **Déploiement Coolify :** https://turbotable.olm.re (projet « Turbo Tables », dépôt `oliviermattei/turbo-table`, branche `main`). Build pack Dockerfile, port 3000, volume persistant monté sur `/app/data`, variable `FAMILY_CODE`.
