let on = true;
let ac: AudioContext | null = null;

export const setSoundOn = (b: boolean) => { on = b; };

/** Must be called from a user gesture (browsers block audio otherwise). */
export function ensureAudio() {
  try {
    if (!ac) ac = new AudioContext();
    if (ac.state === 'suspended') void ac.resume();
  } catch { ac = null; }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (!on || !ac) return;
  try {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    const t = ac.currentTime + start;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t); o.stop(t + dur);
  } catch { /* audio is a bonus, never block the game */ }
}

export const sGood = () => { tone(880, 0, 0.12); tone(1320, 0.08, 0.15); };
export const sBad = () => tone(220, 0, 0.3, 'square', 0.08);
export const sTick = () => tone(660, 0, 0.1, 'triangle');
export const sGo = () => tone(1046, 0, 0.3, 'triangle');
export const sEnd = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.25, 'triangle'));
export const sFanfare = () => [523, 523, 659, 784, 659, 784, 1046].forEach((f, i) => tone(f, 0.6 + i * 0.13, 0.3, 'triangle', 0.18));
