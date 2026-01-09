// 🔒 SABİT BAŞLANGIÇ TARİHİ
const START_DATE = new Date("2025-08-08T00:00:00+03:00");

// DOM
const dEl = document.getElementById("cdDays");
const hEl = document.getElementById("cdHours");
const mEl = document.getElementById("cdMinutes");
const sEl = document.getElementById("cdSeconds");

function updateCounter() {
  const now = new Date();
  let diff = now - START_DATE;

  // Eğer tarih gelmediyse (gelecekse) sıfırda kalsın
  if (diff < 0) diff = 0;

  const totalSeconds = Math.floor(diff / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  dEl.textContent = days;
  hEl.textContent = String(hours).padStart(2, "0");
  mEl.textContent = String(minutes).padStart(2, "0");
  sEl.textContent = String(seconds).padStart(2, "0");
}

// İlk yüklemede ve her saniye güncelle
updateCounter();
setInterval(updateCounter, 1000);

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();

    const headerOffset = 90; // topbar yüksekliği
    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  });
});


// --------------------
// Hafif yıldız animasyonu (Canvas)
// --------------------
(() => {
  const canvas = document.getElementById("stars");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let w = 0, h = 0, dpr = 1;
  let stars = [];
  const STAR_COUNT = 120;     // yıldız sayısı (az/çok ayarlanır)
  const SPEED = 0.015;        // parıltı hızı (çok düşük)
  const DRIFT = 0.02;         // çok hafif kayma

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return; // hareket hassasiyeti olanlara kapalı

  function resize() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // yeniden ölçeklenince yıldızları tekrar üret
    stars = Array.from({ length: STAR_COUNT }, () => makeStar());
  }

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeStar() {
    return {
      x: rand(0, w),
      y: rand(0, h),
      r: rand(0.5, 1.6),          // yarıçap
      a: rand(0.08, 0.45),        // alpha (çok düşük)
      t: rand(0, Math.PI * 2),    // twinkle phase
      tw: rand(0.6, 1.6),         // twinkle frequency
      dx: rand(-DRIFT, DRIFT),
      dy: rand(-DRIFT, DRIFT),
    };
  }

  function drawStar(s) {
    // twinkle
    const twinkle = (Math.sin(s.t) + 1) / 2; // 0..1
    const alpha = s.a * (0.55 + twinkle * 0.65);

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.closePath();

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  let last = performance.now();

  function tick(now) {
    const dt = Math.min(33, now - last); // çok büyük sıçramayı engelle
    last = now;

    ctx.clearRect(0, 0, w, h);

    for (const s of stars) {
      s.t += SPEED * (dt / 16.67) * s.tw;
      s.x += s.dx * (dt / 16.67);
      s.y += s.dy * (dt / 16.67);

      // ekrandan çıkarsa karşıdan sok
      if (s.x < -10) s.x = w + 10;
      if (s.x > w + 10) s.x = -10;
      if (s.y < -10) s.y = h + 10;
      if (s.y > h + 10) s.y = -10;

      drawStar(s);
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(tick);
})();
