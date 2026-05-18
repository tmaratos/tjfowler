const menuToggle = document.querySelector(".menu-toggle");

const nav = document.querySelector("#nav");

if (menuToggle && nav) {

  menuToggle.addEventListener("click", () => {

    nav.classList.toggle("open");

    const isExpanded =
      menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute(
      "aria-expanded",
      !isExpanded
    );

  });

}

document.querySelectorAll(".nav a").forEach((link) => {

  link.addEventListener("click", () => {

    if (window.innerWidth <= 900 && nav && menuToggle) {

      nav.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });

});

const slides = document.querySelectorAll(".slide");

const prevSlide =
  document.querySelector(".prev-slide");

const nextSlide =
  document.querySelector(".next-slide");

let currentSlide = 0;

function showSlide(index) {

  if (!slides.length) return;

  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  currentSlide =
    (index + slides.length) % slides.length;

  slides[currentSlide].classList.add("active");

}

if (prevSlide) {

  prevSlide.addEventListener("click", () => {

    showSlide(currentSlide - 1);

  });

}

if (nextSlide) {

  nextSlide.addEventListener("click", () => {

    showSlide(currentSlide + 1);

  });

}

if (slides.length) {

  setInterval(() => {

    showSlide(currentSlide + 1);

  }, 5000);

}

showSlide(0);
