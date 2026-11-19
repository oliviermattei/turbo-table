# Brief de production des planches (ChatGPT Image)

But : produire toutes les images du jeu **dans le style exact de la planche de référence**, sur des planches **toutes construites pareil**, pour qu'un script les découpe automatiquement.
Liste des images à produire : `docs/assets/inventaire.md`. Vocabulaire : `GLOSSARY.md`.

Les prompts sont en anglais : le générateur respecte mieux les contraintes de mise en page en anglais. Les explications restent en français.

---

## 1. Les images de référence

| Fichier | Rôle | Quand la joindre |
|---|---|---|
| `docs/assets/reference/planche-style.png` | la planche d'origine : **le style à copier** (ni plus cartoon, ni plus réaliste) | à chaque demande |
| `docs/assets/reference/gabarit.png` | la **grille vide** (2 × 4 cases, fond `#1E1B4B`), avec un point par case qui marque où poser le sujet | à chaque demande sur fond bleu nuit |
| `docs/assets/reference/gabarit-blanc.png` | la même grille sur fond blanc | à chaque demande sur fond blanc |
| `docs/assets/reference/etalon.png` | la **planche étalon** : la première planche d'espèce validée, qui fixe le gabarit (grille, tailles, fond, lumière) | à chaque demande, dès qu'elle existe |

La planche étalon se crée une seule fois : on génère la première espèce, on la refait jusqu'à ce qu'elle passe toute la check-list (section 7), puis on la copie sous `etalon.png`.

## 2. Méthode de travail dans ChatGPT

1. Ouvrir une **nouvelle conversation** et envoyer le **prompt d'ouverture** (section 4) avec les images de référence : style + gabarit (+ étalon dès qu'il existe).
2. Envoyer ensuite **une planche par message** (sections 5 et 6).
3. **Changer de conversation toutes les 5 planches environ** (le style dérive dans les longues conversations) et recommencer à l'étape 1.
4. Télécharger chaque planche validée en PNG, **sans la retoucher ni la recadrer**, dans `assets-src/planches/` (noms en section 8).

## 3. Le gabarit commun (identique pour TOUTES les planches)

