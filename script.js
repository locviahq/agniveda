
/* =========================================
   AGNIVEDA — INTERACTION ENGINE
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

  const loader = document.getElementById("loader");
  const navbar = document.getElementById("navbar");

  // PAGE LOADER
  document.body.classList.add("loading");

  window.addEventListener("load", () => {
    setTimeout(() => {
      loader?.classList.add("hide");
      document.body.classList.remove("loading");
    }, 900);
  });

  // SCROLL REVEAL
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    observer.observe(element);
  });

  // NAVBAR SCROLL EFFECT
  function updateNavbar() {
    if (!navbar) return;

    navbar.classList.toggle(
      "scrolled",
      window.scrollY > 40
    );
  }

  window.addEventListener("scroll", updateNavbar, {
    passive: true
  });

  updateNavbar();

  // SUBTLE 3D MOUSE MOVEMENT
  const hero = document.querySelector(".hero-visual");

  if (
    hero &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  ) {
    hero.addEventListener("mousemove", (event) => {
      const rect = hero.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 8;
      const rotateX = (0.5 - y) * 8;

      hero.style.setProperty("--rotate-x", `${rotateX}deg`);
      hero.style.setProperty("--rotate-y", `${rotateY}deg`);
    });

    hero.addEventListener("mouseleave", () => {
      hero.style.setProperty("--rotate-x", "0deg");
      hero.style.setProperty("--rotate-y", "0deg");
    });
  }

  // PARALLAX IMAGES
  const parallaxImages = document.querySelectorAll(
    "[data-parallax]"
  );

  let ticking = false;

  function updateParallax() {
    parallaxImages.forEach((image) => {
      const rect = image.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }

      const distance =
        (rect.top + rect.height / 2 - window.innerHeight / 2) *
        0.035;

      image.style.transform = `translate3d(0, ${distance}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // SMOOTH ANCHOR SCROLL
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(
        link.getAttribute("href")
      );

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

});
