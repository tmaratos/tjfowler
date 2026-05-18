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

    if (window.innerWidth <= 900) {

      nav.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });

});

const contactForm =
  document.querySelector(".contact-form");

if (contactForm) {

  contactForm.addEventListener("submit", (event) => {

    event.preventDefault();

    alert(
      "Form submission backend not connected yet."
    );

  });

}
