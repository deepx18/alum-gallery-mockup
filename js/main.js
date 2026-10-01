/* Northline — small progressive-enhancement layer.
   Everything here is optional: the page reads fine without it. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector("[data-header]");
  var nav = document.querySelector("[data-nav]");
  var navToggle = document.querySelector("[data-nav-toggle]");
  var navLinks = document.querySelectorAll("[data-nav-link]");
  var heroImg = document.querySelector("[data-parallax]");

  /* ---------- Header state + hero parallax (one scroll listener) ---------- */

  var ticking = false;
  var parallaxEnabled = !reduceMotion && window.innerWidth > 820;

  function onScrollFrame() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle("is-scrolled", y > 24);
    }
    if (parallaxEnabled && heroImg) {
      // Gentle drift only, so the image never reveals its own edges.
      var shift = Math.min(y * 0.14, 90);
      heroImg.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0) scale(1.08)";
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    parallaxEnabled = !reduceMotion && window.innerWidth > 820;
    if (!parallaxEnabled && heroImg) {
      heroImg.style.transform = "";
    }
    onScroll();
  });
  window.addEventListener("load", onScroll);
  onScroll();

  /* ---------- Mobile navigation ---------- */

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  }

  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      setMenu(!nav.classList.contains("is-open"));
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 960) setMenu(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */

  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Active section in the header nav ---------- */

  var sections = Array.prototype.map
    .call(navLinks, function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (section) {
      navObserver.observe(section);
    });
  }

  /* ---------- Footer year ---------- */

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
