// --------------------
// Ayarlar
// --------------------
const START_DATE = new Date("2025-08-08T00:00:00+03:00");  // başlangıç tarihi
const TARGET_DATE = new Date("2025-08-08T00:00:00+03:00"); // geri sayım hedefi (ister değiştir)

// Metin
document.getElementById("targetDateText").textContent = formatTRDate(TARGET_DATE);

// --------------------
// Geri sayım
// --------------------
const elDays = document.getElementById("cdDays");
const elHours = document.getElementById("cdHours");
const elMinutes = document.getElementById("cdMinutes");
const elSeconds = document.getElementById("cdSeconds");

function tickCountdown() {
  const now = new Date();
  let diff = TARGET_DATE.getTime() - now.getTime();

  if (diff <= 0) {
    // bitti
    setTiles(0, 0, 0, 0);
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  setTiles(days, hours, minutes, seconds);
}

function setTiles(d, h, m, s) {
  elDays.textContent = pad2(d);
  elHours.textContent = pad2(h);
  elMinutes.textContent = pad2(m);
  elSeconds.textContent = pad2(s);
}

setInterval(tickCountdown, 1000);
tickCountdown();

// --------------------
// Birlikte olduğumuz süre (count-up)
// --------------------
const togetherText = document.getElementById("togetherText");

function tickTogether() {
  const now = new Date();
  let diff = now.getTime() - START_DATE.getTime();
  if (diff < 0) diff = 0;

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  togetherText.textContent = `${days} gün ${hours} saat ${minutes} dakika`;
}

setInterval(tickTogether, 15 * 1000);
tickTogether();

// --------------------
// Menü aktif link (scrollspy basit)
// --------------------
const links = Array.from(document.querySelectorAll(".nav__link"));
const sections = links.map(a => document.querySelector(a.getAttribute("href")));

window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  let idx = 0;

  sections.forEach((sec, i) => {
    if (sec && sec.offsetTop <= y) idx = i;
  });

  links.forEach(l => l.classList.remove("is-active"));
  links[idx]?.classList.add("is-active");
});

// --------------------
// Kalp butonu küçük efekt
// --------------------
document.getElementById("heartBtn").addEventListener("click", () => {
  popHeart();
});

function popHeart(){
  const heart = document.createElement("div");
  heart.textContent = "♥";
  heart.style.position = "fixed";
  heart.style.left = "50%";
  heart.style.top = "50%";
  heart.style.transform = "translate(-50%,-50%)";
  heart.style.fontSize = "32px";
  heart.style.color = "rgba(255, 210, 170, .95)";
  heart.style.textShadow = "0 18px 40px rgba(0,0,0,.55)";
  heart.style.pointerEvents = "none";
  heart.style.zIndex = "9999";
  document.body.appendChild(heart);

  heart.animate(
    [
      { opacity: 0, transform: "translate(-50%,-50%) scale(.8)" },
      { opacity: 1, transform: "translate(-50%,-70%) scale(1)" },
      { opacity: 0, transform: "translate(-50%,-110%) scale(1.1)" }
    ],
    { duration: 900, easing: "ease-out" }
  ).onfinish = () => heart.remove();
}

// --------------------
// Helpers
// --------------------
function pad2(n){
  return String(n).padStart(2, "0");
}

function formatTRDate(date){
  const months = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
  const d = date.getDate();
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}
