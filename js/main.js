document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");

  // Menu mobile
  function closeMenu() {
    header.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", () => {
    const open = header.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Défilement doux vers les sections (plus lent et plus fluide que le natif)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let scrollAnim = null;

  function targetY(el) {
    const offset = header.getBoundingClientRect().height + 16;
    return Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset);
  }

  function smoothScrollTo(y) {
    if (reduceMotion) {
      window.scrollTo(0, y);
      return;
    }
    if (scrollAnim) cancelAnimationFrame(scrollAnim);
    const startY = window.scrollY;
    const dist = y - startY;
    const duration = Math.min(650, Math.max(320, Math.abs(dist) * 0.25));
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + dist * ease(t));
      if (t < 1) scrollAnim = requestAnimationFrame(step);
      else scrollAnim = null;
    };
    scrollAnim = requestAnimationFrame(step);
  }

  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const el = url.hash === "#top" ? document.body : document.querySelector(url.hash);
      if (!el) return;
      e.preventDefault();
      closeMenu();
      smoothScrollTo(url.hash === "#top" ? 0 : targetY(el));
      history.pushState(null, "", url.hash);
    });
  });

  // Arrivée depuis une autre page avec une ancre (ex. Atlas → #projets) : on glisse doucement
  if (location.hash && location.hash.length > 1) {
    const el = document.querySelector(location.hash);
    if (el) {
      window.scrollTo(0, 0);
      setTimeout(() => smoothScrollTo(targetY(el)), 150);
    }
  }

  // Ombre sous l'en-tête au défilement
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Langue
  document.getElementById("lang-toggle").addEventListener("click", () => {
    I18n.setLang(I18n.current === "fr" ? "en" : "fr");
  });

  // Copier le courriel
  const copyBtn = document.getElementById("copy-email");
  const toast = document.getElementById("copy-toast");
  if (copyBtn && toast) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.email);
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
      } catch (e) {
        window.location.href = `mailto:${copyBtn.dataset.email}`;
      }
    });
  }

  // Apparition douce des sections
  const reveal = document.querySelectorAll(".section, .shot");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    reveal.forEach((el) => el.classList.add("reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    reveal.forEach((el) => io.observe(el));
  }
});
