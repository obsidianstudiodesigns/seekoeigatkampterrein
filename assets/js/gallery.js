/* Gallery: category filter and lightbox */
(() => {
  const grid = document.querySelector('[data-gallery]');
  if (!grid) return;
  const figs = Array.from(grid.querySelectorAll('figure'));
  const chips = Array.from(document.querySelectorAll('[data-filter]'));
  const lb = document.querySelector('[data-lightbox]');
  const lbImg = lb.querySelector('[data-lb-img]');
  const lbCap = lb.querySelector('[data-lb-cap]');
  let list = figs, index = 0, lastFocus = null;

  // largest source from the srcset
  const full = (fig) => {
    const img = fig.querySelector('img');
    const parts = img.srcset.split(',').map((s) => s.trim().split(' ')[0]);
    return parts[Math.min(parts.length - 1, 1)] || img.src;
  };

  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    figs.forEach((fig) => { fig.hidden = f !== 'alles' && fig.dataset.cat !== f; });
    list = figs.filter((fig) => !fig.hidden);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }));

  const show = (i) => {
    index = (i + list.length) % list.length;
    const fig = list[index];
    lbImg.src = full(fig);
    lbImg.alt = fig.querySelector('img').alt;
    lbCap.textContent = `${fig.querySelector('figcaption').textContent}  (${index + 1} van ${list.length})`;
  };
  const open = (fig) => {
    lastFocus = document.activeElement;
    show(list.indexOf(fig));
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.querySelector('[data-lb-close]').focus();
  };
  const close = () => {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  figs.forEach((fig) => {
    fig.addEventListener('click', () => open(fig));
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(fig); } });
  });
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
