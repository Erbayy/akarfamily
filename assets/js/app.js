(() => {
  // === Ayarlar ===
  // Buraya başlangıç / hedef tarihini gir:
  // Örn: "2025-08-08T00:00:00+03:00"
  const TARGET_ISO = "2025-08-08T00:00:00+03:00";

  // Geçmiş tarihse ne yazsın?
  const MODE_PAST_LABEL = "Birlikte geçen süre";
  // Gelecek tarihse ne yazsın?
  const MODE_FUTURE_LABEL = "Kalan süre";

  // === Elemanlar ===
  const label = document.getElementById("targetLabel");
  const $d = document.getElementById("cdDays");
  const $h = document.getElementById("cdHours");
  const $m = document.getElementById("cdMins");
  const $s = document.getElementById("cdSecs");

  function pad(n) { return String(n).padStart(2, "0"); }

  // Güvenli date parse (Safari için)
  function parseISO(iso) {
    const dt = new Date(iso);
    if (!Number.isNaN(dt.getTime())) return dt;

    // Fallback: "YYYY-MM-DDTHH:mm:ss+03:00" -> "YYYY/MM/DD HH:mm:ss"
    // (çok nadir gerekir ama garanti)
    const cleaned = iso
      .replace(/-/g, "/")
      .replace("T", " ")
      .replace(/(\+\d{2}):(\d{2})$/, " GMT$1$2");
    return new Date(cleaned);
  }

  const target = parseISO(TARGET_ISO);

  // Üstte tarih yazısı (8 Ağustos 2025 gibi)
  if (label && !Number.isNaN(target.getTime())) {
    const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
    label.textContent = `${target.getDate()} ${months[target.getMonth()]} ${target.getFullYear()}`;
  }

  function tick() {
    if (!$d || !$h || !$m || !$s) return;
    if (Number.isNaN(target.getTime())) return;

    const now = new Date();
    let diff = target.getTime() - now.getTime();

    // Eğer tarih geçmişse: geçen süreyi göster
    const isPast = diff < 0;
    const abs = Math.abs(diff);

    const totalSeconds = Math.floor(abs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    $d.textContent = String(days);
    $h.textContent = pad(hours);
    $m.textContent = pad(mins);
    $s.textContent = pad(secs);

    // İstersen label'a mod yazdır (opsiyon)
    // label zaten tarih gösteriyor; küçük bir açıklama eklemek istersen:
    const hint = document.querySelector(".card__hint .tiny");
    if (hint) {
      hint.textContent = isPast ? MODE_PAST_LABEL : MODE_FUTURE_LABEL;
    }
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
