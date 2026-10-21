/* Seekoeigat Kampterrein: site motion and interactions */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = !reduce && hasGsap;
  window.__motionReady = true;
  if (!motion) root.classList.remove('js-motion');
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const navH = () => parseInt(getComputedStyle(root).getPropertyValue('--nav-h'), 10) || 72;

  /* Smooth scrolling */
  let lenis = null;
  if (motion && window.Lenis) {
    if (location.hash) history.scrollRestoration = 'manual';
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  // Numeric target so pinned sections (wrapped in a pin-spacer) resolve to their real document position
  const targetY = (el) => {
    const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
    const offset = el.id === 'top' || box !== el ? 0 : navH() - 1;
    return Math.max(0, box.getBoundingClientRect().top + scrollY - offset);
  };
  const scrollToEl = (el, immediate) => {
    if (lenis) lenis.scrollTo(targetY(el), { duration: 1.4, immediate: !!immediate, force: true });
    else scrollTo({ top: targetY(el), behavior: reduce || immediate ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollToEl(el);
    history.replaceState(null, '', url.hash);
  });

  /* Navigation: solid over content, hide on scroll down */
  const nav = $('[data-nav]');
  const heroEl = $('.hero, .page-hero');
  const waFloat = $('[data-wa-float]');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    const limit = heroEl ? Math.min(heroEl.offsetHeight - navH() - 10, heroEl.offsetHeight * 0.45) : 10;
    nav.classList.toggle('is-solid', y > limit);
    const menuOpen = document.body.classList.contains('menu-open');
    nav.classList.toggle('is-hidden', !menuOpen && y > 700 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove('is-hidden');
    if (waFloat) waFloat.classList.toggle('show', y > (heroEl ? heroEl.offsetHeight * 0.7 : 200));
    lastY = y;
  };
  if (lenis) lenis.on('scroll', onScroll);
  else document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-btn]');
  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Maak spyskaart oop');
    menuBtn.querySelector('use').setAttribute('href', 'assets/icons/sprite.svg#list');
    if (lenis) lenis.start(); else document.body.style.overflow = '';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (menu.classList.contains('is-open')) return closeMenu();
      menu.classList.add('is-open');
      document.body.classList.add('menu-open');
      nav.classList.remove('is-hidden');
      menuBtn.setAttribute('aria-expanded', 'true');
      menuBtn.setAttribute('aria-label', 'Maak spyskaart toe');
      menuBtn.querySelector('use').setAttribute('href', 'assets/icons/sprite.svg#x');
      if (lenis) lenis.stop(); else document.body.style.overflow = 'hidden';
    });
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* Hero entrance */
  if (motion && $('.hero')) {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });
    tl.from('.hero-media', { scale: 1.12, duration: 2.6, ease: 'power3.out' }, 0)
      .to('.hero h1 .line > span', { y: 0, duration: 1.4, stagger: 0.12 }, 0.35)
      .to('.hero-sub', { opacity: 1, y: 0, duration: 1.2 }, 0.8)
      .to('.hero-actions', { opacity: 1, y: 0, duration: 1.2 }, 0.95)
      .to('.hero-side', { opacity: 1, y: 0, duration: 1.2 }, 1.1);
    gsap.to('.hero-content', {
      yPercent: -18, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });
  }
  if (motion && $('.page-hero > img')) {
    gsap.from('.page-hero > img', { scale: 1.1, duration: 2.2, ease: 'power3.out' });
    gsap.to('.page-hero > img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.page-hero', start: 'top top', end: 'bottom top', scrub: true } });
  }

  /* Living river: WebGL water, mist and light on the hero photo */
  const glCanvas = $('[data-hero-gl]');
  if (glCanvas && !reduce) initRiver(glCanvas);

  function initRiver(canvas) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    if (!gl) return;
    const vs = `attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
    const fs = `
      precision highp float;
      varying vec2 v;
      uniform sampler2D uTex, uMask;
      uniform vec2 uRes, uImg, uPtr;
      uniform float uTime, uZoom, uScroll;
      float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y); }
      float fbm(vec2 p){ float s = 0.0, a = 0.5; mat2 r = mat2(0.8, -0.6, 0.6, 0.8); for (int i = 0; i < 5; i++){ s += a * noise(p); p = r * p * 2.03; a *= 0.5; } return s; }
      void main(){
        float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
        vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
        vec2 uv = (v - 0.5) / uZoom + 0.5 + uPtr * 0.006;
        float fx = rs < 1.0 ? 0.36 : 0.56;
        vec2 t = uv * s + (1.0 - s) * vec2(fx, 0.5);
        float k = min(s.x, s.y);
        float m = texture2D(uMask, t).r;
        float near = 1.0 - t.y;
        float amp = mix(0.0007, 0.0058, smoothstep(0.28, 1.0, near)) * m * k;
        vec2 q = vec2(t.x * 7.0, t.y * 34.0 / (0.3 + near)) / mix(0.45, 1.0, k);
        q.y += uTime * 0.32; q.x += uTime * 0.04;
        float n1 = fbm(q);
        float n2 = fbm(q * 1.7 + vec2(5.2, 1.3) - uTime * 0.12);
        vec2 disp = vec2(n1 - 0.5, (n2 - 0.5) * 0.55) * amp * 2.2;
        vec3 col = texture2D(uTex, t + disp).rgb;
        float l = dot(col, vec3(0.299, 0.587, 0.114));
        float glint = pow(max(0.0, n2 - 0.56) * 2.4, 2.2) * m * smoothstep(0.42, 0.92, l);
        col += glint * vec3(1.0, 0.96, 0.88) * 0.5 * k;
        float fogN = fbm(vec2(t.x * 2.6 - uTime * 0.014, t.y * 7.0) + fbm(t * 1.8 + uTime * 0.008) * 1.3);
        float band = smoothstep(0.5, 0.64, t.y) * (1.0 - smoothstep(0.7, 0.84, t.y));
        float low = smoothstep(0.62, 0.0, t.y) * 0.35 * m;
        float fog = (band + low) * smoothstep(0.42, 0.85, fogN);
        col = mix(col, vec3(0.94, 0.92, 0.87), fog * 0.28);
        float sun = smoothstep(0.85, 0.0, distance(t, vec2(0.12, 0.98)));
        col += sun * vec3(1.0, 0.78, 0.48) * (0.07 + 0.02 * sin(uTime * 0.4));
        col *= 1.0 - uScroll * 0.4;
        vec2 c = v - 0.5; col *= 1.0 - dot(c, c) * 0.35;
        col += (hash(gl_FragCoord.xy + fract(uTime * 7.0)) - 0.5) * 0.028;
        gl_FragColor = vec4(col, 1.0);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {};
    ['uTex', 'uMask', 'uRes', 'uImg', 'uPtr', 'uTime', 'uZoom', 'uScroll'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

    const load = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
    const tex = (img, unit) => {
      const t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };

    const state = { zoom: 1.0, scroll: 0, px: 0, py: 0, tx: 0, ty: 0, running: false, visible: true };
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 1.75);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
    };

    Promise.all([load('assets/img/hero-river.jpg'), load('assets/img/hero-water-mask.png')]).then(([img, mask]) => {
      tex(img, 0); tex(mask, 1);
      gl.uniform1i(U.uTex, 0); gl.uniform1i(U.uMask, 1);
      gl.uniform2f(U.uImg, img.naturalWidth, img.naturalHeight);
      resize();
      addEventListener('resize', resize);
      addEventListener('pointermove', (e) => { state.tx = e.clientX / innerWidth - 0.5; state.ty = 0.5 - e.clientY / innerHeight; }, { passive: true });
      if (hasGsap) {
        ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: (s) => (state.scroll = s.progress) });
        gsap.fromTo(state, { zoom: 1.0 }, { zoom: 1.06, duration: 26, ease: 'sine.inOut', repeat: -1, yoyo: true });
      }
      new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; if (state.visible) start(); }).observe(canvas);
      document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
      const t0 = performance.now();
      const frame = (now) => {
        if (!state.visible || document.hidden) { state.running = false; return; }
        state.px += (state.tx - state.px) * 0.04; state.py += (state.ty - state.py) * 0.04;
        gl.uniform1f(U.uTime, (now - t0) / 1000);
        gl.uniform1f(U.uZoom, state.zoom);
        gl.uniform1f(U.uScroll, state.scroll);
        gl.uniform2f(U.uPtr, state.px, state.py);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(frame);
      };
      function start() { if (!state.running) { state.running = true; requestAnimationFrame(frame); } }
      start();
      requestAnimationFrame(() => canvas.parentElement.classList.add('gl-ready'));
    }).catch(() => {});
  }

  /* Welcome text: words light up as you read */
  const words = $('[data-words]');
  if (words) {
    const html = words.textContent.trim().split(/\s+/).map((w) => {
      const hl = /^\*.*\*[.,]?$/.test(w);
      const clean = w.replace(/\*/g, '');
      return `<span class="w${hl ? ' hl' : ''}">${clean}</span>`;
    }).join(' ');
    words.innerHTML = html;
    const spans = $$('.w', words);
    if (motion) {
      ScrollTrigger.create({
        trigger: words, start: 'top 78%', end: 'bottom 42%', scrub: true,
        onUpdate: (s) => { const n = Math.round(s.progress * spans.length); spans.forEach((el, i) => el.classList.toggle('on', i < n)); },
      });
    } else spans.forEach((el) => el.classList.add('on'));
  }

  /* Collage parallax */
  if (motion) {
    $$('[data-speed]').forEach((el) => {
      gsap.to(el, { y: () => parseFloat(el.dataset.speed) * innerHeight, ease: 'none', scrollTrigger: { trigger: el.closest('[data-collage]'), start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
  }

  /* Reveals */
  const revealEls = $$('[data-reveal]');
  if (motion) {
    ScrollTrigger.batch(revealEls, {
      start: 'top 88%', once: true,
      onEnter: (batch) => batch.forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 90)),
    });
  }

  /* Counters */
  $$('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const suffix = el.textContent.replace(/^\d+/, '');
    if (!motion) return;
    const o = { v: 0 };
    el.textContent = '0' + suffix;
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', onUpdate: () => (el.textContent = Math.round(o.v) + suffix) }),
    });
  });

  /* Accommodation: pinned horizontal pan on wide screens, native swipe elsewhere */
  const stays = $('[data-stays]');
  if (stays) {
    const track = $('[data-stays-track]', stays);
    const viewport = $('[data-stays-viewport]', stays);
    const cards = () => $$('.stay, .stays-end', track);
    const step = () => { const c = cards()[0]; return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0) : 400; };
    let panST = null;
    const usePin = motion && matchMedia('(min-width: 721px)').matches;
    if (usePin) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: stays, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      panST = tween.scrollTrigger;
      $$('.stay-media img', track).forEach((img) => {
        gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.stay'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
    } else {
      stays.classList.add('is-native');
    }
    $$('[data-pan]', stays).forEach((b) => b.addEventListener('click', () => {
      const dir = parseInt(b.dataset.pan, 10);
      if (panST) {
        const target = Math.min(panST.end, Math.max(panST.start, scrollY + dir * step()));
        lenis ? lenis.scrollTo(target, { duration: 1.1 }) : scrollTo({ top: target, behavior: 'smooth' });
      } else viewport.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' });
    }));
  }

  /* Campfire embers */
  const embersCanvas = $('[data-embers]');
  if (embersCanvas && !reduce) initEmbers(embersCanvas);

  function initEmbers(canvas) {
    const ctx = canvas.getContext('2d');
    const sprite = (r, soft) => {
      const c = document.createElement('canvas'); c.width = c.height = r * 2;
      const g = c.getContext('2d').createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, 'rgba(255,236,190,1)');
      g.addColorStop(soft ? 0.15 : 0.25, 'rgba(255,170,70,0.95)');
      g.addColorStop(soft ? 0.5 : 0.55, 'rgba(240,90,20,0.35)');
      g.addColorStop(1, 'rgba(200,40,0,0)');
      const x = c.getContext('2d'); x.fillStyle = g; x.fillRect(0, 0, r * 2, r * 2);
      return c;
    };
    const sharp = sprite(16, false), soft = sprite(48, true);
    let W = 0, H = 0, dpr = 1, parts = [], running = false, visible = false, last = 0;
    const count = () => (innerWidth < 760 ? 46 : 96);
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (p, initial) => {
      const bokeh = Math.random() < 0.12;
      p.bokeh = bokeh;
      const src = W * (innerWidth < 760 ? 0.5 : 0.68);
      p.x = src + (Math.random() - 0.5) * W * (bokeh ? 0.7 : 0.34);
      p.y = initial ? H * (0.15 + Math.random() * 0.85) : H + 10 + Math.random() * 40;
      p.vy = -(bokeh ? 22 + Math.random() * 26 : 46 + Math.random() * 80);
      p.vx = (Math.random() - 0.5) * 16;
      p.size = bokeh ? 10 + Math.random() * 18 : 1.2 + Math.random() * 2.8;
      p.life = 0; p.max = 4 + Math.random() * 6;
      p.seed = Math.random() * 1000; p.flick = 6 + Math.random() * 10;
      return p;
    };
    const fill = () => { parts = Array.from({ length: count() }, () => spawn({}, true)); };
    const frame = (now) => {
      if (!visible || document.hidden) { running = false; return; }
      const dt = Math.min(0.05, (now - (last || now)) / 1000); last = now;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const tt = now / 1000;
      for (const p of parts) {
        p.life += dt;
        if (p.life > p.max || p.y < -40) spawn(p, false);
        const wind = Math.sin(tt * 0.6 + p.seed) * 22 + Math.sin(tt * 2.3 + p.seed * 2) * 9;
        p.x += (p.vx + wind) * dt;
        p.y += p.vy * dt;
        p.vy *= 0.999;
        const k = p.life / p.max;
        const fade = Math.min(1, p.life * 2.5) * (1 - k) * (1 - k);
        const flick = 0.65 + 0.35 * Math.sin(tt * p.flick + p.seed);
        const s = p.size * (1 - k * 0.55);
        ctx.globalAlpha = Math.max(0, fade * flick * (p.bokeh ? 0.22 : 0.95));
        const img = p.bokeh ? soft : sharp;
        const d = p.bokeh ? s * 2 : s * 5;
        ctx.drawImage(img, p.x - d / 2, p.y - d / 2, d, d);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    };
    const start = () => { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } };
    resize(); fill();
    addEventListener('resize', () => { resize(); fill(); });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { rootMargin: '120px' }).observe(canvas);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) start(); });
  }

  /* Fire section: slow push on scroll */
  if (motion && $('[data-fire]')) {
    gsap.fromTo('[data-fire] .fire-media img', { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '[data-fire]', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* Map: load Google Maps only when asked */
  const mapBtn = $('[data-map-load]');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const wrap = $('[data-map]');
    const f = document.createElement('iframe');
    f.title = 'Kaart na Seekoeigat Kampterrein';
    f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade';
    f.src = 'https://maps.google.com/maps?q=-25.333122,29.393990&z=13&output=embed';
    wrap.innerHTML = '';
    wrap.appendChild(f);
  });

  /* Copy buttons (bank details) */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) { return; }
    const label = b.querySelector('span');
    const old = label.textContent;
    b.classList.add('done'); label.textContent = 'Gekopieer';
    setTimeout(() => { b.classList.remove('done'); label.textContent = old; }, 1800);
  }));

  addEventListener('load', () => {
    if (hasGsap) ScrollTrigger.refresh();
    const el = location.hash && document.getElementById(location.hash.slice(1));
    if (el) setTimeout(() => scrollToEl(el, true), 80);
  }, { once: true });
})();
