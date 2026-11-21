# Brief de production des planches (ChatGPT Image)

But : produire toutes les images du jeu **dans le style exact de la planche de référence**, sur des planches **toutes construites pareil**, pour qu'un script les découpe automatiquement.
Liste des images à produire : `docs/assets/inventaire.md`. Vocabulaire : `GLOSSARY.md`.

Les prompts sont en anglais : le générateur respecte mieux les contraintes de mise en page en anglais. Les explications restent en français.

---

## 1. Les images de référence

| Fichier | Rôle | Quand la joindre |
|---|---|---|
| `docs/assets/reference/planche-style.png` | la planche d'origine. **Ne plus la joindre** : son rendu peint et brillant n'est pas le style voulu (on veut un rendu anime 3D cel-shading). Elle reste un repère pour le contenu (créatures, œufs) | jamais |
| `docs/assets/reference/gabarit.png` | la **grille vide** (2 × 4 cases, fond `#1E1B4B`), avec un point par case qui marque où poser le sujet | à chaque demande sur fond bleu nuit |
| `docs/assets/reference/gabarit-blanc.png` | la même grille sur fond blanc | à chaque demande sur fond blanc |
| `docs/assets/reference/etalon.png` | la **planche étalon** : la première planche d'espèce validée, qui fixe **le style 3D cel-shading** et le gabarit (grille, tailles, fond, lumière) | à chaque demande, dès qu'elle existe |

La planche étalon se crée une seule fois : on génère la première espèce, on la refait jusqu'à ce qu'elle passe toute la check-list (section 7), puis on la copie sous `etalon.png`.

## 2. Méthode de travail dans ChatGPT

1. Ouvrir une **nouvelle conversation** et envoyer le **prompt d'ouverture** (section 4) avec les images de référence : gabarit (+ étalon dès qu'il existe).
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
I will ask you for several image sheets for a children's mobile game. Every sheet must follow
the rules below and match the attached images. Before anything else, lock in these rules for the whole conversation:

STYLE: premium stylised 3D anime video game character, cel-shaded
(if a validated example sheet is attached, copy its style exactly)
- From cute to badass: Babies are cute chibis (big round head, large anime eyes with two white
  highlights, a little blush, rounded shapes, small paws). As they grow, proportions and attitude mature:
  Grown and Super forms have adult proportions (normal-size head, strong athletic body), sharper eyes and a
  serious, powerful, heroic look, cool and badass like a shonen anime hero. Never cute, never girly once grown.
- Each creature has its own universe (given in each sheet as "Universe"), which inspires its accessories, so that
  every creature looks unique. Accessories grow with the stages: the Baby and the Young wear none (only the
  distinctive features of the sheet); the Grown gets one small accessory; the Super keeps it and adds two or three
  more, for a clear evolution in class and rank. Accessories never hide the signature feature and stay readable
  at small size. No cape, cloak or bell unless the sheet asks for it. Inspired by the universe, never a copy
  of a known character. The sad version keeps exactly the same accessories.
- The eye colour of each creature never changes between the happy and the sad rows.
- Happy faces (top row) never show tears.
- Polished 3D cel-shaded rendering, like a modern anime video game: clean, crisp surfaces, clearly defined
  voluminous shapes with clean, controlled geometry.
- Hard-edged shadows with 2 to 3 distinct shading levels, strong separation between light and shadow.
  Smooth gradients used sparingly, only for subtle highlights. Subtle ambient light for depth.
- Large expressive anime eyes and well-defined facial features.
- Minimal outlines, mostly integrated into the shading; clean, precise edges.
- Rich, saturated colours with strong contrast and a carefully controlled palette per creature.
- Stylised rim light to separate the creature from the background (thin, not a glow or halo).
- No photorealistic textures, no painterly brush strokes, no glossy plastic or vinyl toy look.
- It must look like a professionally designed 3D anime game character: NOT a realistic animal,
  NOT a traditional 2D cartoon, NOT a painterly illustration.
- Readable at small mobile screen sizes: distinctive details shown through shape and colour, not texture.
  No excessive micro-details.
- Metal, crystal and magical elements use simplified graphic reflections.
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
- Every subject keeps at least 8% empty margin inside its cell, including above the tallest one (ears, horns,
  crest, raised tail); nothing crosses into another cell.
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

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
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
Les œufs ressemblent à des **objets précieux** (pierre, cristal, jade, métal gravé), pas à des jouets ; plus l'œuf est rare, plus il est précieux.
```
Sheet: eggs and chest. Background #1E1B4B. Use the attached grid template.
EGG STYLE: precious artifact eggs, never toy-like or childish. Each egg looks heavy and valuable, like a
carved gemstone, a polished stone or a relic (stone, crystal, jade, metal), in exactly the same style as the creatures
(see the STYLE rules): hard-edged shadows, simplified graphic reflections, engraved relief patterns,
fine gold or silver inlays, a subtle inner glow. No photorealistic texture, no glossy plastic. No cartoon spots, no cute faces.
Same egg size in all four top cells (about 55% of the cell height). The rarer the egg, the more precious it looks.
Top row, left to right:
1. Common egg: smooth pale sandstone with subtle natural speckles and a thin engraved band.
2. Uncommon egg: polished moss-green jade with fine leaf patterns carved in relief.
3. Rare egg: deep sapphire-blue crystal with engraved wave lines and a cool inner glow.
4. Epic egg: faceted amethyst with gold star-shaped inlays and a purple inner glow hugging the shell (no loose sparkles).
Bottom row, left to right:
5. An empty broken eggshell in two halves lying on the ground, sandstone-coloured, sharp zigzag edges.
6. Common chest, closed: a plain, basic wooden chest of light planks, simple dark iron bands and a plain iron latch. No gem, no gold, no decoration (it is the most basic chest of the game: the rarer chests are much richer). About 40% of the cell height.
7. The same chest open, lid raised, inside glowing with soft white light, nothing inside.
8. Empty cell.
```

