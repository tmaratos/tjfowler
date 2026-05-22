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

function initHeroSlider() {
  const slider = document.querySelector(".hero-slider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  const prevSlide = slider.querySelector(".prev-slide");
  const nextSlide = slider.querySelector(".next-slide");
  if (!slides.length) return;

  if (slider.dataset.sliderInit === "1") return;
  slider.dataset.sliderInit = "1";

  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
  }

  if (prevSlide) {
    prevSlide.addEventListener("click", () => showSlide(currentSlide - 1));
  }

  if (nextSlide) {
    nextSlide.addEventListener("click", () => showSlide(currentSlide + 1));
  }

  if (slides.length > 1) {
    setInterval(() => showSlide(currentSlide + 1), 5000);
  }

  showSlide(0);
}

window.initHeroSlider = initHeroSlider;

const cmsMain = document.querySelector("main[data-cms-page]");
if (!cmsMain) {
  initHeroSlider();
}

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

  img.addEventListener("load", sync);
  img.addEventListener("error", () => {
    img.dataset.fallback = "1";
    img.removeAttribute("src");
    sync();
  });

  sync();
});