- Format **paysage 1536 × 1024**.
- **Grille de 2 rangées × 4 colonnes**, fournie par `gabarit.png` : 8 cases de 384 × 512 px. Le générateur dessine **dans** le gabarit, et ses traits fins restent visibles sur la planche. Le script découpe exactement sur ces traits.
- **Un seul sujet par case, centré horizontalement** sur le point du gabarit.
- **Ligne de sol commune** : le bas du sujet (pieds, base de l'œuf) se pose sur le point du gabarit, à 88 % de la hauteur de la case. Petite ombre ovale douce sous le sujet, qui recouvre le point.
- **Marge** : aucun sujet ne touche ni ne dépasse le bord de sa case (au moins 8 % de vide autour). Rien ne relie deux cases (pas de particules, pas de queue ou d'aile qui déborde).
- **Fond uni, couleur exacte `#1E1B4B`** (bleu nuit du jeu), sans dégradé, sans texture, sans vignettage, sans fumée, sans étincelles de décor.
  Pourquoi : le script repère le fond par sa couleur, et la fine bordure de détourage se fond dans le fond du jeu.
  Exception : une créature très sombre (noire, bleu nuit, violet foncé) se fait sur fond **`#FFFFFF`**.
- **Aucun texte**, aucune étiquette, aucun cadre en plus des traits du gabarit.
- Lumière venant d'**en haut à gauche** sur toutes les planches.
- **Du mignon au badass** : le Bébé est un chibi tout mignon ; en grandissant, la créature mûrit (proportions adultes, regard plus perçant, air sérieux). Le Super est puissant et impressionnant, façon boss de jeu, plus du tout mignon ni « jouet », mais jamais gore ni effrayant. L'écart entre Bébé et Super doit sauter aux yeux.
- **Silhouette** : chaque créature, et surtout chaque Bébé, a une forme bien à elle (ailleurs, oreilles, queue, posture…), car le bestiaire montre les créatures pas encore trouvées en ombre noire.
- **Angle** : comme sur la référence, la créature est **tournée d'environ 22° vers la gauche ou vers la droite** (léger trois quarts avant) : on voit les deux yeux, le poitrail et les pattes avant. Le regard peut aller ailleurs, mais jamais plus tournée que 22° : ni profil, ni dos.

## 4. Prompt d'ouverture (début de chaque conversation)

```
I will ask you for several image sheets for a children's mobile game. Every sheet must match
the attached reference images exactly. Before anything else, lock in these rules for the whole conversation:

STYLE (copy the first attached image, the style reference)
- From cute to badass: Babies are cute chibis (big round head, large glossy eyes with two white
  highlights, soft blush, rounded shapes, small paws). As they grow, proportions and attitude mature:
  Grown and Super forms have adult proportions (normal-size head, strong athletic body), sharper eyes and a
  serious, powerful, heroic look, cool and badass like a game boss. Never cute, never girly once grown.
- The style reference shows the rendering and painting technique; its cute proportions apply to Babies only.
- Soft painterly digital rendering, like a polished mobile game illustration: smooth shading,
  gentle rim light, fine fur / feather / scale texture strokes.
- No thick black outlines: edges are a slightly darker shade of the local colour.
- Exactly the same level of detail as the reference: not flatter or more cartoonish,
  not more realistic or more detailed.
- Light comes from the top left. Always suitable for an 8-year-old: impressive and tough when grown,
  but no blood, no gore, no horror.
- Silhouette: every creature, and above all every Baby, has its own recognisable shape (it is shown
  as a black silhouette in the bestiary before it is found). Exaggerate its signature feature.
- Camera: every creature is turned about 22 degrees to the left or to the right (light front
  three-quarter view), both eyes and the chest visible. It may look anywhere, but never more turned
  than 22 degrees: no side profile, never seen from behind.
- Original designs only: nothing that resembles an existing franchise character.

LAYOUT (draw ON the attached grid template)
- Landscape 1536x1024. The template is a grid of 2 rows x 4 columns: 8 cells of 384x512 px.
  Keep its thin grid lines exactly where they are, unchanged and visible. Never draw over them.
- Exactly one subject per cell, centred horizontally on the cell's small dot.
  The bottom of the subject (feet, base of the egg) rests on that dot, with a small soft oval shadow covering it.
- If a template sheet (a validated example) is also attached, copy its layout, sizes and lighting.
- Every subject keeps at least 8% empty margin inside its cell; nothing crosses into another cell.
- Perfectly flat solid background of the exact colour I give (default #1E1B4B):
  no gradient, no texture, no vignette, no smoke, no background sparkles.
- No text, no labels, no frames other than the template grid lines.

Reply "OK" and wait for my first sheet.
```

## 5. Prompt d'une planche d'espèce

Une planche par espèce : 4 stades × 2 humeurs.
Je remplis les champs `<…>` pour chaque espèce dès que la liste est choisie (section 9).

```
Sheet: <NAME> (<QUALITY>). Background #1E1B4B.
Creature: <ONE-LINE CONCEPT>. Main colours: <COLOURS>.
Distinctive features kept at every stage: <FEATURES>.

Top row, left to right, happy expression:
1. Baby: <DESCRIPTION>. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: <POSE>.
2. Young: <DESCRIPTION>. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: <POSE>.
3. Grown: <DESCRIPTION>. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: <POSE>.
4. Super: <DESCRIPTION>. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: <POSE>.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. The four poses must be different
from each other (for example sitting, standing, three-quarter view, wings open).
```

La taille affichée en jeu est fixée par le code selon le stade. Les tailles de la planche servent seulement à donner les bonnes proportions au dessin.

## 6. Autres planches

### Œufs de base et coffre
```
Sheet: eggs and chest. Background #1E1B4B. Same egg size in all four top cells (about 55% of the cell height).
Top row, left to right:
1. Common egg: cream beige with soft brown spots.
2. Uncommon egg: soft green with darker green leaf patterns.
3. Rare egg: blue with light blue wave stripes.
4. Epic egg: purple with orange stars, faint purple glow hugging the shell (no loose sparkles).
Bottom row, left to right:
5. An empty white eggshell broken in two halves lying on the ground, zigzag edges.
6. A cute rounded wooden treasure chest with golden trims, closed, heart-shaped golden lock.
7. The same chest open, lid raised, inside glowing with soft white light, nothing inside.
8. Empty cell.
```

### Objets
```
Sheet: items. Background #1E1B4B. Each item about 40% of the cell height, same painterly style.
Top row: 1. shiny red apple  2. sandwich  3. small birthday cake with one candle  4. blue and white ball.
Bottom row: 5. teddy bear plush  6. round colourful handheld game console  7. cosy little bed made of large green leaves  8. empty cell.
```

### Œufs légendaires (jusqu'à 8 par planche ; les prompts remplis sont en section 10)
Règle : le lien avec la créature reste **discret** (couleurs, matière, texture), jamais une partie du corps ni un symbole évident (pas de corne, d'aile, de flamme…).
```
Sheet: legendary eggs. Background #1E1B4B. Each egg about 60% of the cell height,
much more spectacular than ordinary eggs, with an orange-gold legendary glow hugging the shell
(the glow stays inside the cell).
1. <EGG 1: description, hinting at the creature that will hatch>
2. <EGG 2 …>
…
Unused cells stay empty.
```

Les fissures de l'œuf pendant l'éclosion ne sont pas générées : elles sont dessinées par le code (SVG), pour se poser exactement sur chaque œuf.

## 7. Check-list de validation d'une planche

Refaire la planche (« Regenerate the whole sheet, fixing: … ») si un seul point manque :
- [ ] Le style est celui de la référence : même rendu, même niveau de détail, mêmes yeux.
- [ ] Les traits du gabarit sont intacts et droits, aux mêmes endroits.
- [ ] 8 cases (ou le nombre demandé), un seul sujet par case, centré sur son point, les pieds sur le point.
- [ ] Aucun sujet ne touche le bord de sa case ni ne déborde dans une autre.
- [ ] Fond parfaitement uni, de la bonne couleur, sans fumée ni étincelles.
- [ ] Aucun texte ni cadre.
- [ ] Planche d'espèce : on reconnaît la même créature aux 4 stades, et les poses sont différentes.
- [ ] Le Bébé est mignon, le Grand a l'air sérieux, le Super a l'air puissant et badass (pas kawaii).
- [ ] Les 4 stades ont des silhouettes différentes, et celle du Bébé ne ressemble à aucun autre bébé du jeu (le bestiaire l'affiche en ombre noire).
- [ ] Chaque créature est tournée d'environ 22° (gauche ou droite), on voit ses deux yeux et son poitrail, aucune n'est de profil.
- [ ] Planche d'espèce : la rangée du bas a les mêmes poses que celle du haut, avec un air triste.
- [ ] Rien d'effrayant, rien qui ressemble à un personnage connu.

Pour corriger une seule case : « Keep everything identical, only redraw cell <N>: … ». Si le reste bouge, refaire toute la planche.

## 8. Rangement et découpe

Planches sources (non publiées) : `assets-src/planches/`.

| Planche | Fichier |
|---|---|
| Une espèce | `assets-src/planches/<espece>.png` (nom en minuscules, sans accent, tirets : `lion-soleil`) |
| Œufs de base + coffre | `assets-src/planches/oeufs.png` |
| Objets | `assets-src/planches/objets.png` |
| Œufs légendaires | `assets-src/planches/oeufs-legendaires-1.png` |

Un script découpe chaque case sur les traits du gabarit, enlève le fond (et les traits) et rogne au plus près, puis écrit le WebP au bon endroit (chemins dans `inventaire.md`).
Ordre des cases d'une planche d'espèce : `bebe, petit, grand, super` puis `bebe-triste, petit-triste, grand-triste, super-triste`.
Si les traits ont bougé, le script se cale sur les traits réellement dessinés. Un sujet qui chevauche un trait est refusé.

## 9. Fiche espèce

Le bestiaire retenu est dans `docs/Bestiaire.md`. Les fiches remplies sont directement les prompts de la section 10.

Pour chaque espèce choisie, on remplit avant de générer :

| Champ | Exemple |
|---|---|
| Nom / slug | Lion Soleil / `lion-soleil` |
| Qualité | Légendaire |
| Idée en une phrase | un lionceau solaire dont la crinière est faite de rayons |
| Couleurs dominantes | or, orange, crème |
| Signes distinctifs | crinière en rayons, tache en forme de soleil sur le front |
| Bébé / Petit / Grand / Super | description + pose pour chacun |
| Fond | `#1E1B4B` ou `#FFFFFF` |
| Mouvement (pour le code) | marche lourde |
| Œuf spécial (Légendaires) | œuf doré à couronne de rayons |

## 10. Prompts prêts à coller

Source : `docs/Bestiaire.md`, les créatures cochées `x` : **36 espèces** (11 Commun, 10 Peu commun, 7 Rare, 5 Épique, 3 Légendaire), soit **39 planches**.
Si tu changes une coche dans le bestiaire, demande-moi de régénérer cette section.

Chaque conversation commence de la même façon :
1. nouvelle conversation ChatGPT ;
2. joindre `planche-style.png` + le gabarit indiqué (+ `etalon.png` dès qu'il existe) ;
3. coller le **prompt d'ouverture** (section 4) et attendre « OK » ;
4. coller les planches une par une, en vérifiant chacune avec la check-list (section 7).

Déjà faites (à refaire seulement si tu veux la nouvelle silhouette) : Chiot, Chaton, Lapin, Axolotl, Slime.

La première planche (Chaton) sert à créer l'**étalon** : la refaire jusqu'à ce qu'elle soit parfaite, puis la copier aussi sous `docs/assets/reference/etalon.png`.

### Conversation 1 : fond bleu nuit (joindre `gabarit.png`)

#### Chaton (Commun, sautille)
Enregistrer sous `assets-src/planches/chaton.png`.

```
Sheet: Chaton (Common). Background #1E1B4B.
Creature: a little ginger tabby kitten with a golden bell. Main colours: ginger, cream, gold.
Distinctive features kept at every stage: ginger tabby stripes, cream muzzle, golden bell on a collar.

Top row, left to right, happy expression:
1. Baby: a tiny ginger kitten standing up on its hind legs, batting at its golden bell, tail pointing straight up like an antenna. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing on hind legs.
2. Young: question-mark tail, small golden bell. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: crouched, ready to pounce, tail curved.
3. Grown: slender kitten, clear stripes, long whiskers. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: walking, tail in a question mark.
4. Super: big proud cat, plume-like bushy tail, large shiny golden bell. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud standing pose, huge plume tail raised behind it.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Chiot (Commun, sautille)
Enregistrer sous `assets-src/planches/chiot.png`.

```
Sheet: Chiot (Common). Background #1E1B4B.
Creature: a playful puppy with floppy ears. Main colours: beige, chocolate brown, red.
Distinctive features kept at every stage: floppy ears, brown patch around one eye, red scarf.

Top row, left to right, happy expression:
1. Baby: a beige puppy lying flat on its belly with its huge floppy ears spread wide on the floor like a mat, front paws stretched forward: a wide, low shape. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: lying on its belly.
2. Young: clumsy puppy, brown patch over one eye, red scarf. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: running, ears flying.
3. Grown: slender young dog, ears flying in the wind. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, one front paw raised, tail wagging.
4. Super: big proud dog, red scarf tied like a small cape. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, red scarf blowing like a cape.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Lapin (Commun, sautille)
Enregistrer sous `assets-src/planches/lapin.png`.

```
Sheet: Lapin (Common). Background #1E1B4B.
Creature: a soft white bunny with a pink nose. Main colours: white, pearl grey, pink.
Distinctive features kept at every stage: pink nose, pompom tail, pearl grey ear tips.

Top row, left to right, happy expression:
1. Baby: a tall, narrow bunny sitting very upright like a little bottle, one ear straight up and the other folded down. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting very upright.
2. Young: ears standing up, pompom tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: mid-hop, both ears straight up.
3. Grown: very long ears, big hind feet. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs like a meerkat, very long ears.
4. Super: huge ears, a fluffy tuft of fur on the head. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: sitting upright, giant ears forming a crown above its head.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Cochon (Commun, marche lourde)
Enregistrer sous `assets-src/planches/cochon.png`.

```
Sheet: Cochon (Common). Background #1E1B4B.
Creature: a little pink piglet who loves mud. Main colours: pink, deep pink, brown.
Distinctive features kept at every stage: curly tail, round snout, mud spot on the cheek.

Top row, left to right, happy expression:
1. Baby: a very wide oval pink piglet seen trotting, tiny legs under a big round body, round snout and corkscrew tail. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: trotting.
2. Young: corkscrew tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: rolling happily on its side.
3. Grown: chubby pig, mud spot on the cheek. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sitting on its bottom, laughing.
4. Super: big laughing pig wearing a straw hat. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing proudly, straw hat on its head.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Vache (Commun, marche lourde)
Enregistrer sous `assets-src/planches/vache.png`.

```
Sheet: Vache (Common). Background #1E1B4B.
Creature: a spotted calf with a little bell. Main colours: white, black, pink.
Distinctive features kept at every stage: black spots on white, pink muzzle, small bell.

Top row, left to right, happy expression:
1. Baby: a calf on very long, wobbly legs with knees pointing together, body small on top of tall thin legs. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing on wobbly legs.
2. Young: wobbly legs, tiny horns. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking.
3. Grown: clear spots, a small bell. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: lying down, legs folded, bell visible.
4. Super: big cow, golden bell, crown of flowers. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing proudly, flower crown and golden bell.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

### Conversation 2 : fond bleu nuit (joindre `gabarit.png`)

#### Canard (Commun, nage)
Enregistrer sous `assets-src/planches/canard.png`.

```
Sheet: Canard (Common). Background #1E1B4B.
Creature: a duckling splashing around. Main colours: yellow, orange, white.
Distinctive features kept at every stage: orange bill, webbed orange feet.

Top row, left to right, happy expression:
1. Baby: a duckling waddling with its tiny wings spread out sideways like an airplane. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: waddling, wings out.
2. Young: clearly visible webbed feet. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, webbed feet visible.
3. Grown: white feathers growing in among the yellow fluff. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flapping its wings.
4. Super: big white duck wearing a sailor beanie. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing proudly in a sailor beanie.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Poisson rouge (Commun, nage)
Enregistrer sous `assets-src/planches/poisson-rouge.png`.

```
Sheet: Poisson rouge (Common). Background #1E1B4B.
Creature: a bowl goldfish with veil-like fins. Main colours: orange, white, bubble blue.
Distinctive features kept at every stage: orange body, white fin tips, little bubbles.

Top row, left to right, happy expression:
1. Baby: a tiny droplet-shaped goldfish with a fan tail almost as big as its body. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating upright.
2. Young: round fish, fan-shaped tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming.
3. Grown: fins as long as ribbons. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling, long ribbon fins.
4. Super: veil-like fins, a small crown of bubbles on its head. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, veil fins spread, bubble crown.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Âne (Commun, marche lourde)
Enregistrer sous `assets-src/planches/ane.png`.

```
Sheet: Âne (Common). Background #1E1B4B.
Creature: a stubborn donkey foal with very big ears. Main colours: mouse grey, white, blue.
Distinctive features kept at every stage: very long ears, white muzzle, blue halter.

Top row, left to right, happy expression:
1. Baby: a donkey foal on four thin legs with two enormous upright ears taller than its head. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: white muzzle, blue halter. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: trotting.
3. Grown: brush-like mane. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sitting, stubborn face.
4. Super: big donkey carrying saddlebags full of carrots. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance with carrot saddlebags.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Tortue (Commun, marche lourde)
Enregistrer sous `assets-src/planches/tortue.png`.

```
Sheet: Tortue (Common). Background #1E1B4B.
Creature: a garden tortoise who loves lettuce. Main colours: green, brown, yellow.
Distinctive features kept at every stage: hexagon pattern on the shell, green skin.

Top row, left to right, happy expression:
1. Baby: a baby tortoise tucked inside a high dome shell, only its eyes and the tips of its feet peeking out. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: tucked in its shell.
2. Young: hexagon pattern on the shell. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking slowly, head out.
3. Grown: domed shell, longer neck. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing tall, neck stretched up.
4. Super: big shell with golden edges, a lettuce leaf in its mouth. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, lettuce leaf in its mouth.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Perruche (Commun, voltige)
Enregistrer sous `assets-src/planches/perruche.png`.

```
Sheet: Perruche (Common). Background #1E1B4B.
Creature: a chatty budgie. Main colours: apple green, yellow, blue.
Distinctive features kept at every stage: yellow face, blue tail, small curved beak.

Top row, left to right, happy expression:
1. Baby: a round green fluff ball with a big curved beak and one single long tail feather pointing straight up. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: yellow head, little wings. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping, wings half open.
3. Grown: long blue tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying, wings spread.
4. Super: fan-shaped head feathers, very long tail. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, fan of head feathers, very long tail.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

### Conversation 3 : fond bleu nuit (joindre `gabarit.png`)

#### Hérisson (Commun, se tortille)
Enregistrer sous `assets-src/planches/herisson.png`.

```
Sheet: Hérisson (Common). Background #1E1B4B.
Creature: a hedgehog who rolls into a ball. Main colours: brown, cream, pink.
Distinctive features kept at every stage: soft brown spines, cream face, pink nose.

Top row, left to right, happy expression:
1. Baby: a hedgehog rolled into a spiky ball with only its pink nose and eyes peeking out. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: rolled into a ball.
2. Young: short spines, pink snout. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: trotting, spines bouncing.
3. Grown: fan-shaped spines. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs, spines fanned out.
4. Super: big hedgehog with an apple stuck on its back. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, apple stuck on its back.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Fennec (Peu commun, sautille)
Enregistrer sous `assets-src/planches/fennec.png`.

```
Sheet: Fennec (Uncommon). Background #1E1B4B.
Creature: a desert fox with giant ears. Main colours: sand, cream, pink.
Distinctive features kept at every stage: enormous ears with pink insides, sandy fur.

Top row, left to right, happy expression:
1. Baby: a tiny sandy fox whose two ears are each taller than its whole body, forming a big V above it. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: pointy muzzle, bushy tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: mid-hop.
3. Grown: thin legs, huge ears. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, ears turned like radars.
4. Super: big fennec fox wearing a traveller's scarf. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance with a traveller scarf.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Panda roux (Peu commun, sautille)
Enregistrer sous `assets-src/planches/panda-roux.png`.

```
Sheet: Panda roux (Uncommon). Background #1E1B4B.
Creature: a little red panda with a ringed tail. Main colours: russet red, white, dark brown.
Distinctive features kept at every stage: white face mask, ringed tail, dark brown legs.

Top row, left to right, happy expression:
1. Baby: a red panda cub sitting under its huge ringed tail curled over its head like an umbrella. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting under its tail.
2. Young: ringed tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: climbing pose, front paws up.
3. Grown: slender, dark brown legs. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: walking along, tail held high.
4. Super: huge tail it wraps itself in. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: curled in its enormous tail like a scarf.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Axolotl (Peu commun, nage)
Enregistrer sous `assets-src/planches/axolotl.png`.

```
Sheet: Axolotl (Uncommon). Background #1E1B4B.
Creature: a pink salamander who is always smiling. Main colours: pink, fuchsia, white.
Distinctive features kept at every stage: permanent smile, feathery gills on each side of the head.

Top row, left to right, happy expression:
1. Baby: an axolotl baby shaped like a tadpole with feathery gills spread wide around its head like a lion mane. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: feathery gills on the sides. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming.
3. Grown: longer body, bigger gills. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling.
4. Super: gills like a fuchsia crown. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, gills like a fuchsia crown.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Loutre (Peu commun, nage)
Enregistrer sous `assets-src/planches/loutre.png`.

```
Sheet: Loutre (Uncommon). Background #1E1B4B.
Creature: a sea otter floating on its back. Main colours: chocolate brown, cream, blue grey.
Distinctive features kept at every stage: cream face, whiskers, flat tail.

Top row, left to right, happy expression:
1. Baby: an otter pup floating flat on its back, belly up, holding a pebble on its chest: a long horizontal shape. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating on its back.
2. Young: whiskers, holding a pebble in its paws. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming upright, whiskers out.
3. Grown: long flat tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs, long flat tail.
4. Super: floating on its back, holding a seashell tight on its belly. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: floating on its back hugging a seashell.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

### Conversation 4 : fond bleu nuit (joindre `gabarit.png`)

#### Chouette (Peu commun, voltige)
Enregistrer sous `assets-src/planches/chouette.png`.

```
Sheet: Chouette (Uncommon). Background #1E1B4B.
Creature: a little scops owl of the night. Main colours: blue grey, cream, gold.
Distinctive features kept at every stage: huge golden eyes, ear tufts.

Top row, left to right, happy expression:
1. Baby: a round owlet shaped like an egg with two pointed ear tufts and enormous eyes. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: perched upright.
2. Young: ear tufts on the head. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping, wings half open.
3. Grown: striped wings. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying, striped wings spread.
4. Super: large open wings, feathery ear tufts. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, wings fully open.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Koala (Peu commun, marche lourde)
Enregistrer sous `assets-src/planches/koala.png`.

```
Sheet: Koala (Uncommon). Background #1E1B4B.
Creature: a sleepy koala. Main colours: grey, white, black.
Distinctive features kept at every stage: big fluffy ears, big black nose.

Top row, left to right, happy expression:
1. Baby: a koala joey hugging a vertical eucalyptus stick with its arms and legs, big fluffy ears. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: hugging a stick.
2. Young: big fluffy ears. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: sitting, big ears.
3. Grown: big black nose, soft claws. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: climbing pose.
4. Super: chubby koala hugging a eucalyptus leaf. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: chubby koala hugging a big eucalyptus branch.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Hippocampe (Peu commun, nage)
Enregistrer sous `assets-src/planches/hippocampe.png`.

```
Sheet: Hippocampe (Uncommon). Background #1E1B4B.
Creature: a little seahorse. Main colours: pale yellow, coral, turquoise.
Distinctive features kept at every stage: curled tail, coral back crest.

Top row, left to right, happy expression:
1. Baby: a tiny seahorse shaped like a comma, tail curled into a tight spiral. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating upright.
2. Young: curled tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming.
3. Grown: coral back crest. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling.
4. Super: fan-shaped crest, spiral tail. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, fan crest spread.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Toucan (Peu commun, voltige)
Enregistrer sous `assets-src/planches/toucan.png`.

```
Sheet: Toucan (Uncommon). Background #1E1B4B.
Creature: a jungle bird with a rainbow beak. Main colours: black, orange, yellow.
Distinctive features kept at every stage: huge colourful beak, black body.

Top row, left to right, happy expression:
1. Baby: a small black ball dominated by a huge orange beak, bigger than its head. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: growing orange beak. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping.
3. Grown: yellow-orange-green beak. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying.
4. Super: huge shiny beak, red tail feathers. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, huge shiny beak, red tail feathers.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Slime (Peu commun, se tortille)
Enregistrer sous `assets-src/planches/slime.png`.

```
Sheet: Slime (Uncommon). Background #1E1B4B.
Creature: a magical blue jelly creature that transforms a lot as it grows, from a droplet into a jelly guardian. Main colours: blue, turquoise, white highlights, a touch of gold at the last stage.
Distinctive features kept at every stage: translucent glossy blue jelly with white highlights, the same big round shiny eyes, a little bubble motif; every detail stays attached to the body (nothing floating free).

Top row, left to right, happy expression:
1. Baby: a tiny blue jelly droplet with big eyes and a single bubble stuck on top of its head like a hat. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: a round jelly ball that has grown two little nub arms and a curly jelly antenna ending in a glowing bubble. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: wiggling.
3. Grown: a taller jelly creature standing on two stubby jelly legs, with small pointed jelly ears, a splash-shaped crest on its head and tiny glowing fish and stars suspended inside its translucent belly. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: bouncy pose, leaning to one side.
4. Super: a majestic jelly guardian shaped like a living fountain: layered translucent body, a crown of frozen golden water splashes, a glowing gem core in its chest and a cape of flowing jelly drips behind it. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, standing tall.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

### Conversation 5 : fond bleu nuit (joindre `gabarit.png`)

#### Champignouf (Rare, sautille)
Enregistrer sous `assets-src/planches/champignouf.png`.

```
Sheet: Champignouf (Rare). Background #1E1B4B.
Creature: a little mushroom creature from the forest. Main colours: raspberry, cream, moss green.
Distinctive features kept at every stage: raspberry cap with cream dots, cream stem body.

Top row, left to right, happy expression:
1. Baby: a mushroom button: a wide domed cap on a tiny stem, two eyes peeking from under the cap. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: dotted cap, little feet. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping.
3. Grown: wider cap with a leaf on top. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: dancing, one foot up.
4. Super: big cap with glowing dots. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, giant glowing cap.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Nuagichat (Rare, flotte)
Enregistrer sous `assets-src/planches/nuagichat.png`.

```
Sheet: Nuagichat (Rare). Background #1E1B4B.
Creature: a cat made of cloud. Main colours: white, sky blue, pink.
Distinctive features kept at every stage: cloud body, pink cheeks, swirl-shaped tail.

Top row, left to right, happy expression:
1. Baby: a little cloud puff with two cat ears on top and a curly wisp tail. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: swirl-shaped tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, tilted.
3. Grown: cloud body, pink cheeks. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: stretching like a cat in the air.
4. Super: big cloud cat with a mini rainbow on its back. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic floating pose, mini rainbow on its back.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Rainette Fleurie (Rare, sautille)
Enregistrer sous `assets-src/planches/rainette-fleurie.png`.

```
Sheet: Rainette Fleurie (Rare). Background #1E1B4B.
Creature: a frog with a water lily on its head. Main colours: green, pink, white.
Distinctive features kept at every stage: pink water lily on the head, green skin.

Top row, left to right, happy expression:
1. Baby: a tadpole with a long wiggly tail and a closed flower bud on its head. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: frog with a closed flower. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: jumping, legs stretched.
3. Grown: half-open flower. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sitting, half-open flower.
4. Super: fully bloomed water lily worn like a hat. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, water lily hat in full bloom.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Cactouille (Rare, se tortille)
Enregistrer sous `assets-src/planches/cactouille.png`.

```
Sheet: Cactouille (Rare). Background #1E1B4B.
Creature: a little living desert cactus. Main colours: sage green, yellow, sand.
Distinctive features kept at every stage: soft spines, sandy clay pot.

Top row, left to right, happy expression:
1. Baby: a small round cactus in a clay pot with two tiny stubby arms raised up. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing in its pot.
2. Young: growing arms. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: wiggling.
3. Grown: taller, soft spines. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: arms wide open.
4. Super: big yellow flower on its head. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing tall, big yellow flower on top.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Méduluce (Rare, nage)
Enregistrer sous `assets-src/planches/meduluce.png`.

```
Sheet: Méduluce (Rare). Background #1E1B4B.
Creature: a glowing jellyfish of the night sea. Main colours: lilac, pink, pearly white.
Distinctive features kept at every stage: lilac bell, glowing tentacles.

Top row, left to right, happy expression:
1. Baby: a small lilac bell with three short tentacles hanging below, like a little lamp. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: three little tentacles. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming upward.
3. Grown: wavy glowing tentacles. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling, wavy tentacles.
4. Super: a dress of glowing tentacles. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, dress of glowing tentacles.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

### Conversation 6 : fond bleu nuit (joindre `gabarit.png`)

#### Rocaillou (Rare, marche lourde)
Enregistrer sous `assets-src/planches/rocaillou.png`.

```
Sheet: Rocaillou (Rare). Background #1E1B4B.
Creature: a turtle whose shell is a crystal rock. Main colours: grey, moss green, violet.
Distinctive features kept at every stage: rock shell with moss, violet crystals.

Top row, left to right, happy expression:
1. Baby: a flat pebble with only two eyes and four tiny feet peeking out underneath. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: resting.
2. Young: head and legs poking out. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking, head out.
3. Grown: mossy shell. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing tall, mossy shell.
4. Super: shell bristling with violet crystals. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, crystal spikes on its shell.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Ours Glacier (Épique, marche lourde)
Enregistrer sous `assets-src/planches/ours-glacier.png`.

```
Sheet: Ours Glacier (Epic). Background #1E1B4B.
Creature: a polar bear in ice armour. Main colours: white, glacier blue, silver.
Distinctive features kept at every stage: ice crystal on the forehead, ice armour plates.

Top row, left to right, happy expression:
1. Baby: a round white bear cub with a pointed ice crystal standing up on its forehead. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: frost plates on the shoulders. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking on all fours.
3. Grown: ice shoulder pads, crystal claws. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs, ice shoulder pads.
4. Super: full ice armour, crown of frozen spikes. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance in full ice armour.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Cerf de Cristal (Épique, sautille)
Enregistrer sous `assets-src/planches/cerf-de-cristal.png`.

```
Sheet: Cerf de Cristal (Epic). Background #1E1B4B.
Creature: a deer with faceted crystal antlers. Main colours: pink, crystal blue, white.
Distinctive features kept at every stage: faceted crystal antlers, white coat.

Top row, left to right, happy expression:
1. Baby: a fawn on long thin legs with two small crystal points, standing alert, big ears. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: two-branch crystal antlers. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: leaping.
3. Grown: faceted antlers reflecting the light. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, head turned.
4. Super: huge prismatic antlers, crystal hooves. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, huge prismatic antlers.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Licorne Aurore (Légendaire, flotte)
Enregistrer sous `assets-src/planches/licorne-aurore.png`.

```
Sheet: Licorne Aurore (Legendary). Background #1E1B4B.
Creature: a unicorn in pearly armour with aurora colours. Main colours: mint green, violet, pink.
Distinctive features kept at every stage: aurora gradient mane, spiral horn, pearly armour.

Top row, left to right, happy expression:
1. Baby: a chubby filly floating with its legs tucked under it, a mini spiral horn and a short wavy aurora mane. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating, legs tucked.
2. Young: wavy gradient mane. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, galloping in the air.
3. Grown: glowing spiral horn, pearly chest plate. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: rearing up.
4. Super: immense aurora mane, crystal horn, pearly armour. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic floating pose, immense aurora mane.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Phénix Solaire (Légendaire, voltige)
Enregistrer sous `assets-src/planches/phenix-solaire.png`.

```
Sheet: Phénix Solaire (Legendary). Background #1E1B4B.
Creature: a fire bird reborn from the sun. Main colours: gold, orange, red.
Distinctive features kept at every stage: flame feathers, crown of flames.

Top row, left to right, happy expression:
1. Baby: a golden chick with a big torch-like flame crest on its head and stubby wings. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: flame feathers. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping, wings half open.
3. Grown: long fire tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying, fire tail.
4. Super: sun wings spread wide, crown of flames, fan-shaped tail. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, sun wings spread.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

### Conversation 7 : fond bleu nuit (joindre `gabarit.png`)

#### Renard Céleste (Légendaire, sautille)
Enregistrer sous `assets-src/planches/renard-celeste.png`.

```
Sheet: Renard Céleste (Legendary). Background #1E1B4B.
Creature: a fox with nine tails of cold flames. Main colours: pearly white, turquoise, gold.
Distinctive features kept at every stage: turquoise flame tail tips, golden forehead marks.

Top row, left to right, happy expression:
1. Baby: a white fox cub curled around its single huge fluffy tail with a turquoise tip. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: curled around its tail.
2. Young: three tails with turquoise tips. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: mid-hop, three tails.
3. Grown: six tails, golden marks on the forehead. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, six tails fanned.
4. Super: nine tails fanned out like cold flames, golden marks. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, nine tails in a fan.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Œufs de base et coffre
Enregistrer sous `assets-src/planches/oeufs.png`.

```
Sheet: eggs and chest. Background #1E1B4B. Same egg size in all four top cells (about 55% of the cell height).
Top row, left to right:
1. Common egg: cream beige with soft brown spots.
2. Uncommon egg: soft green with darker green leaf patterns.
3. Rare egg: blue with light blue wave stripes.
4. Epic egg: purple with orange stars, faint purple glow hugging the shell (no loose sparkles).
Bottom row, left to right:
5. An empty white eggshell broken in two halves lying on the ground, zigzag edges.
6. A cute rounded wooden treasure chest with golden trims, closed, heart-shaped golden lock.
7. The same chest open, lid raised, inside glowing with soft white light, nothing inside.
8. Empty cell.
```

#### Objets
Enregistrer sous `assets-src/planches/objets.png`.

```
Sheet: items. Background #1E1B4B. Each item about 40% of the cell height, same painterly style.
Top row: 1. shiny red apple  2. sandwich  3. small birthday cake with one candle  4. blue and white ball.
Bottom row: 5. teddy bear plush  6. round colourful handheld game console  7. cosy little bed made of large green leaves  8. empty cell.
```

#### Œufs légendaires 1/2 (Licorne Aurore, Phénix Solaire, Renard Céleste, Dragon d'Ombre, Dragon de Jade, Griffon Tempête, Kraken des Abysses, Baleine Céleste)
Enregistrer sous `assets-src/planches/oeufs-legendaires-1.png`. Ordre des cases = ordre de la liste (le script s'en sert pour savoir quel œuf va à quelle créature).

```
Sheet: legendary eggs. Background #1E1B4B. Use the attached grid template.
Every egg has exactly the same size (about 60% of the cell height), standing on the cell's dot, centred.
These eggs belong to legendary creatures: each one must look precious and special, with a soft orange-gold
legendary glow hugging the shell (the glow stays inside the cell, no loose sparkles or particles).
IMPORTANT: the link with the creature must stay SUBTLE. Suggest it only through colours, material and texture.
Never draw a body part or an obvious symbol of the creature on the egg (no horn, no wing, no tail, no flame,
no tentacle, no face). No text on the image.
Cells from left to right, top row then bottom row (the names are only for me, do not write them):
1. (Licorne Aurore) a smooth pearly white egg whose shell shimmers with very soft mint, violet and pink reflections that slowly shift like a faint aurora; a fine spiral-shaped crack pattern barely visible at the top.
2. (Phénix Solaire) a warm golden-orange egg that looks hot, like a stone taken out of a fire: thin glowing red-orange veins under the shell and a soft heat shimmer around the top.
3. (Renard Céleste) a soft ivory egg with a delicate pale turquoise swirl pattern, like wisps of cold smoke painted on porcelain, and a few tiny golden dots.
4. (Dragon d'Ombre) a deep violet-black egg with a velvety matte surface, a barely visible scale texture and a few tiny golden specks like distant stars.
5. (Dragon de Jade) a polished green jade stone egg with softly carved swirling cloud motifs and a thin gold band around its middle.
6. (Griffon Tempête) a steel-blue egg marbled with fine silver veins like frozen lightning, slightly cloudy, with a cool white highlight.
7. (Kraken des Abysses) a dark ocean-blue egg with a rough, shell-like texture and small round spots that glow softly turquoise like deep-sea light.
8. (Baleine Céleste) a translucent indigo egg, like dark glass, with a tiny soft galaxy of pink and white specks floating inside.
```

#### Œufs légendaires 2/2 (Tortue-Monde)
Enregistrer sous `assets-src/planches/oeufs-legendaires-2.png`.

```
Sheet: legendary eggs. Background #1E1B4B. Use the attached grid template.
Every egg has exactly the same size (about 60% of the cell height), standing on the cell's dot, centred.
These eggs belong to legendary creatures: each one must look precious and special, with a soft orange-gold
legendary glow hugging the shell (the glow stays inside the cell, no loose sparkles or particles).
IMPORTANT: the link with the creature must stay SUBTLE. Suggest it only through colours, material and texture.
Never draw a body part or an obvious symbol of the creature on the egg (no horn, no wing, no tail, no flame,
no tentacle, no face). No text on the image.
Cells from left to right, top row then bottom row (the names are only for me, do not write them):
1. (Tortue-Monde) an earthy egg patterned like a tiny old map: soft green and sand-coloured patches separated by thin turquoise lines.
All other cells stay empty.
```

### Conversation 8 : fond blanc (joindre `gabarit-blanc.png`)

Créatures trop sombres pour le fond bleu nuit. Dans le prompt d'ouverture, remplacer « default #1E1B4B » par « default #FFFFFF ».

#### Manchot (Peu commun, marche lourde)
Enregistrer sous `assets-src/planches/manchot.png`.

```
Sheet: Manchot (Uncommon). Background #FFFFFF (use the attached white template).
Creature: an ice-floe penguin in a tuxedo. Main colours: black, white, orange.
Distinctive features kept at every stage: tuxedo pattern, orange bill, orange patch on the neck.

Top row, left to right, happy expression:
1. Baby: a grey fluffy penguin chick shaped like a tall bowling pin with tiny flippers held out. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: orange bill, white belly. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: waddling.
3. Grown: neat tuxedo, orange patch on the neck. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sliding on its belly.
4. Super: big penguin wearing a red scarf. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing tall with a red scarf.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Lumignon (Rare, voltige)
Enregistrer sous `assets-src/planches/lumignon.png`.

```
Sheet: Lumignon (Rare). Background #FFFFFF (use the attached white template).
Creature: a round firefly with a lantern tail. Main colours: light yellow, midnight blue.
Distinctive features kept at every stage: glowing lantern tail, transparent wings.

Top row, left to right, happy expression:
1. Baby: a tiny round firefly with a glowing bulb tail bigger than its head and two thin curly antennae. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: transparent wings. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hovering.
3. Grown: glowing lantern tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying.
4. Super: dazzling lantern, glittering wings. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, glittering wings spread.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Lion de Braise (Épique, marche lourde)
Enregistrer sous `assets-src/planches/lion-de-braise.png`.

```
Sheet: Lion de Braise (Epic). Background #FFFFFF (use the attached white template).
Creature: a lion whose mane is made of embers. Main colours: red, orange, charcoal.
Distinctive features kept at every stage: ember mane, glowing paw tips, charcoal fur.

Top row, left to right, happy expression:
1. Baby: a charcoal lion cub with one tall ember flame on top of its head like a candle. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: mane of small flames, glowing paw tips. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking, small flame mane.
3. Grown: blazing mane, lava cracks on the legs. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: roaring, blazing mane.
4. Super: huge fire mane, black rock chest plate. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud powerful stance, huge fire mane.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```

#### Hibou Astral (Épique, flotte)
Enregistrer sous `assets-src/planches/hibou-astral.png`.

```
Sheet: Hibou Astral (Epic). Background #FFFFFF (use the attached white template).
Creature: an owl whose feathers draw constellations. Main colours: violet, gold, navy blue.
Distinctive features kept at every stage: golden stars linked by thin golden lines.

Top row, left to right, happy expression:
1. Baby: a violet ball with a crescent-moon shaped tuft on its head and three golden stars on its belly. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: stars linked by golden lines on the belly. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, tilted.
3. Grown: constellation wings. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: wings half open.
4. Super: large wings covered in constellations, star-shaped ear tufts. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic floating pose, constellation wings spread.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
Floating creatures hover just above their dot; the soft shadow stays on the dot.
```

#### Loup de Lune (Épique, sautille)
Enregistrer sous `assets-src/planches/loup-de-lune.png`.

```
Sheet: Loup de Lune (Epic). Background #FFFFFF (use the attached white template).
Creature: a silver wolf carrying the moon on its forehead. Main colours: silver grey, midnight blue, gold.
Distinctive features kept at every stage: golden crescent moon on the forehead, midnight blue mane.

Top row, left to right, happy expression:
1. Baby: a wolf cub sitting and howling with its head raised to the sky, thin golden crescent on its forehead. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting, howling.
2. Young: clearer crescent, silver fur. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: running.
3. Grown: long fur, midnight blue mane. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, long fur.
4. Super: golden full moon on the forehead, glowing mane. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, glowing full moon on its forehead.

Camera: like the style reference, every creature is turned about 22 degrees to the left or to the right
(a light front three-quarter view): both eyes, the chest and the front legs stay clearly visible.
It may look anywhere, but never more turned than 22 degrees: no side profile, never seen from behind.

Silhouette: each of the 4 stages has a clearly different shape, and the Baby has a silhouette that no other creature
of the game shares (exaggerate its signature feature). If the creature was filled in solid black, it should still be
easy to recognise.

Bottom row: exactly the same 4 creatures, same order, same size, same pose and same position as the
cell above, but sad, each at its age: the Baby and the Young are teary and pouting; the Grown and the Super look gloomy and downcast (head low, ears or crest down, tired eyes), still proud, no crying face.
No falling tears, no extra props.

The four stages must clearly be the same creature growing up, while its personality matures: adorable baby, bold young, serious adult, badass legend. The difference between Baby and Super must be huge. Keep the worn details (bell, scarf, hat…)
drawn on the creature itself.
```