### Objets
```
Sheet: items. Background #1E1B4B. Each item about 40% of the cell height, same style as the creatures.
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
- [ ] Le style est celui du prompt d'ouverture (anime 3D cel-shading), sans aspect brillant ou plastique. Dès que l'étalon existe : même rendu que lui.
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
2. joindre le gabarit indiqué (+ `etalon.png` dès qu'il existe) ;
3. coller le **prompt d'ouverture** (section 4) et attendre « OK » ;
4. coller les planches une par une, en vérifiant chacune avec la check-list (section 7).

Déjà faites dans l'ancien style (peint et brillant) : toutes les planches de `assets-src/planches/`. Elles sont à refaire en style anime 3D cel-shading.

La première planche (Chaton) sert à créer l'**étalon** : la refaire jusqu'à ce qu'elle soit parfaite (surtout le style 3D cel-shading), puis la copier aussi sous `docs/assets/reference/etalon.png`.

### Conversation 1 : fond bleu nuit (joindre `gabarit.png`)

#### Chaton (Commun, sautille)
Enregistrer sous `assets-src/planches/chaton.png`.

```
Sheet: Chaton (Common). Background #1E1B4B.
Creature: a little ginger tabby kitten with a golden bell. Main colours: ginger, cream, gold.
Distinctive features kept at every stage: ginger tabby stripes, cream muzzle, golden bell on a collar.
Universe: Ancient Egypt (the cat goddess temples).
Grown accessory (Grown only, kept by the Super): a thin gold armband with lapis-lazuli inlays on one front leg.
Super accessories: a broad gold and lapis-lazuli collar (usekh) replacing the plain collar, the bell hanging from it and engraved with Egyptian patterns (no letters), gold armbands on both front legs, a small gold hoop earring, a tiny gold scarab on the forehead.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tiny ginger kitten standing up on its hind legs, batting at its golden bell, tail pointing straight up like an antenna. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing on hind legs.
2. Young: question-mark tail, small golden bell. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: crouched, ready to pounce, tail curved.
3. Grown: slender kitten, clear stripes, long whiskers. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: walking, tail in a question mark.
4. Super: big proud cat, plume-like bushy tail, large shiny golden bell. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud standing pose, huge plume tail raised behind it.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Mountain rescue dog of the Alps.
Grown accessory (Grown only, kept by the Super): a sturdy leather harness with brass buckles.
Super accessories: the harness, a coiled climbing rope on its side, a brass rescue medal, snow goggles pushed up on the head.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a beige puppy lying flat on its belly with its huge floppy ears spread wide on the floor like a mat, front paws stretched forward: a wide, low shape. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: lying on its belly.
2. Young: clumsy puppy, brown patch over one eye, red scarf. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: running, ears flying.
3. Grown: slender young dog, ears flying in the wind. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, one front paw raised, tail wagging.
4. Super: big proud dog, red scarf knotted around the neck. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, red scarf fluttering.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Japanese moon rabbit of the autumn moon festival.
Grown accessory (Grown only, kept by the Super): a silver crescent-moon hair pin between the ears.
Super accessories: the hair pin, a pearl necklace, a pink silk cord with a tassel around the chest, a small wooden mallet strapped on its back.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tall, narrow bunny sitting very upright like a little bottle, one ear straight up and the other folded down. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting very upright.
2. Young: ears standing up, pompom tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: mid-hop, both ears straight up.
3. Grown: very long ears, big hind feet. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs like a meerkat, very long ears.
4. Super: huge ears, a fluffy tuft of fur on the head. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: sitting upright, giant ears forming a crown above its head.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Country fair champion.
Grown accessory (Grown only, kept by the Super): a small straw hat.
Super accessories: the straw hat with a daisy, denim overall straps, a big blue prize rosette pinned on the chest.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a very wide oval pink piglet seen trotting, tiny legs under a big round body, round snout and corkscrew tail. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: trotting.
2. Young: corkscrew tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: rolling happily on its side.
3. Grown: chubby pig, mud spot on the cheek. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sitting on its bottom, laughing.
4. Super: big laughing pig wearing a straw hat. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing proudly, straw hat on its head.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Alpine cow parade.
Grown accessory (Grown only, kept by the Super): a single alpine flower behind one ear.
Super accessories: a crown of alpine flowers, a wide embroidered leather bell strap with edelweiss patterns holding a big golden bell.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a calf on very long, wobbly legs with knees pointing together, body small on top of tall thin legs. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing on wobbly legs.
2. Young: wobbly legs, tiny horns. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking.
3. Grown: clear spots, a small bell. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: lying down, legs folded, bell visible.
4. Super: big cow, golden bell, crown of flowers. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing proudly, flower crown and golden bell.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Swashbuckling musketeer.
Grown accessory (Grown only, kept by the Super): a wide-brimmed musketeer hat with a short feather.
Super accessories: the hat with a long white plume, a short blue musketeer tabard cape with a silver cross pattern, leather glove cuffs on the wing tips.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a duckling waddling with its tiny wings spread out sideways like an airplane. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: waddling, wings out.
2. Young: clearly visible webbed feet. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, webbed feet visible.
3. Grown: white feathers growing in among the yellow fluff. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flapping its wings.
4. Super: big white duck. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing proudly, chest out.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Chinese imperial palace and New Year.
Grown accessory (Grown only, kept by the Super): a thin gold ring on the top fin.
Super accessories: gold and jade rings on the fins, a small golden pearl circlet under the bubble crown, red silk tassels on the tail fin.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tiny droplet-shaped goldfish with a fan tail almost as big as its body. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating upright.
2. Young: round fish, fan-shaped tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming.
3. Grown: fins as long as ribbons. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling, long ribbon fins.
4. Super: veil-like fins, a small crown of bubbles on its head. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, veil fins spread, bubble crown.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Andalusian village fair.
Grown accessory (Grown only, kept by the Super): a bridle decorated with colourful pompoms.
Super accessories: the pompom bridle, a woven striped saddle blanket under the carrot saddlebags, a red flower behind one ear.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a donkey foal on four thin legs with two enormous upright ears taller than its head. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: white muzzle, blue halter. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: trotting.
3. Grown: brush-like mane. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sitting, stubborn face.
4. Super: big donkey carrying saddlebags full of carrots. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance with carrot saddlebags.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Ancient Greek philosopher.
Grown accessory (Grown only, kept by the Super): a thin gold band along the edge of the shell.
Super accessories: a golden laurel wreath, the shell edges engraved like a gold Greek frieze, a small rolled scroll tied to the shell (no letters).

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a baby tortoise tucked inside a high dome shell, only its eyes and the tips of its feet peeking out. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: tucked in its shell.
2. Young: hexagon pattern on the shell. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking slowly, head out.
3. Grown: domed shell, longer neck. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing tall, neck stretched up.
4. Super: big shell with golden edges, a lettuce leaf in its mouth. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, lettuce leaf in its mouth.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Brazilian carnival.
Grown accessory (Grown only, kept by the Super): a colourful beaded necklace.
Super accessories: the beaded necklace, golden sequin anklets, small golden rings on the head feathers, a short sequin collar.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a round green fluff ball with a big curved beak and one single long tail feather pointing straight up. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: yellow head, little wings. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping, wings half open.
3. Grown: long blue tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying, wings spread.
4. Super: fan-shaped head feathers, very long tail. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, fan of head feathers, very long tail.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Woodland ranger of the old forest.
Grown accessory (Grown only, kept by the Super): an acorn-cap helmet.
Super accessories: the acorn-cap helmet, a satchel made from a big oak leaf, a carved wooden whistle on a cord, the apple stuck on its spines.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a hedgehog rolled into a spiky ball with only its pink nose and eyes peeking out. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: rolled into a ball.
2. Young: short spines, pink snout. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: trotting, spines bouncing.
3. Grown: fan-shaped spines. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs, spines fanned out.
4. Super: big hedgehog with an apple stuck on its back. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, apple stuck on its back.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Saharan desert nomad.
Grown accessory (Grown only, kept by the Super): an indigo cloth wrapped around the neck.
Super accessories: the indigo wrap, a silver desert-cross pendant, a small engraved silver ring piercing the edge of each ear (the same on both ears), a small leather water flask.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tiny sandy fox whose two ears are each taller than its whole body, forming a big V above it. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: pointy muzzle, bushy tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: mid-hop.
3. Grown: thin legs, huge ears. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, ears turned like radars.
4. Super: big fennec fox. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, giant ears up.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Mountain ninja.
Grown accessory (Grown only, kept by the Super): a dark headband with two long trailing tails.
Super accessories: the headband, cloth wraps on the forearms, a small rolled scroll strapped on the back, a dark sash around the waist.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a red panda cub sitting under its huge ringed tail curled over its head like an umbrella. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting under its tail.
2. Young: ringed tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: climbing pose, front paws up.
3. Grown: slender, dark brown legs. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: walking along, tail held high.
4. Super: huge tail it wraps itself in. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: curled in its enormous tail like a scarf.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Aztec lake city.
Grown accessory (Grown only, kept by the Super): jade ear ornaments on the gills.
Super accessories: the jade ornaments, a turquoise mosaic pectoral on the chest, gold armlets, a small feather headpiece.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: an axolotl baby shaped like a tadpole with feathery gills spread wide around its head like a lion mane. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: feathery gills on the sides. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming.
3. Grown: longer body, bigger gills. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling.
4. Super: gills like a fuchsia crown. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, gills like a fuchsia crown.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Polynesian pearl diver.
Grown accessory (Grown only, kept by the Super): a braided kelp bracelet.
Super accessories: the kelp bracelet, a pearl necklace, a flower lei, the seashell held tight.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: an otter pup floating flat on its back, belly up, holding a pebble on its chest: a long horizontal shape. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating on its back.
2. Young: whiskers, holding a pebble in its paws. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming upright, whiskers out.
3. Grown: long flat tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs, long flat tail.
4. Super: floating on its back, holding a seashell tight on its belly. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: floating on its back hugging a seashell.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Wizard school.
Grown accessory (Grown only, kept by the Super): small round spectacles.
Super accessories: the spectacles, a tiny pointed wizard hat with stars, a leather satchel full of scrolls.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a round owlet shaped like an egg with two pointed ear tufts and enormous eyes. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: perched upright.
2. Young: ear tufts on the head. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping, wings half open.
3. Grown: striped wings. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying, striped wings spread.
4. Super: large open wings, feathery ear tufts. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, wings fully open.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Outback explorer.
Grown accessory (Grown only, kept by the Super): a wide-brim leather bush hat.
Super accessories: the bush hat with a feather, a small leather canteen on a strap, a khaki vest with pockets, the eucalyptus branch.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a koala joey hugging a vertical eucalyptus stick with its arms and legs, big fluffy ears. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: hugging a stick.
2. Young: big fluffy ears. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: sitting, big ears.
3. Grown: big black nose, soft claws. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: climbing pose.
4. Super: chubby koala hugging a eucalyptus leaf. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: chubby koala hugging a big eucalyptus branch.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Atlantis royal guard.
Grown accessory (Grown only, kept by the Super): a small coral shoulder plate.
Super accessories: light armour of coral and pearl plates, a small trident-shaped jewel on the crest.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tiny seahorse shaped like a comma, tail curled into a tight spiral. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating upright.
2. Young: curled tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming.
3. Grown: coral back crest. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling.
4. Super: fan-shaped crest, spiral tail. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, fan crest spread.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Sheet: Toucan (Uncommon). Background #FFFFFF (use the attached white template).
Creature: a jungle bird with a rainbow beak. Main colours: black, orange, yellow.
Distinctive features kept at every stage: huge colourful beak, black body.
Universe: Caribbean pirate.
Grown accessory (Grown only, kept by the Super): a big gold hoop earring.
Super accessories: the earring, a red bandana on the head, a leather belt with a brass buckle across the chest, a small rolled treasure map tucked under one wing.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a small black ball dominated by a huge orange beak, bigger than its head. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: growing orange beak. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping.
3. Grown: yellow-orange-green beak. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying.
4. Super: huge shiny beak, red tail feathers. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, huge shiny beak, red tail feathers.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Baroque palace fountain.
Grown accessory (Grown only, kept by the Super): a tiny gold leaf ornament on the top of the head.
Super accessories: thin gold leaf ornaments on the body like a baroque fountain, the crown of golden water splashes, the glowing gem core.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tiny blue jelly droplet with big eyes and a single bubble stuck on top of its head like a hat. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: a round jelly ball that has grown two little nub arms and a curly jelly antenna ending in a glowing bubble. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: wiggling.
3. Grown: a taller jelly creature standing on two stubby jelly legs, with small pointed jelly ears, a splash-shaped crest on its head and tiny glowing fish and stars suspended inside its translucent belly. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: bouncy pose, leaning to one side.
4. Super: a majestic jelly guardian shaped like a living fountain: layered translucent body, a crown of frozen golden water splashes, a glowing gem core in its chest. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, standing tall.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Forest alchemist.
Grown accessory (Grown only, kept by the Super): a small potion bottle on a cord.
Super accessories: a belt of small glass potion bottles, a leaf apron, a little wooden staff topped by a glowing mushroom.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a mushroom button: a wide domed cap on a tiny stem, two eyes peeking from under the cap. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: dotted cap, little feet. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping.
3. Grown: wider cap with a leaf on top. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: dancing, one foot up.
4. Super: big cap with glowing dots. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, giant glowing cap.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Arabian Nights.
Grown accessory (Grown only, kept by the Super): a golden crescent ear cuff.
Super accessories: the ear cuff, a small embroidered tasselled carpet on its back like a mini flying carpet, thin gold anklets.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a little cloud puff with two cat ears on top and a curly wisp tail. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: swirl-shaped tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, tilted.
3. Grown: cloud body, pink cheeks. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: stretching like a cat in the air.
4. Super: big cloud cat with a mini rainbow on its back. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic floating pose, mini rainbow on its back.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Indian maharaja palace.
Grown accessory (Grown only, kept by the Super): a pearl string around the water lily.
Super accessories: the pearl string, gold and ruby jewellery, a small embroidered vest, jewelled anklets.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tadpole with a long wiggly tail and a closed flower bud on its head. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: frog with a closed flower. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: jumping, legs stretched.
3. Grown: half-open flower. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sitting, half-open flower.
4. Super: fully bloomed water lily worn like a hat. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud pose, water lily hat in full bloom.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Wild West sheriff.
Grown accessory (Grown only, kept by the Super): a golden sheriff star.
Super accessories: the sheriff star, a cowboy hat with the big yellow flower growing through it, a leather belt with a big buckle, a coiled lasso.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a small round cactus in a clay pot with two tiny stubby arms raised up. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing in its pot.
2. Young: growing arms. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: wiggling.
3. Grown: taller, soft spines. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: arms wide open.
4. Super: big yellow flower on its head. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing tall, big yellow flower on top.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Belle Epoque ballerina.
Grown accessory (Grown only, kept by the Super): a single strand of pearls on the bell.
Super accessories: strands of pearls on the bell, an opal tiara, pearl drops at the tips of the longest tentacles.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a small lilac bell with three short tentacles hanging below, like a little lamp. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: three little tentacles. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: swimming upward.
3. Grown: wavy glowing tentacles. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: twirling, wavy tentacles.
4. Super: a dress of glowing tentacles. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, dress of glowing tentacles.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Dwarf miners of the deep mountain.
Grown accessory (Grown only, kept by the Super): a brass miner's lamp on the head.
Super accessories: the lamp, iron bands with rivets around the shell, a small pickaxe strapped on the shell.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a flat pebble with only two eyes and four tiny feet peeking out underneath. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: resting.
2. Young: head and legs poking out. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking, head out.
3. Grown: mossy shell. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing tall, mossy shell.
4. Super: shell bristling with violet crystals. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, crystal spikes on its shell.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Norse warriors of the frozen north.
Grown accessory (Grown only, kept by the Super): a silver arm ring with knot patterns.
Super accessories: the arm rings, a thick twisted silver torc around the neck, a frost-blue cape fastened by silver brooches on the shoulders.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a round white bear cub with a pointed ice crystal standing up on its forehead. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: frost plates on the shoulders. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking on all fours.
3. Grown: ice shoulder pads, crystal claws. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing on its hind legs, ice shoulder pads.
4. Super: full ice armour, crown of frozen spikes. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance in full ice armour.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Elven forest kingdom.
Grown accessory (Grown only, kept by the Super): a silver filigree leaf circlet.
Super accessories: the circlet, small crystal pendants hanging from the antlers, silver leaf-shaped guards on the hooves.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a fawn on long thin legs with two small crystal points, standing alert, big ears. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: two-branch crystal antlers. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: leaping.
3. Grown: faceted antlers reflecting the light. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, head turned.
4. Super: huge prismatic antlers, crystal hooves. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, huge prismatic antlers.

