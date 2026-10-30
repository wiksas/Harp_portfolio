// --app-h is first set inline in <head>. Re-measure only when the width changes
// (rotation, desktop resize) – NOT when mobile/in-app browser toolbars collapse,
// which only change the height and would otherwise make the page jump.
let lastWidth = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === lastWidth) return;
  lastWidth = innerWidth;
  document.documentElement.style.setProperty("--app-h", `${innerHeight}px`);
});

// All animations are pure CSS (scroll-driven). This file only adds behaviour.

// Mobile menu (popover): close after choosing a section.
const nav = document.getElementById("site-nav");
nav.addEventListener("click", (e) => {
  if (e.target.closest("a") && nav.matches(":popover-open")) nav.hidePopover();
});

// Videos: clean poster with a play button; native controls appear once playing.
// Without JS the <video> elements keep their native controls.
const videos = document.querySelectorAll(".video-card video");
videos.forEach((v) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "video-play";
  btn.setAttribute("aria-label", `Odtwórz: ${v.closest("figure").querySelector("figcaption").textContent.trim()}`);
  btn.addEventListener("click", () => {
    v.controls = true;
    btn.hidden = true;
    v.play();
  });
  v.controls = false;
  v.after(btn);
  // Only one video plays at a time.
  v.addEventListener("play", () => videos.forEach((o) => o !== v && o.pause()));
});

// Gallery lightbox with prev/next (buttons, ← →, swipe).
// Without JS the links simply open the full-size image.
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");
const counter = lightbox.querySelector(".lightbox__counter");
const galleryLinks = [...document.querySelectorAll(".gallery__track a")];
const calm = matchMedia("(prefers-reduced-motion: reduce)");
let current = 0;

const show = (i) => {
  current = (i + galleryLinks.length) % galleryLinks.length;
  const link = galleryLinks[current];
  lightboxImg.src = link.href;
  lightboxImg.alt = link.querySelector("img").alt;
  counter.textContent = `${current + 1} / ${galleryLinks.length}`;
  if (!calm.matches) lightboxImg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
};

galleryLinks.forEach((link, i) =>
  link.addEventListener("click", (e) => {
    e.preventDefault();
    show(i);
    lightbox.showModal();
  })
);
lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
lightbox.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});
let touchX = null;
let swiped = false;
lightbox.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") touchX = e.clientX; });
lightbox.addEventListener("pointerup", (e) => {
  if (touchX === null) return;
  const dx = e.clientX - touchX;
  touchX = null;
  swiped = Math.abs(dx) > 50;
  if (swiped) show(current + (dx < 0 ? 1 : -1));
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox && !swiped) lightbox.close();
  swiped = false;
});
lightbox.addEventListener("close", () => lightboxImg.removeAttribute("src"));

// Carousels on phones (videos, repertoire): ‹ › buttons step one card,
// and are disabled at either end.
document.querySelectorAll(".carousel-nav").forEach((nav) => {
  const track = document.getElementById(nav.dataset.track);
  const [prev, next] = nav.querySelectorAll(".carousel-nav__btn");
  const step = () => track.firstElementChild.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 0);
  const go = (dir) => track.scrollBy({ left: dir * step(), behavior: calm.matches ? "auto" : "smooth" });
  prev.addEventListener("click", () => go(-1));
  next.addEventListener("click", () => go(1));
  const sync = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  track.addEventListener("scroll", sync, { passive: true });
  addEventListener("resize", sync);
  sync();
});

// Polish typography: keep single-letter words (w, z, i, a, o, u) with the next word.
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode: (n) => (n.parentElement.closest("script, style, textarea") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
});
const orphan = /(^|[\s\u00a0(„])([aiouwzAIOUWZ]) (?=\S)/g;
for (let n = walker.nextNode(); n; n = walker.nextNode()) {
  if (orphan.test(n.data)) n.data = n.data.replace(orphan, "$1$2\u00a0").replace(orphan, "$1$2\u00a0");
  orphan.lastIndex = 0;
}

// Date field: no past dates; "Wybierz datę" placeholder while empty.
const dateInput = document.getElementById("f-date");
const today = new Date();
dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const syncDate = () => dateInput.toggleAttribute("data-empty", !dateInput.value);
dateInput.addEventListener("input", syncDate);
dateInput.addEventListener("change", syncDate);

// Contact form: send via FormSubmit AJAX endpoint and stay on the page.
// Without JS the form posts normally to the same service.
const form = document.querySelector(".contact-form");
const status = form.querySelector(".form-status");
const submit = form.querySelector('button[type="submit"]');
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  submit.disabled = true;
  status.dataset.state = "";
  status.textContent = "Wysyłanie…";
  try {
    const res = await fetch(form.action.replace("formsubmit.co/", "formsubmit.co/ajax/"), {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.statusText);
    form.reset();
    syncDate();
    status.dataset.state = "ok";
    status.textContent = "Dziękuję! Wiadomość została wysłana – odezwę się najszybciej, jak to możliwe.";
  } catch {
    status.dataset.state = "error";
    status.textContent = "Nie udało się wysłać wiadomości. Zadzwoń lub napisz na marrywithharp@gmail.com.";
  } finally {
    submit.disabled = false;
  }
});

document.querySelector("[data-year]").textContent = new Date().getFullYear();
