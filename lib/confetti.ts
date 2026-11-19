const COLORS = ['#facc15', '#f97316', '#22c55e', '#6366f1', '#ec4899', '#38bdf8'];

export function confetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = COLORS[i % COLORS.length];
    p.style.animationDelay = Math.random() * 0.7 + 's';
    p.style.animationDuration = 1.8 + Math.random() * 1.5 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4200);
}
