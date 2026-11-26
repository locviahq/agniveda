
document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================
     1. PAGE LOADER
  ========================================== */

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


  /* ==========================================
     2. NAVBAR SCROLL EFFECT
  ========================================== */

  const navbar = document.getElementById("navbar");

  function updateNavbar() {
    if (!navbar) return;

    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }

  window.addEventListener("scroll", updateNavbar, {
    passive: true
  });

  updateNavbar();


  /* ==========================================
     3. MOBILE MENU
  ========================================== */

  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  function closeMenu() {
    if (!menuButton || !navLinks) return;

    navLinks.classList.remove("menu-open");
    menuButton.classList.remove("active");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open menu");
  }

  if (menuButton && navLinks) {

    menuButton.addEventListener("click", () => {

      const isOpen = navLinks.classList.toggle("menu-open");

      menuButton.classList.toggle("active", isOpen);

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Close menu" : "Open menu"
      );

    });


    navLinks.querySelectorAll("a").forEach((link) => {

      link.addEventListener("click", closeMenu);

    });


    document.addEventListener("click", (event) => {

      const clickedInsideMenu = navLinks.contains(event.target);
      const clickedButton = menuButton.contains(event.target);

      if (!clickedInsideMenu && !clickedButton) {
        closeMenu();
      }

    });


    window.addEventListener("resize", () => {

      if (window.innerWidth > 650) {
        closeMenu();
      }

    });

  }


  /* ==========================================
     4. SCROLL REVEAL ANIMATIONS
  ========================================== */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

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

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach((element) => {
      element.classList.add("visible");
    });

  }


  /* ==========================================
     5. HERO IMAGE MOUSE DEPTH EFFECT
  ========================================== */

  const hero = document.querySelector(".hero");
  const heroImage = document.querySelector(".hero-bg-image");

  const supportsMouse = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (hero && heroImage && supportsMouse) {

    hero.addEventListener("mousemove", (event) => {

      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const moveX = (x - 0.5) * 10;
      const moveY = (y - 0.5) * 10;

      heroImage.style.transform =
        `scale(1.04) translate(${moveX}px, ${moveY}px)`;

    });


    hero.addEventListener("mouseleave", () => {

      heroImage.style.transform = "scale(1)";

    });

  }


  /* ==========================================
     6. SMOOTH ANCHOR SCROLLING
  ========================================== */

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


  /* ==========================================
     7. AUTOMATIC FOOTER YEAR
  ========================================== */

  const yearElement = document.getElementById("current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }


  /* ==========================================
     8. PAGE READY
  ========================================== */

  document.documentElement.classList.add("js-ready");

});
