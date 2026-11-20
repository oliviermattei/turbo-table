// Cuts the generated image sheets (assets-src/planches/*.png) into game assets (public/**.webp)
// and writes lib/pet/assets.json. See docs/assets/brief-production.md sections 3 and 8.
// Usage: pnpm assets [--force]
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SHEETS = path.join(ROOT, "assets-src/planches");
const PUBLIC = path.join(ROOT, "public");
const FORCE = process.argv.includes("--force");

const STAGES = ["bebe", "petit", "grand", "super"];
const MOODS = [...STAGES, ...STAGES.map((s) => `${s}-triste`)];
const EGGS = ["commun", "peu-commun", "rare", "epique", "coquille"];
const ITEMS = ["coffre-ferme", "coffre-ouvert", "pomme", "sandwich", "gateau", "balle", "peluche", "console", "lit"];
// Cell order of the legendary egg sheets (brief, section 10)
const LEGENDARY_EGGS = {
  // licorne-aurore now uses the prism egg of sheet 2; the old aurora pearl egg is kept aside, unused
  "oeufs-legendaires-1": ["licorne-perle", "phenix-solaire", "renard-celeste", "dragon-ombre", "dragon-jade", "griffon-tempete", "kraken-abysses", "baleine-celeste"],
  "oeufs-legendaires-2": ["tortue-monde", "licorne-aurore", "foudrelin"],
};

// Output path (relative to public/) of each of the 8 cells, null = cell ignored.
function cellTargets(kind) {
  if (kind === "oeufs")
    return [...EGGS.map((e) => `eggs/${e}.webp`), "items/coffre-ferme.webp", "items/coffre-ouvert.webp", null];
  if (kind === "objets") return [...ITEMS.slice(2).map((i) => `items/${i}.webp`), null];
  if (kind === "objets-2") return ["festin", "banquet", "manege", "fete"].map((i) => `items/${i}.webp`).concat([null, null, null, null]);
  const CHESTS = { "coffres-1": ["peu-commun", "rare"], "coffres-2": ["epique", "legendaire"] };
  if (CHESTS[kind])
    return CHESTS[kind].flatMap((q) => [`items/coffre-${q}-ferme.webp`, `items/coffre-${q}-ouvert.webp`]).concat([null, null, null, null]);
  if (LEGENDARY_EGGS[kind])
    return Array.from({ length: 8 }, (_, i) => (LEGENDARY_EGGS[kind][i] ? `creatures/${LEGENDARY_EGGS[kind][i]}/oeuf.webp` : null));
  return MOODS.map((m) => `creatures/${kind}/${m}.webp`);
}

const INSET = 7; // px kept away from a grid line centre (lines are ~5 px wide)
const D_LO = 14; // colour distance to bg below which a pixel is fully background
const D_HI = 52; // distance above which a pixel is fully subject (and stops the flood fill)
const GLOW_MAX = 0.5; // a light-over-bg pixel more transparent than this is glow: the flood fill goes through it
const MIN_PART = 0.02; // components smaller than this share of the largest one are dropped
const PAD = 4;
const MAX_H = 512;

// Finds the grid line near `guess` along one axis: the column/row with the brightest median.
function findLine(px, w, h, axis, guess) {
  let best = guess;
  let bestV = -1;
  const len = axis === "x" ? h : w;
  const max = (axis === "x" ? w : h) - 1;
  for (let c = Math.max(0, guess - 24); c <= Math.min(max, guess + 24); c++) {
    const v = new Array(len);
    for (let t = 0; t < len; t++) {
      const i = (axis === "x" ? t * w + c : c * w + t) * 3;
      v[t] = px[i] + px[i + 1] + px[i + 2];
    }
    v.sort((a, b) => a - b);
    const med = v[len >> 1];
    if (med > bestV) [bestV, best] = [med, c];
  }
  return best;
}

