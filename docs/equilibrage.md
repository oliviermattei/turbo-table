# Équilibrage : rapport du simulateur

Généré par `pnpm sim` le 2026-11-22 : 8 vies par joueur, 365 jours, 36 espèces disponibles. Chaque partie passe par `settle()`, le même code que l’écran de fin de partie. Les chiffres sont des médianes (avec le min–max des vies).

Joueurs virtuels (`lib/sim/players.ts`) :

- **Enfant (cas visé)** (`enfant`) : 14 → 22 bonnes réponses/min en 6 mois ; 10-15 parties/jour la 1re semaine, puis ~4 ; tables variées, examens, entraînements
- **Enfant très motivé** (`marathon`) : Comme l’enfant, mais 30 parties/jour la 1re semaine et 8/jour ensuite
- **Fourbe table de 1** (`fourbe`) : Uniquement la table de 1 en 30 s (20 parties/jour), examen de la table de 1, entraînements pour le bonus
- **Fourbe tables faciles** (`facile`) : Tables 1, 2, 5 et 10 ensemble, parties de 60 s, 10 par jour
- **Adulte rapide** (`adulte`) : 32 bonnes réponses/min, 2 % d’erreurs, toutes les tables, 4 parties de 60 à 180 s par jour
- **Joue peu** (`petit`) : 12 bonnes réponses/min, 2 parties de 60 s par jour, tables 2 à 5
- **Ne nourrit jamais** (`negligent`) : Joue comme l’enfant mais ne donne jamais à manger ni à jouer (seulement la sieste gratuite)

## Espèces trouvées

| Joueur | J1 | J7 | J30 | J90 | J180 | J270 | J365 | Bestiaire complet |
|---|---|---|---|---|---|---|---|---|
| Enfant (cas visé) | 1 | 6 | 13 | 23 | 33 | 36 | 36 | 221 j (193–240) |
| Enfant très motivé | 1 | 7 | 19 | 33 | 36 | 36 | 36 | 110 j (99–114) |
| Fourbe table de 1 | 0 | 1 | 3 | 5 | 7 | 10 | 12 | jamais en 365 j |
| Fourbe tables faciles | 0 | 2 | 8 | 19 | 31 | 36 | 36 | 240 j (224–245) |
| Adulte rapide | 1 | 6 | 21 | 36 | 36 | 36 | 36 | 87 j (77–90) |
| Joue peu | 0 | 1 | 2 | 6 | 11 | 12 | 13 | jamais en 365 j |
| Ne nourrit jamais | 1 | 3 | 3 | 3 | 3 | 3 | 3 | jamais en 365 j |

## Première espèce de chaque qualité (jour)

| Joueur | Commun | Peu commun | Rare | Épique | Légendaire |
|---|---|---|---|---|---|
| Enfant (cas visé) | 0 | 18 | 80 | 131 | 190 |
| Enfant très motivé | 0 | 13 | 41 | 65 | 94 |
| Fourbe table de 1 | 2 | 300 (7/8) | – | – | – |
| Fourbe tables faciles | 1 | 47 | 108 | 158 | 211 |
| Adulte rapide | 0 | 6 | 30 | 51 | 74 |
| Joue peu | 5 | 197 (7/8) | – | – | – |
| Ne nourrit jamais | 0 | – | – | – | – |

## Pièces

Pièces d’une partie normale qui compte (J15-60, sans badges ni niveaux), puis pièces gagnées par jour et part dépensée en nourriture et jouets.

