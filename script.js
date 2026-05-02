/* =========================================================
   Arkeon Group · light progressive enhancements
   v1.0 · mei 2026
   ---------------------------------------------------------
   - Mobile navigation toggle (aria-expanded)
   - Scroll-state header (passive listener, rAF-throttled)
   - IntersectionObserver reveal (respects prefers-reduced-motion)
   - Defensive: page works fully without JS
   ========================================================= */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    }
  }

  ready(function () {
    initNavToggle();
    initScrollHeader();
    initReveal();
    initActiveNav();
  });

  /* ---- Mobile navigation toggle ---- */
  function initNavToggle() {
    var btn = document.querySelector("[data-nav-toggle]");
    var list = document.querySelector("[data-nav-list]");
    if (!btn || !list) return;

    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", function () {
      var open = list.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close on link click (mobile UX)
    list.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.tagName === "A" && list.classList.contains("is-open")) {
        list.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    // Close on escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && list.classList.contains("is-open")) {
        list.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  /* ---- Scroll-state header ---- */
  function initScrollHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    var ticking = false;
    var threshold = 8;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      header.classList.toggle("is-scrolled", y > threshold);
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    update();
  }

  /* ---- Reveal (subtle) ---- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      // Fail-safe: show everything immediately
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
    );

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Mark active nav link based on current path ---- */
  function initActiveNav() {
    var links = document.querySelectorAll(".nav-list a[href]");
    if (!links.length) return;

    var path = window.location.pathname.split("/").pop() || "index.html";

    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      // Normalize: empty / "/" -> index.html
      var target = href.split("#")[0];
      if (target === "" || target === "/") target = "index.html";
      if (target === path) {
        a.setAttribute("aria-current", "page");
      }
    });
  }
})();
