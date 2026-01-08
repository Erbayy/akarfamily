(() => {
  // 1) Sayaç hedef tarih (burayı değiştir)
  // Örnek: 2025-10-29T00:00:00 (TR saatine göre)
  const TARGET_ISO = "2025-10-29T00:00:00+03:00";
  const target = new Date(TARGET_ISO);

  const label = document.getElementById("targetLabel");
  if (label && !Number.isNaN(target.getTime())) {
    // Basit TR format
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    label.textContent = `${target.getDate()} ${months[target.getMonth()]} ${target.getFullYear()}`;
  }

  const $d = document.getElementById("cdDays");
  const $h = document.getElementById("cdHours");
  const $m = document.getElementById("cdMins");
  const $s = document.getElementById("cdSecs");

  function pad(n){ return String(n).padStart(2, "0"); }

  function tick() {
    if (!$d || !$h || !$m || !$s) return;

    const now = new Date();
    let diff = target.getTime() - now.getTime();

    if (Number.isNaN(diff)) return;

    if (diff < 0) diff = 0;

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    $d.textContent = String(days);
    $h.textContent = pad(hours);
    $m.textContent = pad(mins);
    $s.textContent = pad(secs);
  }

  tick();
  setInterval(tick, 1000);

  // 2) Galeri Lightbox
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