| Joueur | 🪙 / partie | Parties / jour | 🪙 / jour J1-7 | 🪙 / jour J8-30 | 🪙 / jour J31-90 | 🪙 / jour J91-180 | 🪙 / jour J181-365 | Entretien J8-30 | Entretien J91-180 | Triste |
|---|---|---|---|---|---|---|---|---|---|---|
| Enfant (cas visé) | 17 | 6.0 | 155 | 84 | 66 | 92 | 133 | 12 % | 21 % | 3 % |
| Enfant très motivé | 17 | 7.9 | 269 | 117 | 158 | 238 | 279 | 8 % | 6 % | 0 % |
| Fourbe table de 1 | 0 | 13.1 | 32 | 14 | 11 | 12 | 12 | 63 % | 74 % | 0 % |
| Fourbe tables faciles | 0 | 10.0 | 43 | 49 | 58 | 81 | 124 | 19 % | 14 % | 0 % |
| Adulte rapide | 49 | 4.0 | 169 | 181 | 227 | 264 | 262 | 8 % | 8 % | 0 % |
| Joue peu | 12 | 1.7 | 19 | 17 | 15 | 17 | 19 | 96 % | 96 % | 13 % |
| Ne nourrit jamais | 13 | 5.8 | 149 | 71 | 48 | 54 | 67 | 0 % | 0 % | 97 % |

Solde (pièces non dépensées) :

| Joueur | J1 | J7 | J30 | J90 | J180 | J270 | J365 |
|---|---|---|---|---|---|---|---|
| Enfant (cas visé) | 169 | 159 | 157 | 339 | 752 | 6804 | 17863 |
| Enfant très motivé | 117 | 657 | 276 | 1080 | 17138 | 40712 | 66220 |
| Fourbe table de 1 | 72 | 190 | 132 | 98 | 182 | 117 | 98 |
| Fourbe tables faciles | 45 | 87 | 105 | 219 | 618 | 4142 | 14879 |
| Adulte rapide | 61 | 134 | 228 | 2160 | 24388 | 46038 | 68981 |
| Joue peu | 25 | 128 | 126 | 78 | 91 | 122 | 158 |
| Ne nourrit jamais | 157 | 410 | 1964 | 4817 | 9632 | 15668 | 21835 |

## Niveaux et badges

| Joueur | Niveau J7 | J30 | J180 | J365 | Badges J7 (C/PC/R/É/L) | Badges J30 | Badges J180 |
|---|---|---|---|---|---|---|---|
| Enfant (cas visé) | 11 | 18 | 39 | 59 | 22/28/11/5/2 | 24/31/22/18/2 | 24/33/25/35/20 |
| Enfant très motivé | 15 | 23 | 56 | 87 | 22/30/21/14/2 | 24/31/23/26/10 | 24/33/26/35/23 |
| Fourbe table de 1 | 4 | 7 | 17 | 25 | 5/2/1/1/1 | 5/3/2/2/1 | 5/4/3/2/2 |
| Fourbe tables faciles | 5 | 12 | 35 | 54 | 12/7/4/0/0 | 12/14/11/4/4 | 12/14/12/14/11 |
| Adulte rapide | 11 | 24 | 61 | 87 | 21/27/17/6/3 | 21/30/23/25/16 | 21/30/23/33/22 |
| Joue peu | 3 | 7 | 18 | 26 | 13/6/1/0/0 | 19/18/2/0/0 | 19/28/19/10/2 |
| Ne nourrit jamais | 11 | 18 | 39 | 60 | 22/28/12/5/1 | 24/31/22/19/2 | 24/33/25/34/19 |

## Coffres obtenus sur 365 jours (médiane par qualité de l’œuf : C/PC/R/É/L)

| Joueur | Parties | Boutique | Badges | Parties (chance) | Filet de sécurité |
|---|---|---|---|---|---|
| Enfant (cas visé) | 1393 | 9/10/7/5/3 | 0/0/0/0/0 | 24/2/0/0/0 | 11/1/0/0/0 |
| Enfant très motivé | 3064 | 10/10/7/5/3 | 0/0/0/0/0 | 49/3/0/0/0 | 12/1/0/0/0 |
| Fourbe table de 1 | 3793 | 6/1/0/0/0 | 0/0/0/0/0 | 5/0/0/0/0 | 0/0/0/0/0 |
| Fourbe tables faciles | 3650 | 8/10/7/5/3 | 0/0/0/0/0 | 19/1/0/0/0 | 0/0/0/0/0 |
| Adulte rapide | 1460 | 9/10/7/5/3 | 0/0/0/0/0 | 53/4/0/0/0 | 12/1/0/0/0 |
| Joue peu | 582 | 1/1/0/0/0 | 0/0/0/0/0 | 3/0/0/0/0 | 21/1/0/0/0 |
| Ne nourrit jamais | 1410 | 3/0/0/0/0 | 0/0/0/0/0 | 24/1/0/0/0 | 22/2/0/0/0 |