Camera: every creature is turned about 22 degrees to the left or to the right
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

#### Licorne Arc-en-ciel (Légendaire, flotte)
Enregistrer sous `assets-src/planches/licorne-aurore.png` (le slug reste `licorne-aurore`).

```
Sheet: Licorne Arc-en-ciel (Legendary). Background #1E1B4B.
Creature: a white unicorn in pearly armour with a full rainbow mane and tail. Main colours: pearly white, and the six rainbow colours (red, orange, yellow, green, blue, violet) in clear bands.
Distinctive features kept at every stage: rainbow mane and tail with clearly separated colour bands, spiral horn, pearly armour.
Universe: Celestial paladin.
Grown accessory (Grown only, kept by the Super): fine gold filigree on the pearly armour.
Super accessories: the filigree armour, a small star-shaped jewel on the chest, a long white and gold paladin cape.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a chubby filly floating with its legs tucked under it, a mini spiral horn and a short wavy rainbow mane. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating, legs tucked.
2. Young: wavy rainbow mane and tail. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, galloping in the air.
3. Grown: glowing spiral horn, pearly chest plate. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: rearing up.
4. Super: immense flowing rainbow mane and tail, crystal horn, pearly armour. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic floating pose, immense rainbow mane.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Flames: real living flames rise from its body at every stage, more and bigger as it grows: small flickering flames on the Baby's crest and wing tips; on the Grown, flames along the wings and the tail; on the Super, blazing flames all along its wings, tail and crest, as if its whole body were on fire (bright flames, no smoke, no loose sparks).
Universe: Inca sun empire.
Grown accessory (Grown only, kept by the Super): a small gold sun pendant.
Super accessories: a big gold sun-disc pectoral, golden plates on the wings, a gold feather headpiece.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a golden chick with a big torch-like flame crest on its head and stubby wings. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: flame feathers. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hopping, wings half open.
3. Grown: long fire tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying, fire tail.
4. Super: sun wings spread wide, crown of flames, fan-shaped tail. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, sun wings spread.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Japanese shrine guardian (kitsune legends).
Grown accessory (Grown only, kept by the Super): a braided rope necklace with white paper zigzag streamers.
Super accessories: the rope necklace with small golden bells, vermilion lacquered ornaments, a small white fox mask worn on the side of the head.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a white fox cub curled around its single huge fluffy tail with a turquoise tip. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: curled around its tail.
2. Young: three tails with turquoise tips. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: mid-hop, three tails.
3. Grown: six tails, golden marks on the forehead. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, six tails fanned.
4. Super: nine tails fanned out like cold flames, golden marks. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, nine tails in a fan.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Sheet: eggs and chest. Background #1E1B4B. Use the attached grid template.
EGG STYLE: precious artifact eggs, never toy-like or childish. Each egg looks heavy and valuable, like a
carved gemstone, a polished stone or a relic (stone, crystal, jade, metal), in exactly the same style as the creatures
(see the STYLE rules): hard-edged shadows, simplified graphic reflections, engraved relief patterns,
fine gold or silver inlays, a subtle inner glow. No photorealistic texture, no glossy plastic. No cartoon spots, no cute faces.
Same egg size in all four top cells (about 55% of the cell height). The rarer the egg, the more precious it looks.
Top row, left to right:
1. Common egg: smooth pale sandstone with subtle natural speckles and a thin engraved band.
2. Uncommon egg: polished moss-green jade with fine leaf patterns carved in relief.
3. Rare egg: deep sapphire-blue crystal with engraved wave lines and a cool inner glow.
4. Epic egg: faceted amethyst with gold star-shaped inlays and a purple inner glow hugging the shell (no loose sparkles).
Bottom row, left to right:
5. An empty broken eggshell in two halves lying on the ground, sandstone-coloured, sharp zigzag edges.
6. Common chest, closed: a plain, basic wooden chest of light planks, simple dark iron bands and a plain iron latch. No gem, no gold, no decoration (it is the most basic chest of the game: the rarer chests are much richer). About 40% of the cell height.
7. The same chest open, lid raised, inside glowing with soft white light, nothing inside.
8. Empty cell.
```

