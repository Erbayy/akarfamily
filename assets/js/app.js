(() => {
  // ✅ Başlangıç tarihi (birlikte geçen süre buradan hesaplanacak)
  // TR saatine sabitlemek için +03:00 kullandım
  const START_ISO = "2025-08-08T00:00:00+03:00";

  // Üstte görünen tarih label'ı
  const label = document.getElementById("targetLabel");

  const $d = document.getElementById("cdDays");
  const $h = document.getElementById("cdHours");
  const $m = document.getElementById("cdMins");
  const $s = document.getElementById("cdSecs");

  function pad(n) { return String(n).padStart(2, "0"); }

  // Safari dahil güvenli parse
  function parseISO(iso) {
    const dt = new Date(iso);
    if (!Number.isNaN(dt.getTime())) return dt;

    const cleaned = iso
      .replace(/-/g, "/")
      .replace("T", " ")
      .replace(/(\+\d{2}):(\d{2})$/, " GMT$1$2");
    return new Date(cleaned);
  }

  const start = parseISO(START_ISO);

  // Label: "8 Ağustos 2025"
  if (label && !Number.isNaN(start.getTime())) {
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    label.textContent = `${start.getDate()} ${months[start.getMonth()]} ${start.getFullYear()}`;
  }

  function tick() {
    if (!$d || !$h || !$m || !$s) return;
    if (Number.isNaN(start.getTime())) return;

    const now = new Date();
    let diff = now.getTime() - start.getTime(); // ✅ geçen süre

    if (diff < 0) diff = 0; // başlangıç gelecekteyse 0

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    $d.textContent = String(days);
    $h.textContent = pad(hours);
    $m.textContent = pad(mins);
    $s.textContent = pad(secs);

    // Alttaki küçük yazıyı “Birlikte geçen süre” yap
    const hint = document.querySelector(".card__hint .tiny");
    if (hint) hint.textContent = "Birlikte geçen süre";
  }

  tick();
  setInterval(tick, 1000);

  // === Galeri Lightbox ===
  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  if (gallery && lightbox && lightboxImg) {
    gallery.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-src]");
      if (!btn) return;

      const src = btn.getAttribute("data-src");
      if (!src) return;

      lightboxImg.src = src;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    });

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.src = "";
    };

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    lightboxClose?.addEventListener("click", close);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }
})();