// Cuts one cell out of the sheet and removes its background. Returns RGBA pixels or null when empty.
function cutCell(px, sw, x0, y0, w, h, solid = false) {
  const n = w * h;
  const rgb = new Float32Array(n * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      for (let c = 0; c < 3; c++) rgb[(y * w + x) * 3 + c] = px[((y0 + y) * sw + x0 + x) * 3 + c];

  // Background colour: per-channel median of a 3 px ring on the cell border.
  const ring = [[], [], []];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (x < 3 || y < 3 || x >= w - 3 || y >= h - 3) for (let c = 0; c < 3; c++) ring[c].push(rgb[(y * w + x) * 3 + c]);
  const bg = ring.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
  const bb = bg[0] ** 2 + bg[1] ** 2 + bg[2] ** 2;
  // A pixel that is the bg colour scaled darker (vignette, drop shadow) counts as background.
  // On a light bg only light shadows: a grey or black subject must not vanish.
  const kMin = bg[0] + bg[1] + bg[2] > 384 ? 0.75 : 0;

  const dist = new Float32Array(n);
  // Light over the bg (glow, rays): "colour to alpha", the lowest alpha that un-mixes to a valid colour,
  // so a glow stays a bright glow instead of an opaque or dark halo. 2 = not lighter than bg in every channel.
  const light = new Float32Array(n).fill(2);
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2];
    if (r >= bg[0] && g >= bg[1] && b >= bg[2])
      light[i] = Math.max((r - bg[0]) / (255 - bg[0]), (g - bg[1]) / (255 - bg[1]), (b - bg[2]) / (255 - bg[2]));
    const k = Math.min(1, Math.max(kMin, (r * bg[0] + g * bg[1] + b * bg[2]) / bb));
    // Residual compared at bg brightness, so dark subject colours (brown ears) stay far from a dark shadow.
    dist[i] = Math.hypot(r - k * bg[0], g - k * bg[1], b - k * bg[2]) / Math.max(k, 0.35);
  }

  // Flood fill from the border through background-like pixels.
  const isBg = new Uint8Array(n);
  const stack = [];
  const push = (i) => {
    if (!isBg[i] && (dist[i] < D_HI || light[i] < GLOW_MAX)) {
      isBg[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    push(x);
    push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    push(y * w);
    push(y * w + w - 1);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (i >= w) push(i - w);
    if (i < n - w) push(i + w);
  }

  // Solid subjects (eggs): everything between the left and right edges of the main shape, row by row, is
  // subject. A dark egg close to the bg colour would otherwise turn half transparent.
  if (solid) {
    const lab = new Int32Array(n).fill(-1);
    let best = -1, bestSize = 0;
    for (let s = 0; s < n; s++) {
      if (isBg[s] || lab[s] >= 0) continue;
      let size = 0;
      const st = [s];
      lab[s] = s;
      while (st.length) {
        const i = st.pop();
        size++;
        const x = i % w;
        for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w])
          if (j >= 0 && j < n && !isBg[j] && lab[j] < 0) { lab[j] = s; st.push(j); }
      }
      if (size > bestSize) [best, bestSize] = [s, size];
    }
    for (let y = 0; y < h; y++) {
      let lo = -1, hi = -1;
      for (let x = 0; x < w; x++) if (lab[y * w + x] === best) { if (lo < 0) lo = x; hi = x; }
      for (let x = lo; lo >= 0 && x <= hi; x++) isBg[y * w + x] = 0;
    }
  }

  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    if (!isBg[i]) alpha[i] = 1;
    else if (dist[i] <= D_LO) alpha[i] = 0;
    else if (light[i] <= 1) alpha[i] = light[i];
    else {
      const t = Math.min(1, (dist[i] - D_LO) / (D_HI - D_LO));
      alpha[i] = t * t * (3 - 2 * t);
    }
  }
  // Anti-alias: the outermost subject pixels are a bg mix, soften them with a 3x3 box (only ever lowers alpha).
  const soft = new Float32Array(n);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && yy >= 0 && xx < w && yy < h) {
            s += alpha[yy * w + xx];
            c++;
          }
        }
      soft[y * w + x] = Math.min(alpha[y * w + x], (s / c + alpha[y * w + x]) / 2);
    }

  // Connected components (8-neighbours) of visible pixels; drop specks, grid remnants and the dot.
  const label = new Int32Array(n).fill(-1);
  const sizes = [];
  for (let s = 0; s < n; s++) {
    if (label[s] >= 0 || soft[s] <= 0.1) continue;
    const id = sizes.length;
    let size = 0;
    label[s] = id;
    stack.push(s);
    while (stack.length) {
      const i = stack.pop();
      size++;
      const x = i % w, y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx;
          if (label[j] < 0 && soft[j] > 0.1) {
            label[j] = id;
            stack.push(j);
          }
        }
    }
    sizes.push(size);
  }
  const largest = Math.max(0, ...sizes);
  if (largest < 200) return null;

  const out = Buffer.alloc(n * 4);
  let touches = false;
  for (let i = 0; i < n; i++) {
    const a = label[i] >= 0 && sizes[label[i]] >= largest * MIN_PART ? soft[i] : 0;
    if (a <= 0) continue;
    const x = i % w, y = (i - x) / w;
    if (a > 0.5 && (x < 2 || y < 2 || x >= w - 2 || y >= h - 2)) touches = true;
    // Un-mix the bg colour from semi-transparent pixels so no navy fringe shows on another bg.
    for (let c = 0; c < 3; c++)
      out[i * 4 + c] = Math.max(0, Math.min(255, Math.round((rgb[i * 3 + c] - (1 - a) * bg[c]) / a)));
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return { out, touches };
}

