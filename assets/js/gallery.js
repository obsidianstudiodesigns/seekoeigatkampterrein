/* Galleries: category filter and a shared lightbox.
   Every [data-gallery] on the page is its own set; items are <figure>s or elements marked [data-lb-item].
   The caption comes from the figcaption, then data-caption, then the image's alt text. */
(() => {
  const grids = Array.from(document.querySelectorAll('[data-gallery]'));
  const lb = document.querySelector('[data-lightbox]');
  if (!grids.length || !lb) return;
  const lbImg = lb.querySelector('[data-lb-img]');
  const lbCap = lb.querySelector('[data-lb-cap]');
  const sets = grids.map((g) => Array.from(g.querySelectorAll('figure, [data-lb-item]')));
  let list = [], index = 0, lastFocus = null;

  // largest source from the srcset
  const full = (item) => {
    const img = item.querySelector('img');
    const parts = img.srcset.split(',').map((s) => s.trim().split(' ')[0]);
    return parts[Math.min(parts.length - 1, 1)] || img.src;
  };
  const caption = (item) => {
    const fc = item.querySelector('figcaption');
    return (fc && fc.textContent) || item.dataset.caption || item.querySelector('img').alt;
  };

  // category filter (gallery page)
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    sets[0].forEach((it) => { it.hidden = f !== 'alles' && it.dataset.cat !== f; });
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  const show = (i) => {
    index = (i + list.length) % list.length;
    const item = list[index];
    lbImg.src = full(item);
    lbImg.alt = item.querySelector('img').alt;
    lbCap.textContent = `${caption(item)}  (${index + 1} van ${list.length})`;
  };
  const open = (item, set) => {
    lastFocus = document.activeElement;
    list = set.filter((it) => !it.hidden);
    show(list.indexOf(item));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('[data-lb-close]').focus();
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  sets.forEach((set) => set.forEach((item) => {
    if (!item.hasAttribute('tabindex')) item.tabIndex = 0;
    if (!item.hasAttribute('role') && item.tagName !== 'FIGURE') item.setAttribute('role', 'button');
    item.addEventListener('click', () => open(item, set));
    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(item, set); } });
  }));
  lb.querySelector('[data-lb-close]').addEventListener('click', close);
  lb.querySelector('[data-lb-prev]').addEventListener('click', () => show(index - 1));
  lb.querySelector('[data-lb-next]').addEventListener('click', () => show(index + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'ArrowLeft') show(index - 1);
  });
  let x0 = null;
  lb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
