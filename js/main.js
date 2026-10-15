(function () {
  "use strict";

  /* ==================== 01. Menu toggle ==================== */
  var toggle = document.getElementById("toggle");
  if (toggle) {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    document.documentElement.addEventListener("click", function (e) {
      if (!e.target.classList.contains("toggle")) {
        toggle.checked = false;
      }
    });
  }

  /* ==================== 02. Top bar scroll effect ==================== */
  var topBar = document.querySelector(".top-bar");
  if (topBar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 100) {
        topBar.classList.remove("tb-large");
        topBar.classList.add("tb-small");
      } else {
        topBar.classList.remove("tb-small");
        topBar.classList.add("tb-large");
      }
    });
  }

  /* ==================== 03. Smooth scroll ==================== */
  document.addEventListener("click", function (e) {
    var link = e.target.closest(".scrollto");
    if (!link) return;
    var hash = link.getAttribute("href");
    if (!hash || hash.charAt(0) !== "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (target.id === "contact") target.focus({ preventScroll: true });
    history.pushState(null, null, hash);
  });

  /* ==================== 04. Quote slider ==================== */
  var quoteSlider = document.querySelector(".quote-slider");
  if (quoteSlider) {
    var quotes = quoteSlider.querySelectorAll("li");
    var currentQuote = 0;
    if (quotes.length > 1) {
      // Keep every quote in the grid so rotation cannot move later sections.
      quoteSlider.classList.add("is-rotating");
      quotes.forEach(function (q, i) {
        q.style.visibility = i === 0 ? "visible" : "hidden";
        q.style.opacity = i === 0 ? "1" : "0";
        q.style.transition = "opacity 0.6s ease";
      });
      setInterval(function () {
        var prev = currentQuote;
        currentQuote = (currentQuote + 1) % quotes.length;
        quotes[prev].style.opacity = "0";
        setTimeout(function () {
          quotes[prev].style.visibility = "hidden";
          quotes[currentQuote].style.visibility = "visible";
          // Force reflow
          quotes[currentQuote].offsetHeight;
          quotes[currentQuote].style.opacity = "1";
        }, 600);
      }, 6000);
    }
  }

  /* ==================== 05. Photo carousel (scroll-snap) ==================== */
  var carousel = document.querySelector(".work-slider");
  if (carousel) {
    var prevBtn = document.querySelector(".work-prev");
    var nextBtn = document.querySelector(".work-next");
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        carousel.scrollBy({ left: -300, behavior: "smooth" });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        carousel.scrollBy({ left: 300, behavior: "smooth" });
      });
    }
  }

  /* ==================== 06. Lightbox ==================== */
  var lightboxOverlay = null;
  var lightboxImg = null;
  var lightboxClose = null;
  var lightboxPrev = null;
  var lightboxNext = null;
  var galleryLinks = [];
  var galleryIndex = 0;

  function createLightbox() {
    lightboxOverlay = document.createElement("div");
    lightboxOverlay.className = "lightbox-overlay";
    lightboxOverlay.innerHTML =
      '<div class="lightbox-content">' +
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Previous">&#8249;</button>' +
      '<img class="lightbox-img" src="" alt="">' +
      '<button class="lightbox-next" aria-label="Next">&#8250;</button>' +
      "</div>";
    document.body.appendChild(lightboxOverlay);
    lightboxImg = lightboxOverlay.querySelector(".lightbox-img");
    lightboxClose = lightboxOverlay.querySelector(".lightbox-close");
    lightboxPrev = lightboxOverlay.querySelector(".lightbox-prev");
    lightboxNext = lightboxOverlay.querySelector(".lightbox-next");

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxOverlay.addEventListener("click", function (e) {
      if (e.target === lightboxOverlay) closeLightbox();
    });
    lightboxPrev.addEventListener("click", function () {
      galleryIndex =
        (galleryIndex - 1 + galleryLinks.length) % galleryLinks.length;
      lightboxImg.src = galleryLinks[galleryIndex].href;
    });
    lightboxNext.addEventListener("click", function () {
      galleryIndex = (galleryIndex + 1) % galleryLinks.length;
      lightboxImg.src = galleryLinks[galleryIndex].href;
    });
    document.addEventListener("keydown", function (e) {
      if (!lightboxOverlay.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") lightboxPrev.click();
      if (e.key === "ArrowRight") lightboxNext.click();
    });
  }

  function openLightbox(index) {
    if (!lightboxOverlay) createLightbox();
    galleryIndex = index;
    lightboxImg.src = galleryLinks[galleryIndex].href;
    lightboxOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // Bind gallery links
  galleryLinks = Array.prototype.slice.call(
    document.querySelectorAll(".popup-gallery")
  );
  galleryLinks.forEach(function (link, i) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      openLightbox(i);
    });
  });

  /* ==================== 07. Inline popup (Kirsten testimonial) ==================== */
  var kirstenLinks = document.querySelectorAll(".open-kirsten");
  var kirstenPopup = document.getElementById("kirsten");
  if (kirstenLinks.length && kirstenPopup) {
    kirstenPopup.style.display = "none";
    kirstenLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        if (!lightboxOverlay) createLightbox();
        lightboxImg.style.display = "none";
        lightboxPrev.style.display = "none";
        lightboxNext.style.display = "none";
        var content = lightboxOverlay.querySelector(".lightbox-content");
        var existing = content.querySelector(".lightbox-inline");
        if (existing) existing.remove();
        var wrapper = document.createElement("div");
        wrapper.className = "lightbox-inline";
        wrapper.innerHTML = kirstenPopup.innerHTML;
        content.appendChild(wrapper);
        lightboxOverlay.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });
  }

  /* Keep a useful contact option available if the hosted form cannot load. */
  var formEmbed = document.getElementById("eh_form_5392538928414720");
  var formFallback = document.getElementById("contact-fallback");
  if (formEmbed && formFallback) {
    var formWaitExpired = false;
    var updateFormFallback = function () {
      var hasForm = !!formEmbed.querySelector("form, iframe, input:not([type='hidden']), textarea");
      formFallback.hidden = hasForm || !formWaitExpired;
    };
    new MutationObserver(updateFormFallback).observe(formEmbed, { childList: true, subtree: true });
    setTimeout(function () {
      formWaitExpired = true;
      updateFormFallback();
    }, 8000);
  }

  /* ==================== 08. Restore lightbox elements after close ==================== */
  // When closing inline popups, restore the lightbox img/nav
  var origCloseLightbox = closeLightbox;
  closeLightbox = function () {
    origCloseLightbox();
    if (lightboxImg) lightboxImg.style.display = "";
    if (lightboxPrev) lightboxPrev.style.display = "";
    if (lightboxNext) lightboxNext.style.display = "";
    if (lightboxOverlay) {
      var inline = lightboxOverlay.querySelector(".lightbox-inline");
      if (inline) inline.remove();
    }
  };
  // Re-bind close button to new function
  if (lightboxClose) {
    lightboxClose.removeEventListener("click", origCloseLightbox);
    lightboxClose.addEventListener("click", closeLightbox);
  }
})();
