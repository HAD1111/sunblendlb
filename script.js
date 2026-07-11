/* =========================================================
   SUNBLEND — Vanilla JS
   Sticky nav, scroll spy, smooth scroll, mobile menu,
   reveal-on-scroll, category filter, gallery lightbox,
   back-to-top. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Footer year ---------- */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky nav on scroll ---------- */
  var nav = $("#nav");
  var lastY = window.scrollY;
  function onScrollNav() {
    if (window.scrollY > 24) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
    lastY = window.scrollY;
  }
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  /* ---------- Mobile menu ---------- */
  var toggle = $("#navToggle");
  var mobileMenu = $("#mobileMenu");
  function closeMenu() {
    toggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  function openMenu() {
    toggle.setAttribute("aria-expanded", "true");
    mobileMenu.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  toggle.addEventListener("click", function () {
    var expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? closeMenu() : openMenu();
  });
  $$("#mobileMenu a").forEach(function (a) {
    a.addEventListener("click", closeMenu);
  });

  /* ---------- Smooth scroll for in-page links ---------- */
  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = $(id);
      if (!target) return;
      e.preventDefault();
      var navHeight = nav.offsetHeight;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top: top, behavior: "smooth" });
      history.pushState(null, "", id);
    });
  });

  /* ---------- Scroll spy ---------- */
  var navLinks = $$("[data-nav]");
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = "#" + entry.target.id;
      navLinks.forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === id);
      });
    });
  }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });

  sections.forEach(function (sec) { spyObserver.observe(sec); });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$(".reveal");
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

  /* Ensure product cards and gallery items also animate in,
     without requiring the .reveal class on every generated node */
  $$(".product-card, .why-card, .masonry__item").forEach(function (el) {
    el.classList.add("reveal");
    revealObserver.observe(el);
  });

  /* ---------- Category filter ---------- */
  var pills = $$(".category-pill");
  var productCards = $$(".product-card");
  pills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      pills.forEach(function (p) {
        p.classList.remove("is-active");
        p.setAttribute("aria-selected", "false");
      });
      pill.classList.add("is-active");
      pill.setAttribute("aria-selected", "true");

      var category = pill.getAttribute("data-category");
      productCards.forEach(function (card) {
        var match = card.getAttribute("data-category") === category;
        card.hidden = !match;
        if (match) {
          card.classList.remove("is-visible");
          revealObserver.observe(card);
        }
      });
    });
  });

  /* ---------- Gallery lightbox ---------- */
  var galleryItems = $$(".masonry__item");
  var lightbox = $("#lightbox");
  var lightboxImage = $("#lightboxImage");
  var lightboxCaption = $("#lightboxCaption");
  var lightboxClose = $("#lightboxClose");
  var lightboxPrev = $("#lightboxPrev");
  var lightboxNext = $("#lightboxNext");
  var currentIndex = 0;
  var lastFocused = null;

  function showImage(index) {
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentIndex];
    lightboxImage.src = item.getAttribute("data-full");
    lightboxImage.alt = item.getAttribute("data-caption") || "";
    lightboxCaption.textContent = item.getAttribute("data-caption") || "";
  }

  function openLightbox(index) {
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  galleryItems.forEach(function (item, index) {
    item.addEventListener("click", function () { openLightbox(index); });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", function () { showImage(currentIndex - 1); });
  lightboxNext.addEventListener("click", function () { showImage(currentIndex + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  });

  /* ---------- Back to top ---------- */
  var backToTop = $("#backToTop");
  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("is-visible", window.scrollY > 700);
  }, { passive: true });
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- Subtle hero parallax ---------- */
  var heroMedia = $(".hero__image-frame");
  var heroShapes = $(".hero__shapes");
  var hero = $(".hero");
  if (hero && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      if (heroMedia) heroMedia.style.transform = "translate(" + (x * 10) + "px," + (y * 10) + "px)";
      if (heroShapes) heroShapes.style.transform = "translate(" + (x * -14) + "px," + (y * -14) + "px)";
    });
  }

  /* ---------- Sun-ring tick marks (generated to keep markup lean) ---------- */
  var ticks = document.querySelector(".sun-ring__ticks");
  if (ticks) {
    var count = 24;
    var svgNS = "http://www.w3.org/2000/svg";
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2;
      var r1 = 178, r2 = 190;
      var x1 = 200 + Math.cos(angle) * r1;
      var y1 = 200 + Math.sin(angle) * r1;
      var x2 = 200 + Math.cos(angle) * r2;
      var y2 = 200 + Math.sin(angle) * r2;
      var line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", x1.toFixed(1));
      line.setAttribute("y1", y1.toFixed(1));
      line.setAttribute("x2", x2.toFixed(1));
      line.setAttribute("y2", y2.toFixed(1));
      ticks.appendChild(line);
    }
  }
})();
