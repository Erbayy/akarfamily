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
