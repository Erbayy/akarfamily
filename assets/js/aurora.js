(() => {
  const canvas = document.getElementById("aurora");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const resize = () => {
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);

  const rand = (a, b) => a + Math.random() * (b - a);

  // Aurora "bands"
  const bands = Array.from({ length: 5 }, (_, i) => ({
    baseY: rand(h * 0.18, h * 0.62),
    amp: rand(22, 60),
    speed: rand(0.18, 0.45) * (i % 2 ? 1 : -1),
    width: rand(220, 520),
    hue: rand(150, 205),     // green/cyan
    alpha: rand(0.08, 0.18),
    phase: rand(0, Math.PI * 2),
  }));

  let t = 0;

  function drawBand(b) {
    const y0 = b.baseY + Math.sin(t * 0.6 + b.phase) * 18;
    const grad = ctx.createLinearGradient(0, y0 - b.width, 0, y0 + b.width);

    // Multiple stops to mimic aurora depth
    grad.addColorStop(0, `hsla(${b.hue}, 85%, 55%, 0)`);
    grad.addColorStop(0.35, `hsla(${b.hue + 10}, 90%, 62%, ${b.alpha})`);
    grad.addColorStop(0.55, `hsla(${b.hue - 8}, 90%, 60%, ${b.alpha * 0.9})`);
    grad.addColorStop(0.8, `hsla(${b.hue + 25}, 90%, 65%, ${b.alpha * 0.55})`);
    grad.addColorStop(1, `hsla(${b.hue}, 85%, 55%, 0)`);

    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(-80, h + 80);

    // Wave curve across screen
    const step = 48;
    for (let x = -80; x <= w + 80; x += step) {
      const nx = x / w;
      const wave =
        Math.sin((nx * 6.0) + t * b.speed + b.phase) * b.amp +
        Math.sin((nx * 14.0) + t * (b.speed * 1.6) + b.phase) * (b.amp * 0.35);

      const yy = y0 + wave;
      ctx.lineTo(x, yy);
    }

    ctx.lineTo(w + 80, h + 80);
    ctx.closePath();
    ctx.fill();
  }

  function frame() {
    t += 0.010;

    // Clear with slight fade to create silky motion
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(5,6,8,0.22)";
    ctx.fillRect(0, 0, w, h);

    // Soft blur feel
    ctx.filter = "blur(18px)";
    ctx.globalCompositeOperation = "lighter";

    for (const b of bands) drawBand(b);

    // Add subtle top haze
    ctx.filter = "blur(26px)";
    ctx.globalCompositeOperation = "screen";
    const haze = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, Math.max(w, h) * 0.65);
    haze.addColorStop(0, "rgba(255,255,255,0.035)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);

    ctx.filter = "none";
    requestAnimationFrame(frame);
  }

  // Start with transparent canvas
  ctx.clearRect(0, 0, w, h);
  requestAnimationFrame(frame);
})();
