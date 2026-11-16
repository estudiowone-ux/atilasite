(() => {
  "use strict";

  const WA_NUMBER = "5511942429283";
  const WA_DEFAULT = "Olá, Átila! Vim pela página da Frequência Empresarial e quero entrar na lista de espera.";
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  const AREAS = [
    { name: "Pessoas", desc: "Time certo, nos lugares certos.", v: 7 },
    { name: "Liderança", desc: "O dono como referência, não gargalo.", v: 5 },
    { name: "Processos", desc: "Rotinas que funcionam sem você.", v: 4 },
    { name: "Produto", desc: "Oferta clara, valor e margem.", v: 8 },
    { name: "Marketing", desc: "Posicionamento e demanda constante.", v: 3 },
    { name: "Vendas", desc: "Rotina comercial e previsibilidade.", v: 6 },
    { name: "Finanças", desc: "Número, caixa e lucro de verdade.", v: 5 },
    { name: "Cultura", desc: "Propósito e energia que contagiam.", v: 7 },
  ];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- WhatsApp links ---------- */
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.waText || WA_DEFAULT);
    a.target = "_blank";
    a.rel = "noopener";
  });
  $(".year").textContent = new Date().getFullYear();

  const hasGsap = typeof window.gsap !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== "undefined" && hasGsap) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = $(id);
      if (!el) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(el, { offset: id === "#topo" ? 0 : -60 }) : el.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- header ---------- */
  const header = $(".header");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    header.classList.toggle("is-hidden", y > 400 && y > lastY);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  // intro via CSS class (GSAP on header would fight the CSS transform transition)
  setTimeout(() => header.classList.remove("is-intro"), reduce ? 0 : 150);

  /* ---------- run loop only while visible ---------- */
  const whileVisible = (el, fn) => {
    let on = false, raf = 0;
    const loop = (t) => { fn(t); if (on) raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !on) { on = true; raf = requestAnimationFrame(loop); }
      else if (!e.isIntersecting) { on = false; cancelAnimationFrame(raf); }
    }).observe(el);
  };

  /* ---------- HERO: oscilloscope canvas ---------- */
  const canvas = $(".hero__waves");
  const ctx = canvas.getContext("2d");
  const hzEl = $(".hz");
  let W = 0, H = 0, dpr = 1;
  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => { mouse.tx = e.clientX / innerWidth; mouse.ty = e.clientY / innerHeight; });

  const LINES = 7;
  const drawWaves = (t) => {
    const time = t * 0.001;
    mouse.x += (mouse.tx - mouse.x) * .05;
    mouse.y += (mouse.ty - mouse.y) * .05;
    ctx.clearRect(0, 0, W, H);
    const wide = W >= 820;
    const mid = H * (wide ? .5 : .22);
    const amp = H * (.07 + mouse.y * .09);
    const freq = 1.4 + mouse.x * 1.8;
    for (let l = 0; l < LINES; l++) {
      const k = l / (LINES - 1);
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "rgba(63,169,255,0)");
      grad.addColorStop(.5, `rgba(${Math.round(63 + 80 * k)},${Math.round(169 + 58 * k)},255,${.15 + .5 * (1 - Math.abs(k - .5) * 2)})`);
      grad.addColorStop(1, "rgba(143,227,255,0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = l === 3 ? 2.2 : 1;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 4) {
        const u = x / W;
        const env = Math.sin(Math.PI * u) ** 2 * (wide ? .15 + .85 * u : 1); // desktop: energy on the right, text side calm
        const y = mid
          + Math.sin(u * Math.PI * 2 * freq + time * (1.2 + k * .6) + l * .6) * amp * env * (1 - k * .35)
          + Math.sin(u * Math.PI * 9 + time * 2.4 + l) * amp * .12 * env;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    if (hzEl) hzEl.textContent = (freq * 3.6 + Math.sin(time * 3) * .04).toFixed(2);
  };
  if (reduce) drawWaves(0); else whileVisible($(".hero"), drawWaves);

  /* ---------- NOISE → SIGNAL ---------- */
  const noisePath = $(".noise__path");
  const N = 160;
  const seeds = Array.from({ length: N + 1 }, () => Math.random() * 2 - 1);
  const spikes = Array.from({ length: N + 1 }, () => (Math.random() > .86 ? (Math.random() * 2 - 1) * 2.4 : 0));
  const noise = { p: 0 };
  const lerpColor = (a, b, t) => {
    const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
    const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  };
  const drawNoise = (t = 0) => {
    const time = t * 0.001;
    const clean = noise.p, dirty = 1 - noise.p;
    let d = "";
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * 1000;
      const jitter = Math.sin(time * 6 + i * 1.7) * .5 + .5;
      const y = 110
        + Math.sin(x * .018 - time * 1.6) * 62 * (.35 + clean * .65)
        + seeds[i] * 70 * dirty * jitter
        + spikes[i] * 40 * dirty;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    noisePath.setAttribute("d", d);
    const c = lerpColor("ff5d6c", "3fa9ff", clean);
    noisePath.style.stroke = c;
    noisePath.style.color = c;
  };
  drawNoise();
  if (!reduce) whileVisible($(".noise__scope"), drawNoise);

  /* ---------- RADAR + SLIDERS ---------- */
  const R = 120, n = AREAS.length;
  const ns = "http://www.w3.org/2000/svg";
  const pt = (i, r) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [Math.cos(a) * r, Math.sin(a) * r];
  };
  const mk = (tag, attrs, parent) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  };
  const rings = $(".radar__rings"), axes = $(".radar__axes"), dotsG = $(".radar__dots"), labelsG = $(".radar__labels");
  [.25, .5, .75, 1].forEach((f) => mk("polygon", { points: AREAS.map((_, i) => pt(i, R * f).join(",")).join(" ") }, rings));
  const dots = [], labels = [];
  AREAS.forEach((a, i) => {
    const [x, y] = pt(i, R);
    mk("line", { x1: 0, y1: 0, x2: x, y2: y }, axes);
    dots.push(mk("circle", { r: 4.5, cx: 0, cy: 0 }, dotsG));
    const [lx, ly] = pt(i, R + 26);
    const anchor = Math.abs(lx) < 4 ? "middle" : lx > 0 ? "start" : "end";
    const t = mk("text", { x: lx, y: ly + 4, "text-anchor": anchor }, labelsG);
    t.textContent = a.name;
    labels.push(t);
  });
  const shape = $(".radar__shape");
  const live = Object.fromEntries(AREAS.map((_, i) => [i, 0])); // object, not array: gsap treats arrays as target lists
  const target = AREAS.map((a) => a.v);
  const scoreEl = $(".score"), weakEl = $(".weak"), msgEl = $(".result__msg"), sendBtn = $(".send-diag");

  const slidersBox = $(".sliders");
  const rows = AREAS.map((a, i) => {
    const row = document.createElement("label");
    row.className = "sl";
    row.innerHTML = `<span class="sl__top"><span class="sl__name">${a.name}</span><span class="sl__val">${a.v}</span></span>
      <span class="sl__desc">${a.desc}</span>
      <input type="range" min="0" max="10" step="1" value="${a.v}" aria-label="${a.name}">`;
    slidersBox.appendChild(row);
    const input = $("input", row);
    const val = $(".sl__val", row);
    const paint = () => input.style.setProperty("--v", `${input.value * 10}%`);
    paint();
    input.addEventListener("input", () => {
      target[i] = +input.value;
      val.textContent = input.value;
      paint();
      update();
    });
    return row;
  });

  const render = () => {
    shape.setAttribute("points", AREAS.map((_, i) => pt(i, (R * live[i]) / 10).join(",")).join(" "));
    AREAS.forEach((_, i) => {
      const [x, y] = pt(i, (R * live[i]) / 10);
      dots[i].setAttribute("cx", x); dots[i].setAttribute("cy", y);
    });
  };

  const message = (s) =>
    s < 40 ? "Muito ruído. Sua empresa está gastando energia sem direção."
    : s < 70 ? "Sinal instável. Tem potência aqui — falta alinhar as frequências."
    : s < 90 ? "Boa sintonia. Hora de amplificar o que já funciona."
    : "Frequência alta. O próximo passo é escalar com método.";

  const shown = { s: 0 };
  const update = (animate = true) => {
    const score = Math.round((target.reduce((a, b) => a + b, 0) / n) * 10);
    const min = Math.min(...target);
    const weakIdx = target.map((v, i) => (v === min ? i : -1)).filter((i) => i >= 0);
    const weakNames = weakIdx.map((i) => AREAS[i].name);
    weakEl.textContent = weakNames.slice(0, 2).join(" e ") + (weakNames.length > 2 ? " +" : "");
    msgEl.textContent = message(score);
    AREAS.forEach((_, i) => {
      const w = weakIdx.includes(i);
      rows[i].classList.toggle("is-weak", w);
      dots[i].classList.toggle("is-weak", w);
      labels[i].classList.toggle("is-weak", w);
    });
    const lines = AREAS.map((a, i) => `• ${a.name}: ${target[i]}/10`).join("\n");
    sendBtn.href = waLink(`Olá, Átila! Fiz o pré-diagnóstico da Frequência Empresarial.\n\n${lines}\n\nMinha frequência: ${score}/100\nPonto de ruído: ${weakNames.join(", ")}\n\nQuero conversar sobre a mentoria.`);

    if (hasGsap && animate && !reduce) {
      gsap.to(live, { ...Object.fromEntries(target.map((v, i) => [i, v])), duration: .6, ease: "power3.out", onUpdate: render, overwrite: true });
      gsap.to(shown, { s: score, duration: .6, ease: "power2.out", overwrite: true, onUpdate: () => (scoreEl.textContent = Math.round(shown.s)) });
    } else {
      target.forEach((v, i) => (live[i] = v));
      render();
      scoreEl.textContent = score;
    }
  };

  /* ---------- CTA wave ---------- */
  const ctaPath = $(".cta__wave path");
  const drawCta = (t) => {
    const time = t * 0.001;
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const u = i / 120, x = u * 1200;
      const env = Math.sin(Math.PI * u) ** 1.5;
      const y = 150 + (Math.sin(u * 22 - time * 2) * 70 + Math.sin(u * 7 + time) * 30) * env;
      d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }
    ctaPath.setAttribute("d", d);
  };
  drawCta(0);
  if (!reduce) whileVisible($(".cta"), drawCta);

  /* ---------- no GSAP / reduced motion: static ---------- */
  if (!hasGsap || reduce) {
    noise.p = .5; drawNoise();
    update(false);
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
    return;
  }

  /* ---------- intro ---------- */
  $$(".hero__title .line").forEach((l) => { l.innerHTML = `<span>${l.innerHTML}</span>`; });
  // hold the hero until web fonts arrive (max 1.2s) so the font swap can't shift visible text (CLS)
  gsap.set(".hero__content", { autoAlpha: 0 });
  const heroIntro = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } })
    .set(".hero__content", { autoAlpha: 1 }, 0)
    .from(".hero__waves", { autoAlpha: 0, duration: 2 }, 0)
    .from(".hero__eyebrow", { y: 20, autoAlpha: 0, duration: 1 }, .2)
    .from(".hero__title .line > span", { yPercent: 110, duration: 1.3, stagger: .1 }, .25)
    .from(".hero__sub", { y: 24, autoAlpha: 0, duration: 1.1 }, .7)
    .from(".hero__ctas .btn", { y: 24, autoAlpha: 0, duration: 1, stagger: .08 }, .8)
    .from(".hud span", { autoAlpha: 0, duration: .8, stagger: .08 }, 1);
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 1200))])
    .then(() => heroIntro.play());

  gsap.to(".hero__content", { yPercent: -18, autoAlpha: .2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- reveals ---------- */
  $$(".reveal").forEach((el) => {
    gsap.from(el, { y: 50, autoAlpha: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });
  $$(".fade-up").forEach((el) => {
    gsap.from(el, { y: 36, autoAlpha: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  $$(".reveal-img").forEach((el) => {
    gsap.fromTo(el, { clipPath: "inset(18% 12% 18% 12% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 28px)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 30%", scrub: true } });
    gsap.fromTo($("img", el), { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* noise scrub: ruído → sintonia */
  gsap.to(noise, { p: 1, ease: "none", onUpdate: () => drawNoise(performance.now()), scrollTrigger: { trigger: ".noise__scope", start: "top 80%", end: "bottom 25%", scrub: .6 } });

  /* radar: grows in when seen */
  ScrollTrigger.create({ trigger: ".radar", start: "top 75%", once: true, onEnter: () => update(true) });
  gsap.from(".sl", { y: 20, autoAlpha: 0, duration: .8, stagger: .05, ease: "power3.out", scrollTrigger: { trigger: ".sliders", start: "top 85%" } });
  render();

  /* steps line draw */
  const stepLine = $(".steps__line path");
  if (stepLine) {
    const len = stepLine.getTotalLength();
    gsap.fromTo(stepLine, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".steps", start: "top 80%", end: "top 30%", scrub: true } });
  }

  /* counters */
  $$("[data-count]").forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, { v: +el.dataset.count, duration: 2, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(obj.v)) });
  });

  /* cta icon pulse */
  gsap.from(".cta__icon", { scale: .6, autoAlpha: 0, duration: 1.2, ease: "back.out(1.6)", scrollTrigger: { trigger: ".cta", start: "top 70%" } });

  /* ---------- magnetic buttons ---------- */
  if (window.matchMedia("(hover: hover)").matches) {
    $$(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: .5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: .5, ease: "power3.out" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * .25);
        yTo((e.clientY - r.top - r.height / 2) * .35);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
  }
})();