#### Coffres spéciaux 1/2 (peu commun et rare)
Enregistrer sous `assets-src/planches/coffres-1.png`.

```
Sheet: special chests (uncommon and rare). Background #1E1B4B. Use the attached grid template.
CHEST LADDER (the five chests of the game, from basic to magnificent; each step is clearly richer and a bit bigger than the one before):
- Common: a plain, basic wooden chest of light planks, simple dark iron bands and a plain iron latch. No gem, no gold, no decoration. About 40% of the cell height.
- Uncommon: sturdier green-stained wood, bronze corners and bands, a small green jade stone in a simple lock, a few carved leaves. About 43%.
- Rare: deep blue lacquered wood with a domed lid, silver fittings engraved with waves, a sapphire set in the lock. About 46%.
- Epic: violet lacquered chest covered with ornate silver filigree, several amethysts, a star-shaped lock, a faint purple glow hugging it. About 50%.
- Legendary: magnificent gold and ivory chest, gold scrollwork everywhere, carved lion-paw feet, a big orange sun gem in the lock surrounded by smaller gems, a crown-like crest on the lid, a soft golden glow hugging it. The most precious object of the game. About 55%.
Draw only the chests listed below, in exactly the same style, each standing on its cell's dot.
Top row, left to right:
1. Uncommon chest, closed.
2. The same uncommon chest open, lid raised, inside glowing with soft green light, nothing inside.
3. Rare chest, closed.
4. The same rare chest open, lid raised, inside glowing with cool blue light, nothing inside.
Bottom row: all four cells stay empty.
No loose sparkles or particles, no letters or letter-like symbols, nothing crosses into another cell.
```

