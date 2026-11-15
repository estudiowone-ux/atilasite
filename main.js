(() => {
  "use strict";

  /* ---------- config ---------- */
  const WA_NUMBER = "5511942429283";
  const WA_TEXT = "Olá, Átila! Vim pelo site e quero dar o próximo passo.";
  const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;

  const CLIENTS = [
    "cpfl-energia-logo", "grupo-hinode", "polishop-logo", "starrett-company", "universidae-cruzeiro-do-sul",
    "logo-unip-home", "ceunsp", "etec", "ibc-logo", "logo-ballagro", "logo-inforshop", "logo-prefeitura",
    "alier-tecnologia", "grupo-mendes", "nova-geracao", "praiamar", "rhema-imoveis", "robiel", "sp"
  ];

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = a.dataset.waText
      ? `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(a.dataset.waText)}`
      : WA_URL;
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  // clients marquee (2x for seamless loop)
  const track = document.querySelector(".clients__track");
  if (track) {
    const html = CLIENTS.map(
      (c) => `<div class="clients__logo"><img src="assets/clientes/${c}.webp" alt="" loading="lazy"></div>`
    ).join("");
    track.innerHTML = html + html;
  }

  // stacked cards index
  document.querySelectorAll(".stack .card").forEach((c, i) => c.style.setProperty("--i", i));

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  const loader = document.querySelector(".loader");
  if (reduce || !hasGsap) {
    loader && loader.remove();
    document.querySelector(".wa-float")?.classList.add("is-visible");
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = Number(el.dataset.count).toLocaleString("pt-BR")));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === "#topo" ? 0 : -40 });
      });
    });
  }

  /* ---------- split text helper ---------- */
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
            const w = document.createElement("span");
            w.className = "w";
            const wi = document.createElement("span");
            wi.className = "wi";
            wi.textContent = part;
            w.appendChild(wi);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          walk(n);
        }
      });
    };
    walk(el);
    return el.querySelectorAll(".wi");
  };

  /* ---------- initial states ---------- */
  const heroLines = gsap.utils.toArray(".hero__title .line > span");
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set([".hero__eyebrow", ".hero__sub", ".hero__ctas", ".hero__foot"], { autoAlpha: 0, y: 30 });
  gsap.set(".hero__img", { scale: 1.12, autoAlpha: 0, transformOrigin: "50% 15%" });
  gsap.set(".header", { yPercent: -100, autoAlpha: 0 });

  /* ---------- loader ---------- */
  const count = { v: 0 };
  const countEl = document.querySelector(".loader__count");
  const tlLoad = gsap.timeline({ onComplete: intro });
  tlLoad
    .to(".loader__icon", { autoAlpha: 1, scale: 1, duration: .8, ease: "expo.out" })
    .to(count, {
      v: 100, duration: 1.4, ease: "power2.inOut",
      onUpdate: () => (countEl.textContent = String(Math.round(count.v)).padStart(3, "0"))
    }, 0)
    .to(".loader__bar span", { width: "100%", duration: 1.4, ease: "power2.inOut" }, 0)
    .to(".loader__inner", { y: -30, autoAlpha: 0, duration: .5, ease: "power2.in" })
    .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: .9, ease: "expo.inOut" }, "-=.1");

  function intro() {
    loader.remove();
    document.body.classList.remove("is-loading");
    lenis && lenis.start();
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .to(".hero__img", { scale: 1, autoAlpha: 1, duration: 2.2 })
      .to(".header", { yPercent: 0, autoAlpha: 1, duration: 1 }, .2)
      .to(".hero__eyebrow", { autoAlpha: 1, y: 0, duration: 1 }, .2)
      .to(heroLines, { yPercent: 0, duration: 1.3, stagger: .12 }, .3)
      .to(".hero__sub", { autoAlpha: 1, y: 0, duration: 1 }, .8)
      .to(".hero__ctas", { autoAlpha: 1, y: 0, duration: 1 }, .95)
      .to(".hero__foot", { autoAlpha: 1, y: 0, duration: 1 }, 1.1)
      .add(() => document.querySelector(".wa-float").classList.add("is-visible"), 1.4);
  }

  /* ---------- header state ---------- */
  const header = document.querySelector(".header");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      header.classList.toggle("is-scrolled", y > 40);
      header.classList.toggle("is-hidden", y > 500 && y > lastY);
      lastY = y;
    }
  });

  /* ---------- hero parallax ---------- */
  gsap.to(".hero__img", {
    yPercent: 6, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });
  gsap.to(".hero__content", {
    y: -80, autoAlpha: .2, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* ---------- split titles ---------- */
  document.querySelectorAll(".split").forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: .045,
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  /* ---------- fade up ---------- */
  gsap.utils.toArray(".fade-up").forEach((el) => {
    gsap.from(el, {
      y: 40, autoAlpha: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 90%" }
    });
  });

  /* ---------- image reveals ---------- */
  gsap.utils.toArray(".reveal-img").forEach((el) => {
    const img = el.querySelector("img");
    gsap.fromTo(el, { clipPath: "inset(18% 12% 18% 12% round 28px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.5, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
    gsap.fromTo(img, { scale: 1.3 }, {
      scale: 1, duration: 1.8, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });
  gsap.to(".about__frame img", {
    yPercent: -12, ease: "none",
    scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true }
  });
  gsap.from(".about__icon", {
    rotate: -90, scale: 0, duration: 1.4, ease: "back.out(1.6)",
    scrollTrigger: { trigger: ".about__visual", start: "top 70%" }
  });

  /* ---------- counters ---------- */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2.2, ease: "power3.out",
      onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("pt-BR")),
      scrollTrigger: { trigger: el, start: "top 90%" }
    });
  });
  gsap.from(".stat", {
    y: 50, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: .1,
    scrollTrigger: { trigger: ".stats", start: "top 85%" }
  });

  /* ---------- award ---------- */
  const ring = document.querySelector(".award__ring");
  if (ring) {
    const len = ring.getTotalLength();
    gsap.fromTo(ring, { strokeDasharray: len, strokeDashoffset: len }, {
      strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut", delay: .2,
      scrollTrigger: { trigger: ".award__card", start: "top 80%" }
    });
  }
  gsap.from(".award", {
    y: 80, autoAlpha: 0, duration: 1.3, ease: "expo.out",
    scrollTrigger: { trigger: ".award", start: "top 85%" }
  });
  gsap.fromTo(".award__media img", { scale: 1.25 }, {
    scale: 1, ease: "none",
    scrollTrigger: { trigger: ".award", start: "top bottom", end: "bottom top", scrub: true }
  });

  /* ---------- stacked module cards ---------- */
  const cards = gsap.utils.toArray(".stack .card");
  cards.forEach((card, i) => {
    gsap.from(card, {
      y: 120, autoAlpha: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: card, start: "top 92%" }
    });
    const art = card.querySelectorAll(".card__art path");
    art.forEach((p) => {
      const len = p.getTotalLength();
      gsap.fromTo(p, { strokeDasharray: len, strokeDashoffset: len }, {
        strokeDashoffset: 0, duration: 2, ease: "power2.inOut",
        scrollTrigger: { trigger: card, start: "top 70%" }
      });
    });
    if (i < cards.length - 1) {
      gsap.to(card, {
        scale: .94, filter: "brightness(.5)", ease: "none",
        scrollTrigger: { trigger: cards[i + 1], start: "top 65%", end: "top 15%", scrub: true }
      });
    }
  });

  /* ---------- orbit ---------- */
  const arc = document.querySelector(".orbit__arc");
  if (arc) {
    const len = arc.getTotalLength();
    gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(arc, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: ".method", start: "top 70%", end: "center 40%", scrub: 1 }
    });
    const orbit = document.querySelector(".orbit");
    const spin = { r: 0 };
    gsap.to(spin, {
      r: 90, ease: "none",
      onUpdate: () => {
        document.querySelector(".orbit__spin").style.transform = `rotate(${spin.r}deg)`;
        orbit.style.setProperty("--spin", `${spin.r}deg`);
      },
      scrollTrigger: { trigger: ".method", start: "top bottom", end: "bottom top", scrub: 1 }
    });
    gsap.from(".orbit__node", {
      autoAlpha: 0, duration: .9, ease: "power2.out", stagger: .15,
      scrollTrigger: { trigger: ".orbit", start: "top 75%" }
    });
    gsap.from(".orbit__core", {
      scale: .4, autoAlpha: 0, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: ".orbit", start: "top 75%" }
    });
  }

  /* ---------- CTA ---------- */
  gsap.fromTo(".cta__bg img", { yPercent: -10 }, {
    yPercent: 0, ease: "none",
    scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true }
  });
  gsap.from([".cta .btn", ".cta__phone"], {
    y: 30, autoAlpha: 0, duration: 1, ease: "expo.out", stagger: .1,
    scrollTrigger: { trigger: ".cta .btn", start: "top 92%" }
  });

  /* ---------- magnetic buttons + cursor (desktop) ---------- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".magnetic").forEach((btn) => {
      const xTo = gsap.quickTo(btn, "x", { duration: .6, ease: "power3.out" });
      const yTo = gsap.quickTo(btn, "y", { duration: .6, ease: "power3.out" });
      btn.addEventListener("mousemove", (e) => {
        const r = btn.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .3);
        yTo((e.clientY - r.top - r.height / 2) * .4);
      });
      btn.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
    });

    const cursor = document.querySelector(".cursor");
    const cx = gsap.quickTo(cursor, "x", { duration: .25, ease: "power3.out" });
    const cy = gsap.quickTo(cursor, "y", { duration: .25, ease: "power3.out" });
    window.addEventListener("mousemove", (e) => {
      cursor.style.opacity = 1;
      cx(e.clientX); cy(e.clientY);
    });
    document.querySelectorAll("a, button, .card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
