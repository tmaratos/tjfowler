const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  });
}

document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 900 && nav && menuToggle) {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

let heroSliderTimer = null;

function initHeroSlider(force) {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  if (force) {
    delete slider.dataset.sliderInit;
    if (heroSliderTimer) {
      clearInterval(heroSliderTimer);
      heroSliderTimer = null;
    }
  }

  if (slider.dataset.sliderInit === "1") return;
  slider.dataset.sliderInit = "1";

  const slides = slider.querySelectorAll(".slide");
  const prevSlide = slider.querySelector(".prev-slide");
  const nextSlide = slider.querySelector(".next-slide");
  if (!slides.length) return;

  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
  }

  if (prevSlide) {
    prevSlide.onclick = () => showSlide(currentSlide - 1);
  }

  if (nextSlide) {
    nextSlide.onclick = () => showSlide(currentSlide + 1);
  }

  if (slides.length > 1) {
    heroSliderTimer = setInterval(() => showSlide(currentSlide + 1), 5000);
  }

  showSlide(0);
}

window.initHeroSlider = initHeroSlider;

function initStaffPhotoFallback() {
  document.querySelectorAll(".staff-card__media").forEach((media) => {
    const img = media.querySelector(".staff-card__photo");
    if (!img) return;

    const sync = () => {
      const src = (img.getAttribute("src") || "").trim();
      const loaded =
        src && img.complete && img.naturalWidth > 0 && !img.dataset.fallback;
      media.classList.toggle("staff-card__media--has-photo", loaded);
      media.classList.toggle("staff-card__media--no-photo", !loaded);
    };

    img.onload = sync;
    img.onerror = () => {
      img.dataset.fallback = "1";
      img.removeAttribute("src");
      sync();
    };

    sync();
  });
}

window.initStaffPhotoFallback = initStaffPhotoFallback;

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initStaffPhotoFallback();
});