## Réglages utilisés (`lib/balance.ts`)

```json
{
 "TABLE_VALUE": [0, 0.05, 0.3, 0.8, 0.8, 0.35, 1, 1, 1, 1, 0.1 ],
 "SERIOUS": {
  "difficulty": 0.4,
  "correct": 5 },
 "DAILY": {
  "full": 100,
  "half": 100,
  "rest": 0.2 },
 "GAME": {
  "coinsPerPoint": 1,
  "coinsPerStar": 1,
  "xpPerPoint": 2,
  "xpPerStar": 5,
  "examCoins": [10, 10 ],
  "examXp": [20, 10 ],
  "practiceBonus": 5,
  "practicePerfect": 5,
  "practicePerDay": 3,
  "dailyBonus": 5 },
 "BADGE_COINS": {
  "commun": 1,
  "peu-commun": 2,
  "rare": 3,
  "epique": 5,
  "legendaire": 10 },
 "LEVEL_COINS": {
  "perLevel": 5 },
 "DROP": {
  "perPoint": 0.001,
  "threeStars": 2,
  "max": 0.05 },
 "CHEST_ODDS": {
  "commun": {
   "commun": 95,
   "peu-commun": 5 },
  "peu-commun": {
   "peu-commun": 95,
   "rare": 5 },
  "rare": {
   "rare": 95,
   "epique": 5 },
  "epique": {
   "epique": 95,
   "legendaire": 5 },
  "legendaire": {
   "legendaire": 100 } },
 "BADGE_CHEST": {},
 "HATCH": {
  "commun": 40,
  "peu-commun": 80,
  "rare": 140,
  "epique": 220,
  "legendaire": 320 },
 "DUP_COINS": {
  "commun": 5,
  "peu-commun": 10,
  "rare": 20,
  "epique": 40,
  "legendaire": 80 },
 "PITY": {
  "days": 10 },
 "STAGE_XP": {
  "commun": [0, 75, 200, 400 ],
  "peu-commun": [0, 90, 240, 480 ],
  "rare": [0, 110, 300, 590 ],
  "epique": [0, 130, 350, 700 ],
  "legendaire": [0, 150, 400, 800 ] },
 "QUALITY_BONUS": {
  "commun": 0,
  "peu-commun": 0.15,
  "rare": 0.3,
  "epique": 0.5,
  "legendaire": 0.8 },
 "STAGE_BONUS": [0, 0.05, 0.1, 0.15 ],
 "BONUS": {
  "speciesPerStep": 2,
  "perStep": 0.01 },
 "APPETITE": {
  "commun": 1,
  "peu-commun": 1.15,
  "rare": 1.3,
  "epique": 1.5,
  "legendaire": 1.8 },
 "NEEDS": {
  "faim": 1.25,
  "joie": 1,
  "energie": 2,
  "joyPerGame": 4 },
 "MOOD": {
  "sadMin": 15,
  "sadAvg": 30,
  "happyAvg": 60,
  "happyMin": 35 },
 "PRICES": {
  "pomme": 6,
  "sandwich": 13,
  "gateau": 28,
  "festin": 65,
  "banquet": 150,
  "balle": 8,
  "peluche": 19,
  "console": 40,
  "manege": 85,
  "fete": 210,
  "coffre": 180,
  "coffre-peu-commun": 300,
  "coffre-rare": 430,
  "coffre-epique": 750,
  "coffre-legendaire": 1500 }
}
```
