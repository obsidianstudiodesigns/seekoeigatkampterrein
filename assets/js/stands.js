/* Stand picker: tick several numbered stands and book them together */
(() => {
  const bar = document.querySelector('[data-stand-bar]');
  if (!bar) return;
  const count = bar.querySelector('[data-stand-count]');
  const book = bar.querySelector('[data-stand-book]');
  const picked = new Set();

  const update = () => {
    const nums = [...picked].sort((a, b) => a - b);
    bar.hidden = nums.length === 0;
    count.textContent = nums.length === 1 ? `Staanplek ${nums[0]} gekies` : `${nums.length} staanplekke gekies: ${nums.join(', ')}`;
    book.href = `bespreek.html?verblyf=staanplek&plek=${nums.join(',')}`;
    document.querySelectorAll('[data-pick]').forEach((b) => {
      const on = picked.has(+b.dataset.pick);
      b.setAttribute('aria-pressed', String(on));
      b.querySelector('span').textContent = on ? 'Gekies' : 'Kies';
      b.querySelector('use').setAttribute('href', `assets/icons/sprite.svg#${on ? 'check' : 'plus'}`);
      b.closest('.stand').classList.toggle('is-picked', on);
    });
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pick]');
    if (b) {
      const n = +b.dataset.pick;
      picked.has(n) ? picked.delete(n) : picked.add(n);
      update();
    }
    if (e.target.closest('[data-stand-clear]')) { picked.clear(); update(); }
  });
})();