#### Coffres spéciaux 2/2 (épique et légendaire)
Enregistrer sous `assets-src/planches/coffres-2.png`.

```
Sheet: special chests (epic and legendary). Background #1E1B4B. Use the attached grid template.
CHEST LADDER (the five chests of the game, from basic to magnificent; each step is clearly richer and a bit bigger than the one before):
- Common: a plain, basic wooden chest of light planks, simple dark iron bands and a plain iron latch. No gem, no gold, no decoration. About 40% of the cell height.
- Uncommon: sturdier green-stained wood, bronze corners and bands, a small green jade stone in a simple lock, a few carved leaves. About 43%.
- Rare: deep blue lacquered wood with a domed lid, silver fittings engraved with waves, a sapphire set in the lock. About 46%.
- Epic: violet lacquered chest covered with ornate silver filigree, several amethysts, a star-shaped lock, a faint purple glow hugging it. About 50%.
- Legendary: magnificent gold and ivory chest, gold scrollwork everywhere, carved lion-paw feet, a big orange sun gem in the lock surrounded by smaller gems, a crown-like crest on the lid, a soft golden glow hugging it. The most precious object of the game. About 55%.
Draw only the chests listed below, in exactly the same style, each standing on its cell's dot.
Top row, left to right:
1. Epic chest, closed.
2. The same epic chest open, lid raised, inside glowing with purple light, nothing inside.
3. Legendary chest, closed.
4. The same legendary chest open, lid raised, inside glowing with warm golden light, nothing inside.
Bottom row: all four cells stay empty.
No loose sparkles or particles, no letters or letter-like symbols, nothing crosses into another cell.
```