async function cutSheet(file, kind) {
  const { data: px, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: sw, height: sh } = info;
  const xs = [0, sw / 4, sw / 2, (sw * 3) / 4, sw - 1].map((g) => findLine(px, sw, sh, "x", Math.round(g)));
  const ys = [0, sh / 2, sh - 1].map((g) => findLine(px, sw, sh, "y", Math.round(g)));
  const targets = cellTargets(kind);
  for (let cell = 0; cell < 8; cell++) {
    const target = targets[cell];
    if (!target) continue;
    const col = cell % 4, row = cell >> 2;
    const x0 = xs[col] + INSET, y0 = ys[row] + INSET;
    const solid = /\.webp$/.test(target) && (target.startsWith("eggs/") ? !target.includes("coquille") : target.endsWith("/oeuf.webp"));
    const res = cutCell(px, sw, x0, y0, xs[col + 1] - INSET - x0, ys[row + 1] - INSET - y0, solid);
    if (!res) {
      console.warn(`  warning: ${kind} cell ${cell + 1} is empty, ${target} not written`);
      continue;
    }
    if (res.touches) console.warn(`  warning: ${kind} cell ${cell + 1} touches the cell edge (${target})`);
    const w = xs[col + 1] - INSET - x0, h = ys[row + 1] - INSET - y0;
    const trimmed = await sharp(res.out, { raw: { width: w, height: h, channels: 4 } })
      .trim({ threshold: 0 })
      .toBuffer({ resolveWithObject: true });
    let img = sharp(trimmed.data, { raw: trimmed.info }).extend({
      top: PAD, bottom: PAD, left: PAD, right: PAD, background: { r: 0, g: 0, b: 0, alpha: 0 },
    });
    if (trimmed.info.height + 2 * PAD > MAX_H) img = sharp(await img.png().toBuffer()).resize({ height: MAX_H });
    const dest = path.join(PUBLIC, target);
    await mkdir(path.dirname(dest), { recursive: true });
    await img.webp({ quality: 90, alphaQuality: 100 }).toFile(dest);
  }
}

const mtime = (f) => stat(f).then((s) => s.mtimeMs, () => 0);
const webps = (dir) => readdir(dir).then((l) => l.filter((f) => f.endsWith(".webp")).map((f) => f.slice(0, -5)), () => []);
const ordered = (names, known) =>
  names.sort((a, b) => (known.indexOf(a) + 1 || 999) - (known.indexOf(b) + 1 || 999) || a.localeCompare(b));

const sheets = (await readdir(SHEETS).catch(() => [])).filter((f) => f.endsWith(".png")).sort();
for (const f of sheets) {
  const kind = f.slice(0, -4);
  const file = path.join(SHEETS, f);
  const outs = cellTargets(kind).filter(Boolean).map((t) => path.join(PUBLIC, t));
  const sheetTime = await mtime(file);
  if (!FORCE && (await Promise.all(outs.map(mtime))).every((t) => t > sheetTime)) {
    console.log(`skipped  ${f}`);
    continue;
  }
  await cutSheet(file, kind);
  console.log(`cut      ${f}`);
}

// Manifest of what exists, rebuilt from public/ every time.
const manifest = { creatures: {}, legendaryEggs: [], eggs: [], items: [] };
const slugs = (await readdir(path.join(PUBLIC, "creatures"), { withFileTypes: true }).catch(() => []))
  .filter((d) => d.isDirectory()).map((d) => d.name).sort();
for (const slug of slugs) {
  const names = await webps(path.join(PUBLIC, "creatures", slug));
  const moods = ordered(names.filter((n) => n !== "oeuf"), MOODS);
  if (moods.length) manifest.creatures[slug] = moods;
  if (names.includes("oeuf")) manifest.legendaryEggs.push(slug);
}
manifest.eggs = ordered(await webps(path.join(PUBLIC, "eggs")), EGGS);
manifest.items = ordered(await webps(path.join(PUBLIC, "items")), ITEMS);
await mkdir(path.join(ROOT, "lib/pet"), { recursive: true });
await writeFile(path.join(ROOT, "lib/pet/assets.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`wrote    lib/pet/assets.json`);
