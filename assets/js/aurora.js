(() => {
  const canvas = document.getElementById("aurora");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener("resize", resize);

  // ---------- Noise (fast value-noise) ----------
  const fract = (x) => x - Math.floor(x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  function hash2(x, y) {
    // deterministic pseudo random 0..1
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return fract(s);
  }

  function noise2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;

    const a = hash2(xi, yi);
    const b = hash2(xi + 1, yi);
    const c = hash2(xi, yi + 1);
    const d = hash2(xi + 1, yi + 1);

    const u = smooth(xf);
    const v = smooth(yf);

    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }

  function fbm(x, y) {
    // fractal brownian motion
    let val = 0;
    let amp = 0.55;
    let freq = 1.0;
    for (let i = 0; i < 5; i++) {
      val += amp * noise2(x * freq, y * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  // ---------- Aurora columns setup ----------
  const colCount = () => Math.max(70, Math.floor(w / 18));
  let columns = [];

  function regenColumns() {
    const n = colCount();
    columns = Array.from({ length: n }, (_, i) => ({
      x: (i + 0.5) / n,
      hue: 160 + Math.random() * 55,       // green->cyan
      base: 0.35 + Math.random() * 0.25,   // intensity
      width: 0.6 + Math.random() * 1.6,    // column width factor
      drift: (Math.random() - 0.5) * 0.35, // lateral wave
      phase: Math.random() * Math.PI * 2,
    }));
  }
  regenColumns();
  window.addEventListener("resize", regenColumns);

  // ---------- Render ----------
  let t = 0;

  function drawAurora() {
    t += 0.010;

    // fade background to keep motion silky (very subtle)
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(5,6,8,0.18)";
    ctx.fillRect(0, 0, w, h);

    // overall top haze
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "blur(28px)";
    const haze = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, Math.max(w, h) * 0.8);
    haze.addColorStop(0, "rgba(180,255,240,0.045)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // aurora pass
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "blur(12px)";

    const n = columns.length;
    const horizon = h * 0.18; // starts near top
    const maxHeight = h * 0.85;

    for (let i = 0; i < n; i++) {
      const c = columns[i];

      // x position with wave drift
      const wave = Math.sin(t * 0.9 + c.phase + i * 0.08) * 0.02 + c.drift * 0.01;
      const x = (c.x + wave) * w;

      // column height shaped by fbm
      const hh = horizon + fbm(c.x * 2.2, t * 0.35) * maxHeight * 0.55 + Math.sin(t + c.phase) * 28;

      // intensity mask: fbm creates “curtains”
      const mask = fbm(c.x * 3.0 + 12.0, t * 0.55) * 0.9 + 0.1;
      const alpha = (c.base * mask) * 0.22;

      const colW = (w / n) * (2.2 + c.width);

      // gradient along Y -> transparent edges, bright core
      const g = ctx.createLinearGradient(0, hh - 240, 0, hh + 240);
      g.addColorStop(0, `hsla(${c.hue}, 92%, 62%, 0)`);
      g.addColorStop(0.35, `hsla(${c.hue + 12}, 95%, 66%, ${alpha})`);
      g.addColorStop(0.55, `hsla(${c.hue - 10}, 95%, 62%, ${alpha * 0.95})`);
      g.addColorStop(0.85, `hsla(${c.hue + 18}, 95%, 68%, ${alpha * 0.50})`);
      g.addColorStop(1, `hsla(${c.hue}, 92%, 62%, 0)`);

      ctx.fillStyle = g;

      // draw “curtain” with slight waviness
      ctx.beginPath();
      const topY = hh - 260;
      const bottomY = hh + 260;

      // left edge curve
      ctx.moveTo(x - colW * 0.5, bottomY);
      for (let yy = bottomY; yy >= topY; yy -= 30) {
        const ny = yy / h;
        const flutter =
          (fbm(c.x * 6.0 + ny * 2.5, t * 0.9) - 0.5) * 18 +
          Math.sin(t * 2.0 + ny * 6.0 + c.phase) * 6;
        ctx.lineTo(x - colW * 0.5 + flutter, yy);
      }

      // right edge curve
      for (let yy = topY; yy <= bottomY; yy += 30) {
        const ny = yy / h;
        const flutter =
          (fbm(c.x * 6.0 + ny * 2.5 + 9.0, t * 0.9) - 0.5) * 18 +
          Math.cos(t * 2.0 + ny * 6.0 + c.phase) * 6;
        ctx.lineTo(x + colW * 0.5 + flutter, yy);
      }

      ctx.closePath();
      ctx.fill();

      // inner bright core stroke (gives “real” aurora depth)
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = `hsla(${c.hue + 18}, 100%, 72%, ${alpha * 0.95})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const midX = x + Math.sin(t * 1.3 + c.phase) * 8;
      ctx.moveTo(midX, bottomY);
      for (let yy = bottomY; yy >= topY; yy -= 26) {
        const ny = yy / h;
        const s = (fbm(c.x * 7.0 + ny * 2.8 + 3.3, t * 1.1) - 0.5) * 14;
        ctx.lineTo(midX + s, yy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // subtle vignette blend (keeps center readable)
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = "rgba(0,0,0,0.14)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    requestAnimationFrame(drawAurora);
  }

  // start clean
  ctx.clearRect(0, 0, w, h);
  requestAnimationFrame(drawAurora);
})();

