// Defensive checks & DOM ready
document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------
   *     Typed tagline
   *     --------------------------- */
  if (window.Typed) {
    new Typed("#typed", {
      strings: ["Professional Video Editor", "Motion Designer", "Storyteller"],
      typeSpeed: 55,
      backSpeed: 35,
      backDelay: 1500,
      loop: true
    });
  }

  /* ---------------------------
   *     Hero background fade + slow zoom
   *     --------------------------- */
  const bg = document.getElementById("bg-image");
  if (bg && window.gsap) {
    // start invisible -> fade to visible and slowly scale
    gsap.to(bg, { duration: 1.2, opacity: 1, ease: "power2.out" });
    gsap.to(bg, { duration: 18, scale: 1.08, ease: "none" });
  }

  /* ---------------------------
   *     Simple smooth scroll for nav/buttons
   *     --------------------------- */
  document.querySelectorAll('a[href^="#"], button[data-scroll]').forEach(el => {
    el.addEventListener("click", e => {
      e.preventDefault();
      const target = el.getAttribute("href") || el.dataset.scroll;
      if (!target) return;
      const node = document.querySelector(target);
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------------------------
   *     Custom cursor
   *     --------------------------- */
  const cursor = document.getElementById("cursor");
  if (cursor) {
    document.addEventListener("mousemove", (e) => {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
    });
  }

  /* ---------------------------
   *     Fade-in on scroll
   *     --------------------------- */
  const faders = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  faders.forEach(el => observer.observe(el));

  /* ---------------------------
   *     Project hover previews & modal
   *     --------------------------- */
  const cards = document.querySelectorAll(".project-card");
  const modal = document.getElementById("project-modal");
  const modalBackdrop = document.getElementById("modal-backdrop");
  const modalVideo = document.getElementById("modal-video");
  const modalTitle = document.getElementById("modal-title");
  const modalClose = document.getElementById("modal-close");

  cards.forEach(card => {
    const vid = card.querySelector(".project-video");
    // play preview on hover (desktop)
    card.addEventListener("mouseenter", () => {
      if (vid) { vid.currentTime = 0; vid.play(); }
    });
    card.addEventListener("mouseleave", () => {
      if (vid) { vid.pause(); vid.currentTime = 0; }
    });

    // open modal on click
    card.addEventListener("click", () => {
      const videoSrc = card.dataset.video;
      const title = card.dataset.title || "";
      if (!videoSrc) return;
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      modalVideo.src = videoSrc;
      modalTitle.textContent = title;
      setTimeout(() => modalVideo.play(), 200);
    });
  });

  // close modal
  const closeModal = () => {
    modalVideo.pause();
    modalVideo.src = "";
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  };
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener("click", closeModal);

  /* ---------------------------
   *     Ripple effect on buttons
   *     --------------------------- */
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      ripple.className = "ripple";
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });

  /* ---------------------------
   *     Accessibility: close modal with Escape
   *     --------------------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) closeModal();
  });
});
