(function () {
  "use strict";

  var toggle = document.getElementById("toggle");
  if (toggle) {
    toggle.addEventListener("click", function (e) { e.stopPropagation(); });
    document.documentElement.addEventListener("click", function (e) {
      if (!e.target.classList.contains("toggle")) toggle.checked = false;
    });
  }

  var topBar = document.querySelector(".top-bar");
  function updateTopBar() {
    if (!topBar) return;
    topBar.classList.toggle("tb-large", window.scrollY <= 100);
    topBar.classList.toggle("tb-small", window.scrollY > 100);
  }
  window.addEventListener("scroll", updateTopBar, { passive: true });
  updateTopBar();

  function scrollBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  // The inquiry form is revealed by either call to action or the Contact menu link.
  var contact = document.getElementById("contact");
  var contactLinks = document.querySelectorAll('a[href="#contact"]');
  var contactTrigger = null;
  function setContactOpen(open) {
    if (!contact) return;
    contact.hidden = !open;
    contactLinks.forEach(function (link) { link.setAttribute("aria-expanded", String(open)); });
  }
  document.addEventListener("click", function (e) {
    var link = e.target.closest(".scrollto");
    if (!link) return;
    var hash = link.getAttribute("href");
    if (!hash || hash.charAt(0) !== "#") return;
    var target = document.getElementById(hash.slice(1));
    if (!target) return;
    e.preventDefault();
    if (target === contact) {
      contactTrigger = link;
      setContactOpen(true);
      contact.focus({ preventScroll: true });
    }
    target.scrollIntoView({ behavior: scrollBehavior() });
    history.pushState(null, "", hash);
  });
  var contactClose = document.querySelector(".hs-contact-close");
  if (contactClose) contactClose.addEventListener("click", function () {
    setContactOpen(false);
    var target = contactTrigger || document.querySelector(".hs-cta-btn");
    if (target) target.focus();
    history.replaceState(null, "", "#get-in-touch");
  });
  function restoreContactAnchor() {
    if (location.hash === "#contact" && contact) {
      setContactOpen(true);
      contact.scrollIntoView({ behavior: "auto" });
    } else {
      setContactOpen(false);
    }
  }
  window.addEventListener("hashchange", restoreContactAnchor);
  window.addEventListener("popstate", restoreContactAnchor);
  restoreContactAnchor();

  // Testimonials only move when a visitor uses an arrow, dot, keyboard or swipe.
  var track = document.querySelector(".hs-kw-track");
  if (track) {
    var slides = Array.from(track.children);
    var dots = document.querySelector(".hs-kw-dots");
    var activeSlide = 0;
    var status = document.createElement("p");
    status.className = "hs-sr-only";
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    track.parentNode.appendChild(status);
    function markSlide(index) {
      activeSlide = Math.max(0, Math.min(slides.length - 1, index));
      Array.from(dots.children).forEach(function (dot, i) {
        dot.classList.toggle("on", i === activeSlide);
        dot.setAttribute("aria-current", i === activeSlide ? "true" : "false");
        slides[i].setAttribute("aria-hidden", String(i !== activeSlide));
      });
      status.textContent = "Testimonial slide " + (activeSlide + 1) + " of " + slides.length;
    }
    function goToSlide(index) {
      var next = (index + slides.length) % slides.length;
      track.scrollTo({ left: next * track.clientWidth, behavior: scrollBehavior() });
    }
    slides.forEach(function (slide, i) {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + slides.length);
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Testimonial " + (i + 1));
      dot.setAttribute("aria-controls", "testimonials");
      dot.addEventListener("click", function () { goToSlide(i); });
      dots.appendChild(dot);
    });
    document.querySelectorAll(".hs-kw-arrow").forEach(function (arrow) {
      arrow.addEventListener("click", function () { goToSlide(activeSlide + Number(arrow.dataset.dir)); });
    });
    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        goToSlide(activeSlide + (e.key === "ArrowLeft" ? -1 : 1));
      }
    });
    track.addEventListener("scroll", function () {
      var index = Math.round(track.scrollLeft / track.clientWidth);
      if (index !== activeSlide) markSlide(index);
    }, { passive: true });
    new ResizeObserver(function () {
      track.scrollTo({ left: activeSlide * track.clientWidth, behavior: "instant" });
    }).observe(track);
    markSlide(0);
  }

  // Native dialog provides focus containment and Escape-to-close for enlarged photos.
  var galleryLinks = Array.from(document.querySelectorAll(".popup-gallery"));
  if (galleryLinks.length) {
    var dialog = document.createElement("dialog");
    dialog.className = "hs-lightbox";
    dialog.setAttribute("aria-label", "Enlarged photo");
    dialog.innerHTML = '<div class="hs-lightbox-panel">' +
      '<button type="button" class="hs-lightbox-close" aria-label="Close photo">&times;</button>' +
      '<button type="button" class="hs-lightbox-prev" aria-label="Previous photo">&#8249;</button>' +
      '<img class="hs-lightbox-image" alt="">' +
      '<button type="button" class="hs-lightbox-next" aria-label="Next photo">&#8250;</button></div>';
    document.body.appendChild(dialog);
    var photo = dialog.querySelector("img");
    var group = [];
    var photoIndex = 0;
    var opener = null;
    var oldOverflow = "";
    function showPhoto(index) {
      photoIndex = (index + group.length) % group.length;
      photo.src = group[photoIndex].href;
      photo.alt = group[photoIndex].querySelector("img").alt;
    }
    galleryLinks.forEach(function (link) {
      link.setAttribute("aria-haspopup", "dialog");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        opener = link;
        group = Array.from(link.closest("section").querySelectorAll(".popup-gallery"));
        showPhoto(group.indexOf(link));
        oldOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.showModal();
        dialog.querySelector(".hs-lightbox-close").focus();
      });
    });
    dialog.querySelector(".hs-lightbox-close").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector(".hs-lightbox-prev").addEventListener("click", function () { showPhoto(photoIndex - 1); });
    dialog.querySelector(".hs-lightbox-next").addEventListener("click", function () { showPhoto(photoIndex + 1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        showPhoto(photoIndex + (e.key === "ArrowLeft" ? -1 : 1));
      }
    });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", function () {
      document.body.style.overflow = oldOverflow;
      if (opener) opener.focus({ preventScroll: true });
    });
  }
})();
