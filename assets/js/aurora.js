(() => {
  const canvas = document.getElementById("aurora");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0;
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

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
  window.addEventListener("resize", () => { resize(); init(); });

  // ---------- Fast noise ----------
  const fract = (x) => x - Math.floor(x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  function hash2(x, y) {
    return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
  }

  function noise2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = hash2(xi, yi);
    const b = hash2(xi + 1, yi);
    const c = hash2(xi, yi + 1);
    const d = hash2(xi + 1, yi + 1);
    const u = smooth(xf), v = smooth(yf);
    return lerp(lerp(a, b, u), lerp(c, d, u), v);
  }

  function fbm(x, y) {
    let v = 0, a = 0.55, f = 1.0;
    for (let i = 0; i < 5; i++) {
      v += a * noise2(x * f, y * f);
      f *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  // ---------- Curtains ----------
  let curtains = [];
  function init() {
    const count = Math.max(90, Math.floor(w / 14)); // daha sık = daha gerçekçi
    curtains = Array.from({ length: count }, (_, i) => {
      const x = (i + 0.5) / count;
      // Renk dağılımı: soldan sağa hafif değişsin
      const hueBase = 150 + x * 70; // 150..220 (green->blue)
      return {
        x,
        hue: hueBase + (Math.random() * 14 - 7),
        amp: 18 + Math.random() * 28,
        width: 1.2 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
        lift: 0.14 + Math.random() * 0.18, // üstteki başlangıç yüksekliği
      };
    });
  }
  init();

  let t = 0;

  function draw() {
    t += 0.010;

    // Hafif fade — motion trail (ipek gibi)
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(5,6,8,0.16)";
    ctx.fillRect(0, 0, w, h);

    // Üst haze + genel ambience
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "blur(30px)";
    const haze = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, Math.max(w, h) * 0.9);
    haze.addColorStop(0, "rgba(170,255,235,0.050)");
    haze.addColorStop(0.55, "rgba(120,170,255,0.020)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Aurora curtains
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.filter = "blur(14px)";

    const count = curtains.length;
    const baseW = w / count;

    for (let i = 0; i < count; i++) {
      const c = curtains[i];
      const x = c.x * w;

      // Perde yüksekliği: fbm ile "bulut" gibi dalgalansın
      const topY = h * c.lift + fbm(c.x * 2.2, t * 0.25) * h * 0.12;
      const midY = h * (0.40 + fbm(c.x * 2.8 + 10, t * 0.35) * 0.20);
      const bottomY = h * (0.88 + fbm(c.x * 3.1 + 20, t * 0.25) * 0.06);

      // Şiddet maskesi: perde perde görünsün
      const mask = fbm(c.x * 6.0 + 2.0, t * 0.75);
      const intensity = (0.12 + mask * 0.22);

      // Dikey gradient (mockup'a yakın: yeşil-cyan-mor dokunuş)
      const g = ctx.createLinearGradient(0, topY, 0, bottomY);
      g.addColorStop(0.0, `hsla(${c.hue}, 92%, 62%, 0)`);
      g.addColorStop(0.25, `hsla(${c.hue + 8}, 95%, 66%, ${intensity * 0.65})`);
      g.addColorStop(0.55, `hsla(${c.hue + 22}, 95%, 70%, ${intensity})`);
      g.addColorStop(0.78, `hsla(${c.hue + 55}, 95%, 68%, ${intensity * 0.85})`); // mor/pembe hissi
      g.addColorStop(1.0, `hsla(${c.hue + 70}, 92%, 60%, 0)`);

      ctx.fillStyle = g;

      const curtainW = baseW * (2.0 + c.width);

      // Perde kenarlarına flutter (titreme)
      ctx.beginPath();
      const step = 26;

      // Sol kenar
      ctx.moveTo(x - curtainW * 0.5, bottomY);
      for (let y = bottomY; y >= topY; y -= step) {
        const ny = y / h;
        const flutter =
          (fbm(c.x * 10 + ny * 2.6, t * 1.15) - 0.5) * c.amp +
          Math.sin(t * 2.2 + ny * 7.0 + c.phase) * (c.amp * 0.25);
        ctx.lineTo(x - curtainW * 0.5 + flutter, y);
      }

      // Sağ kenar
      for (let y = topY; y <= bottomY; y += step) {
        const ny = y / h;
        const flutter =
          (fbm(c.x * 10 + ny * 2.6 + 9.3, t * 1.15) - 0.5) * c.amp +
          Math.cos(t * 2.2 + ny * 7.0 + c.phase) * (c.amp * 0.25);
        ctx.lineTo(x + curtainW * 0.5 + flutter, y);
      }

      ctx.closePath();
      ctx.fill();

      // İç parlak çekirdek çizgisi (gerçekçilik)
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = `hsla(${c.hue + 18}, 100%, 75%, ${intensity})`;
      ctx.lineWidth = 1.1;

      ctx.beginPath();
      const coreX = x + Math.sin(t * 1.1 + c.phase) * 8;
      ctx.moveTo(coreX, bottomY);
      for (let y = bottomY; y >= topY; y -= 22) {
        const ny = y / h;
        const sway = (fbm(c.x * 12 + ny * 3.2 + 4.1, t * 1.25) - 0.5) * (c.amp * 0.7);
        ctx.lineTo(coreX + sway, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // Alt glow (mockup'taki “zemin parlaması”)
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = "blur(40px)";
    const glow = ctx.createRadialGradient(w * 0.5, h * 0.92, 0, w * 0.5, h * 0.92, Math.max(w, h) * 0.75);
    glow.addColorStop(0, "rgba(160,255,230,0.065)");
    glow.addColorStop(0.35, "rgba(140,160,255,0.045)");
    glow.addColorStop(0.7, "rgba(190,120,255,0.030)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    requestAnimationFrame(draw);
  }

  // Başlangıç
  ctx.clearRect(0, 0, w, h);
  requestAnimationFrame(draw);
})();
