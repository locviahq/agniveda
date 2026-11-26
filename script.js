
document.addEventListener("DOMContentLoaded", () => {

  /* =================================
     PAGE LOADER
  ================================= */

  const loader = document.getElementById("loader");

  document.body.classList.add("loading");

  function hideLoader() {
    setTimeout(() => {
      loader?.classList.add("hide");
      document.body.classList.remove("loading");
    }, 700);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
  }


  /* =================================
     NAVBAR SCROLL EFFECT
  ================================= */

  const navbar = document.getElementById("navbar");

  function updateNavbar() {
    if (!navbar) return;

    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }

  window.addEventListener("scroll", updateNavbar, {
    passive: true
  });

  updateNavbar();


  /* =================================
     MOBILE MENU
  ================================= */

  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (menuButton && navLinks) {

    menuButton.addEventListener("click", () => {

      const isOpen = navLinks.classList.toggle("menu-open");

      menuButton.classList.toggle("active", isOpen);

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

    });

    navLinks.querySelectorAll("a").forEach((link) => {

      link.addEventListener("click", () => {

        navLinks.classList.remove("menu-open");
        menuButton.classList.remove("active");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Open menu");

      });

    });

  }


  /* =================================
     SCROLL REVEAL
  ================================= */

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("visible");

          observer.unobserve(entry.target);

        }

      });

    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });


  /* =================================
     HERO MOUSE MOVEMENT
  ================================= */

  const hero = document.querySelector(".hero");

  if (
    hero &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {

    hero.addEventListener("mousemove", (event) => {

      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const moveX = (x - 0.5) * 12;
      const moveY = (y - 0.5) * 12;

      const image = hero.querySelector(".hero-bg-image");

      if (image) {
        image.style.transform =
          `scale(1.04) translate(${moveX}px, ${moveY}px)`;
      }

    });

    hero.addEventListener("mouseleave", () => {

      const image = hero.querySelector(".hero-bg-image");

      if (image) {
        image.style.transform = "scale(1)";
      }

    });

  }


  /* =================================
     SMOOTH ANCHOR SCROLLING
  ================================= */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {

    link.addEventListener("click", (event) => {

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

    });

  });


});
