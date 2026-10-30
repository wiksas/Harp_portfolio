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

// Gallery lightbox. Without JS the links simply open the full-size image.
const lightbox = document.querySelector(".lightbox");
const lightboxImg = lightbox.querySelector("img");
document.querySelector(".gallery__track").addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  e.preventDefault();
  lightboxImg.src = link.href;
  lightboxImg.alt = link.querySelector("img").alt;
  lightbox.showModal();
});
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});
lightbox.addEventListener("close", () => lightboxImg.removeAttribute("src"));

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