#### Gros objets (Festin, Banquet, Manège, Fête foraine)
Enregistrer sous `assets-src/planches/objets-2.png`.

```
Sheet: big items. Background #1E1B4B. Use the attached grid template. Same anime style as the other items.
Each item about 45% of the cell height, standing on the cell's dot.
Top row, left to right:
1. A big feast platter: roasted drumsticks, bread and fruits on a wooden board.
2. A royal banquet: a golden tray piled with a cake, roast, fruits and a glass of juice, generous and festive.
3. A small colourful merry-go-round toy with horses, bright and joyful.
4. A fairground set: a little Ferris wheel with lights and a striped tent.
Bottom row: all four cells stay empty.
```

#### Objets
Enregistrer sous `assets-src/planches/objets.png`.

```
Sheet: items. Background #1E1B4B. Each item about 40% of the cell height, same style as the creatures.
Top row: 1. shiny red apple  2. sandwich  3. small birthday cake with one candle  4. blue and white ball.
Bottom row: 5. teddy bear plush  6. round colourful handheld game console  7. cosy little bed made of large green leaves  8. empty cell.
```

#### Œufs légendaires 1/2 (ancien œuf Licorne, non utilisé, Phénix Solaire, Renard Céleste, Dragon d'Ombre, Dragon de Jade, Griffon Tempête, Kraken des Abysses, Baleine Céleste)
Enregistrer sous `assets-src/planches/oeufs-legendaires-1.png`. Ordre des cases = ordre de la liste (le script s'en sert pour savoir quel œuf va à quelle créature).

```
Sheet: legendary eggs. Background #1E1B4B. Use the attached grid template.
Every egg has exactly the same size (about 60% of the cell height), standing on the cell's dot, centred.
EGG STYLE: precious artifact eggs, never toy-like or childish. Each egg looks heavy and valuable, like a
carved gemstone, a polished stone or a relic (stone, crystal, jade, metal), in exactly the same style as the creatures
(see the STYLE rules): hard-edged shadows, simplified graphic reflections, engraved relief patterns,
fine gold or silver inlays, a subtle inner glow. No photorealistic texture, no glossy plastic. No cartoon spots, no cute faces.
These eggs belong to legendary creatures: the most precious of all, true treasures, with a soft orange-gold
legendary glow hugging the shell (the glow stays inside the cell, no loose sparkles or particles).
IMPORTANT: the link with the creature must stay SUBTLE. Suggest it only through colours, material and texture.
Never draw a body part or an obvious symbol of the creature on the egg (no horn, no wing, no tail, no flame,
no tentacle, no face). No text on the image.
Cells from left to right, top row then bottom row (the names are only for me, do not write them):
1. (old unicorn egg, unused: the unicorn now uses the prism egg of sheet 2) a smooth pearly white egg whose shell shimmers with very soft mint, violet and pink reflections that slowly shift like a faint aurora; a fine spiral-shaped crack pattern barely visible at the top.
2. (Phénix Solaire) a warm golden-orange egg that looks hot, like a stone taken out of a fire: thin glowing red-orange veins under the shell and a soft heat shimmer around the top.
3. (Renard Céleste) a soft ivory egg with a delicate pale turquoise swirl pattern, like wisps of cold smoke painted on porcelain, and a few tiny golden dots.
4. (Dragon d'Ombre) a deep violet-black egg with a velvety matte surface, a barely visible scale texture and a few tiny golden specks like distant stars.
5. (Dragon de Jade) a polished green jade stone egg with softly carved swirling cloud motifs and a thin gold band around its middle.
6. (Griffon Tempête) a steel-blue egg marbled with fine silver veins like frozen lightning, slightly cloudy, with a cool white highlight.
7. (Kraken des Abysses) a dark ocean-blue egg with a rough, shell-like texture and small round spots that glow softly turquoise like deep-sea light.
8. (Baleine Céleste) a translucent indigo egg, like dark glass, with a tiny soft galaxy of pink and white specks floating inside.
```

#### Œufs légendaires 2/2 (Tortue-Monde, Licorne Arc-en-ciel, Foudrelin)
Enregistrer sous `assets-src/planches/oeufs-legendaires-2.png`. Ordre des cases = ordre de la liste.

```
Sheet: legendary eggs. Background #1E1B4B. Use the attached grid template.
Every egg has exactly the same size (about 60% of the cell height), standing on the cell's dot, centred.
EGG STYLE: precious artifact eggs, never toy-like or childish. Each egg looks heavy and valuable, like a
carved gemstone, a polished stone or a relic (stone, crystal, jade, metal), in exactly the same style as the creatures
(see the STYLE rules): hard-edged shadows, simplified graphic reflections, engraved relief patterns,
fine gold or silver inlays, a subtle inner glow. No photorealistic texture, no glossy plastic. No cartoon spots, no cute faces.
These eggs belong to legendary creatures: the most precious of all, true treasures, with a soft orange-gold
legendary glow hugging the shell (the glow stays inside the cell, no loose sparkles or particles).
IMPORTANT: the link with the creature must stay SUBTLE. Suggest it only through colours, material and texture.
Never draw a body part or an obvious symbol of the creature on the egg (no horn, no wing, no tail, no flame,
no tentacle, no face). No text on the image.
Cells from left to right, top row then bottom row (the names are only for me, do not write them):
1. (Tortue-Monde) an earthy egg patterned like a tiny old map: soft green and sand-coloured patches separated by thin turquoise lines.
2. (Licorne Arc-en-ciel) a clear crystal egg cut like a prism, with fine silver filigree; light passing through it splits into a very faint rainbow inside the crystal.
3. (Foudrelin (créature électrique originale)) a bright golden-yellow topaz egg with fine crackling white-blue lightning veins under the surface and a thin copper band, as if charged with electricity.
All other cells stay empty.
```

#### Icônes du menu
Enregistrer sous `assets-src/planches/icones.png` (découpées en `public/ui/<nom>.webp` : nid, bestiaire, boutique, badges, diplomes, historique, refuge, piece).

```
Sheet: game menu icons. Background #1E1B4B. Use the attached grid template.
Same 3D cel-shaded style as the creatures and objects of the game. These are menu icons for a children's mobile game:
bold, simple, chunky shapes, instantly readable at a very small size (32 px), one object per cell, light front three-quarter view,
no text, no letters, no numbers, no characters, no faces. Each icon about 60% of the cell height, standing on the cell's dot,
all icons the same visual size.
Top row, left to right:
1. Nest: a cosy round nest of twigs holding one speckled egg.
2. Bestiary: a thick open storybook with a big paw print on the page.
3. Shop: a small market stall with a striped orange and white awning.
4. Badges: a round gold medal with a star, hanging from a blue and red ribbon.
Bottom row, left to right:
5. Diplomas: a rolled paper diploma tied with a red ribbon, leaning on a black graduation cap.
6. History: an hourglass with a golden frame and blue sand.
7. Shelter: a small cosy wooden cottage with a red roof and a round door.
8. Coin: a thick shiny gold coin with a star engraved in the middle.
No loose sparkles or particles, nothing crosses into another cell.
```

#### Icônes d'interface 2/2
Enregistrer sous `assets-src/planches/icones-2.png` (découpées en `public/ui/<nom>.webp` : faim, joie, energie, etoile, chrono, cadenas, cadeau, jouer).

```
Sheet: small interface icons. Background #1E1B4B. Use the attached grid template.
Same 3D cel-shaded style as the creatures and objects of the game. Interface icons for a children's mobile game: bold, simple,
chunky shapes, instantly readable at a very small size (24 px), one object per cell, light front three-quarter view,
no text, no letters, no numbers, no characters, no faces. Each icon about 55% of the cell height, standing on the cell's dot,
all icons the same visual size.
Top row, left to right:
1. Hunger: a juicy roasted drumstick.
2. Joy: a red and yellow bouncy ball with a small heart on it.
3. Energy: a golden crescent moon with a small sleeping cap.
4. Star: a plump shiny golden star.
Bottom row, left to right:
5. Timer: a round red stopwatch.
6. Lock: a golden padlock, closed.
7. Gift: a small gift box with a red ribbon and a bow.
8. Play: a big round green play button with a white triangle.
No loose sparkles or particles, nothing crosses into another cell.
```

#### Décors de fond (un par écran)
Pas de gabarit : format portrait 9:16, joindre seulement `etalon.png`. Enregistrer chaque image sous `assets-src/decors/<nom>.png` ; `pnpm assets` les redimensionne en `public/bg/<nom>.webp` (choix du décor par écran : `Decor` dans `components/ui.tsx`).

Début commun du prompt :

```
Vertical background illustration for a children's mobile game screen (portrait 9:16). Same 3D cel-shaded anime game style as image 1 (hard-edged shadows, clean shapes, rich but controlled colours), but NO creature, NO character, NO animal, NO text, NO letters, NO user interface.
It is a backdrop that buttons and white text will sit on: keep it calm and readable. Dark, deep night-blue and violet overall mood that matches a #1E1B4B interface. The top third and the middle are quiet and simple (sky, soft light, few details); the interesting details are on the left and right edges and at the very bottom. Soft depth of field on the background elements. No strong contrast in the centre, no bright white areas.
Scene: <scène>
```

- `accueil` : a magical hill at dusk above a cosy village of little round houses with warm lit windows, a starry violet sky, floating glowing fireflies, tall grass and flowers framing the bottom corners.
- `jeu` : a very simple, calm starry night sky with a soft violet and teal aurora and a few distant floating islands at the bottom edge. Minimal detail: the player must concentrate on calculations.
- `nid` : a cosy hollow inside a giant old tree at night, a big soft nest of twigs and feathers at the very bottom, warm lantern light, little glowing mushrooms and hanging moss on the sides.
- `boutique` : inside a cosy little magic market shop at night: wooden shelves with jars, fruits and toys on the left and right edges, a striped awning at the top edge, warm lantern light, a wooden counter at the very bottom.
- `bestiaire` : a magical old library at night: tall wooden bookshelves on the left and right edges, floating glowing pages, a big round window with the moon at the top, a soft rug at the bottom.
- `refuge` : a peaceful meadow sanctuary at night with small wooden pet houses, a little pond with lily pads and a wooden fence along the bottom, gentle fireflies, soft moonlight.

### Conversation 8 : fond blanc (joindre `gabarit-blanc.png`)

Créatures trop sombres pour le fond bleu nuit. Dans le prompt d'ouverture, remplacer « default #1E1B4B » par « default #FFFFFF ».

#### Manchot (Peu commun, marche lourde)
Enregistrer sous `assets-src/planches/manchot.png`.

```
Sheet: Manchot (Uncommon). Background #FFFFFF (use the attached white template).
Creature: an ice-floe penguin in a tuxedo. Main colours: black, white, orange.
Distinctive features kept at every stage: tuxedo pattern, orange bill, orange patch on the neck.
Universe: Polar expedition explorer.
Grown accessory (Grown only, kept by the Super): aviator goggles pushed up on the head.
Super accessories: the goggles, a fur-trimmed collar, a brass telescope strapped across the chest.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a grey fluffy penguin chick shaped like a tall bowling pin with tiny flippers held out. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: standing.
2. Young: orange bill, white belly. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: waddling.
3. Grown: neat tuxedo, orange patch on the neck. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: sliding on its belly.
4. Super: big elegant penguin. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: standing tall, chest out.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Creature: a round firefly (a real firefly beetle, NOT a bee: no fuzzy body, no yellow and black stripes, no stinger) with a glowing lantern belly. Main colours: like a real firefly: dark brown-black body and wing covers with thin cream-yellow edges, a red-orange head shield, a glowing yellow-green lantern.
Distinctive features kept at every stage: hard dark wing covers that open over transparent wings, red-orange head shield, glowing yellow-green lantern at the end of the belly, two thin antennae.
Universe: Summer night meadow from fairy tales (the lantern bearer of warm June nights).
Grown accessory (Grown only, kept by the Super): a dewdrop pendant hanging from a grass-stem cord.
Super accessories: the dewdrop pendant, a small crown of tiny glowing bellflower buds, light shoulder guards made of curled leaves.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a tiny round firefly with a glowing bulb tail bigger than its head and two thin curly antennae. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: transparent wings. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: hovering.
3. Grown: glowing lantern tail. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: flying.
4. Super: dazzling lantern, glittering wings. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic pose, glittering wings spread.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Volcano forge king.
Grown accessory (Grown only, kept by the Super): an iron arm band with a molten seam.
Super accessories: the iron arm bands, the black obsidian chest plate with glowing lava seams, an obsidian crown.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a charcoal lion cub with one tall ember flame on top of its head like a candle. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting.
2. Young: mane of small flames, glowing paw tips. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: walking, small flame mane.
3. Grown: blazing mane, lava cracks on the legs. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: roaring, blazing mane.
4. Super: huge fire mane, black rock chest plate. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud powerful stance, huge fire mane.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Cosmic voyager.
Grown accessory (Grown only, kept by the Super): a brass astrolabe pendant.
Super accessories: the astrolabe, a ring of tiny planets attached around its head like a crown, star-shaped gold clasps on the wings.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a violet ball with a crescent-moon shaped tuft on its head and three golden stars on its belly. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: floating.
2. Young: stars linked by golden lines on the belly. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: floating, tilted.
3. Grown: constellation wings. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: wings half open.
4. Super: large wings covered in constellations, star-shaped ear tufts. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: majestic floating pose, constellation wings spread.

Camera: every creature is turned about 22 degrees to the left or to the right
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
Universe: Moon temple guardian.
Grown accessory (Grown only, kept by the Super): a moonstone collar.
Super accessories: the moonstone collar, silver crescent-shaped shoulder plates, silver anklets.

Top row, left to right, in a good mood (the Baby happy and smiling, the Grown and the Super confident and proud):
1. Baby: a wolf cub sitting and howling with its head raised to the sky, thin golden crescent on its forehead. Tiny, about 35% of the cell height, chibi proportions (huge head, huge round eyes), adorable. Pose: sitting, howling.
2. Young: clearer crescent, silver fur. About 55% of the cell height, still cute but bolder and more lively, head a bit smaller compared to the body. Pose: running.
3. Grown: long fur, midnight blue mane. About 72% of the cell height, a confident young adult: athletic body, longer limbs, smaller head, sharper eyes, serious and determined look. Cool, no longer cute. Pose: standing, long fur.
4. Super: golden full moon on the forehead, glowing mane. About 88% of the cell height, the badass final form: powerful, heroic and majestic like a game boss, adult proportions (normal-size head, strong body), intense focused eyes, proud and fearsome look. Never cute or girly, but no gore or horror (it is for an 8-year-old). Pose: proud stance, glowing full moon on its forehead.

Camera: every creature is turned about 22 degrees to the left or to the right
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
