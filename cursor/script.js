const head = document.getElementById('dragon-head');
 
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');
 
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);
 
const N = 24;
const points = Array.from({ length: N }, () => ({
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
}));
 
let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
 
function setPointer(x, y) {
  pointer.x = x;
  pointer.y = y;
}
 
window.addEventListener('mousemove', (e) => setPointer(e.clientX, e.clientY));
 
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) setPointer(t.clientX, t.clientY);
}, { passive: true });
 
window.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  if (t) setPointer(t.clientX, t.clientY);
}, { passive: true });
 
// blue flame palette: white-cyan core -> electric blue -> deep indigo
const flameStops = [
  { stop: 0.0, color: [230, 250, 255] },
  { stop: 0.35, color: [90, 200, 255] },
  { stop: 0.7, color: [40, 110, 240] },
  { stop: 1.0, color: [15, 25, 90] }
];
 
function flameColor(t, alpha) {
  t = Math.min(Math.max(t, 0), 1);
  for (let i = 0; i < flameStops.length - 1; i++) {
    const a = flameStops[i];
    const b = flameStops[i + 1];
    if (t >= a.stop && t <= b.stop) {
      const localT = (t - a.stop) / (b.stop - a.stop);
      const r = a.color[0] + (b.color[0] - a.color[0]) * localT;
      const g = a.color[1] + (b.color[1] - a.color[1]) * localT;
      const bch = a.color[2] + (b.color[2] - a.color[2]) * localT;
      return `rgba(${r | 0}, ${g | 0}, ${bch | 0}, ${alpha})`;
    }
  }
  return `rgba(15, 25, 90, ${alpha})`;
}
 
function animate(time) {
  points[0].x += (pointer.x - points[0].x) * 0.35;
  points[0].y += (pointer.y - points[0].y) * 0.35;
 
  for (let i = 1; i < N; i++) {
    const ease = Math.max(0.3 - i * 0.006, 0.09);
    points[i].x += (points[i - 1].x - points[i].x) * ease;
    points[i].y += (points[i - 1].y - points[i].y) * ease;
  }
 
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
 
  // --- large blurred fin flares near the head (indices 1-6), mimicking the
  //     billowing wing-shaped glow in the reference image ---
  for (let i = 1; i < 7; i++) {
    const p = points[i];
    const t = i / N;
    const radius = 34 * (1 - t * 2.2) + 10;
    if (radius <= 0) continue;
    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    grad.addColorStop(0, flameColor(0.15, 0.22));
    grad.addColorStop(1, flameColor(0.5, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
 
  // --- thin dashed spine through the mid-section ---
  ctx.setLineDash([5, 6]);
  ctx.strokeStyle = flameColor(0.4, 0.7);
  ctx.lineWidth = 2;
  ctx.shadowColor = flameColor(0.3, 0.8);
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(points[1].x, points[1].y);
  for (let i = 2; i < N - 6; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;
 
  // --- glowing comet-like orb dots trailing toward the tail ---
  const orbIndices = [N - 8, N - 6, N - 4, N - 2];
  orbIndices.forEach((idx, k) => {
    const p = points[idx];
    if (!p) return;
    const t = k / orbIndices.length;
    const r = 8 * (1 - t) + 2.5;
    ctx.beginPath();
    ctx.fillStyle = flameColor(0.55 + t * 0.3, 0.9 - t * 0.3);
    ctx.shadowColor = flameColor(0.4, 1);
    ctx.shadowBlur = 16 * (1 - t) + 4;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
 
  head.style.left = points[0].x + 'px';
  head.style.top = points[0].y + 'px';
 
  const angle = Math.atan2(points[0].y - points[1].y, points[0].x - points[1].x) * (180 / Math.PI);
  head.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
 
  requestAnimationFrame(animate);
}
 
requestAnimationFrame(animate);