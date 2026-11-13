/* Booking enquiry: one or more stays on one name, a live estimate per stay from the 2026/27 rates,
   sent as one sectioned message via WhatsApp or e-mail */
(() => {
  const form = document.querySelector('[data-booking]');
  if (!form) return;

  const WA = '27603514738';
  const EMAIL = 'seekoeigatkameeldoorn@gmail.com';

  // base = price per unit per night (or per day), incl = people included per unit, extra = per extra person,
  // max = people per unit, vehicles = R30 extra vehicles apply, day = priced per day, adults = default adults
  const RATES = {
    staanplek: { label: 'Staanplek (woonwa of tent)', unit: 'staanplekke', base: 480, incl: 4, extra: 120, max: 6, vehicles: true, adults: 2, hint: 'R480 per nag vir 4 persone, R120 per ekstra persoon. Maks 6 per staanplek.' },
    safari: { label: 'Safari-tent', unit: 'tente', base: 500, incl: 2, extra: 0, max: 2, adults: 2, hint: 'R500 per nag vir 2 persone. Twee enkelbeddens, bring eie beddegoed.' },
    huisie: { label: 'Huisie', unit: 'huisies', base: 560, incl: 2, extra: 120, max: 4, adults: 2, hint: 'Net vir 2 persone. Maks 4 persone as julle die 3/4-beddens deel, R120 per ekstra persoon. Klein yskas, selfsorg.' },
    boskamp: { label: 'Boskamp', unit: 'staanplekke', base: 500, incl: 4, extra: 100, adults: 2, hint: 'R500 per nag vir 4 persone, R100 per ekstra persoon. Hele kamp: R4 500 per naweek.' },
    terras: { label: 'Terras by Huisie 3', unit: 'terrasse', base: 480, incl: 4, extra: 120, max: 6, vehicles: true, adults: 2, single: true, hint: 'R480 per nag vir 4 persone, R120 per ekstra persoon. Maks 6, tot twee karavane.' },
    wildkamp: { label: 'Wildkamp', unit: 'staanplekke', base: 480, incl: 4, extra: 50, max: 6, adults: 4, hint: 'R480 per nag vir 4 persone, maks 6. Geen krag, slegs groepe.' },
    pensioen: { label: 'Pensionarisse', unit: 'staanplekke', base: 350, incl: 2, extra: 150, vehicles: true, adults: 2, hint: 'R350 per nag vir 2 persone. Week R1 200 (Ma tot Vr), maand R3 000. Nie oor Paasnaweek en Desember nie.' },
    lapa: { label: 'Lapa', base: 1800, incl: 20, extra: 50, day: true, single: true, adults: 20, hint: 'R1 800 per dag vir 20 gaste, R50 per ekstra persoon.' },
    dag: { label: 'Dagbesoek', perPerson: 150, day: true, single: true, adults: 2, hint: 'R150 per persoon. Dagbesoekers is welkom tot 18:00.' },
    groep: { label: 'Groep, klub of bos troue', quote: true, single: true, adults: 10, hint: 'Vir groepe van meer as 10 en bos troues stuur ons vir jou \'n kwotasie.' },
  };
  const ORDER = Object.keys(RATES);

  const $ = (s, c = form) => c.querySelector(s);
  const S = (k) => document.querySelector(`[data-s="${k}"]`);
  const arrive = $('#b-arrive'), depart = $('#b-depart'), babies = $('#b-babies');
  const nameI = $('#b-name'), phone = $('#b-phone'), email = $('#b-email'), notes = $('#b-notes');
  const rows = $('[data-stay-rows]');
  const emptyMsg = rows.innerHTML;
  const status = $('[data-status]');
  const boxes = Array.from(form.querySelectorAll('input[name="stay"]'));
  const rand = (n) => 'R' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ');
  const icon = (n) => `<svg class="icon" aria-hidden="true"><use href="assets/icons/sprite.svg#${n}"></use></svg>`;

  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  arrive.min = iso(today);
  depart.min = iso(new Date(today.getTime() + 864e5));
  const parse = (v) => (v ? new Date(v + 'T00:00:00') : null);
  const fmt = (d) => d.toLocaleDateString('af-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const num = (v, min = 0) => Math.max(min, parseInt(v, 10) || 0);

  // per-stay numbers survive unticking and re-ticking
  const state = {};
  ORDER.forEach((k) => (state[k] = { units: 1, adults: RATES[k].adults, kids: 0, vehicles: 0, days: 1 }));
  const selected = () => boxes.filter((b) => b.checked).map((b) => b.value);
  const onlyDay = () => { const s = selected(); return s.length > 0 && s.every((k) => RATES[k].day); };

  arrive.addEventListener('change', () => {
    const a = parse(arrive.value);
    if (!a) return;
    depart.min = iso(new Date(a.getTime() + 864e5));
    if (!depart.value || parse(depart.value) <= a) depart.value = iso(new Date(a.getTime() + 2 * 864e5));
  });

  const stepper = (key, field, label, min, max) => `
    <div class="field">
      <label for="s-${key}-${field}">${label}</label>
      <div class="stepper"><button type="button" aria-label="Minder: ${label}" data-step="-1">${icon('minus')}</button><input id="s-${key}-${field}" data-stay="${key}" data-k="${field}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${state[key][field]}"><button type="button" aria-label="Meer: ${label}" data-step="1">${icon('plus')}</button></div>
    </div>`;

  function renderRows() {
    const sel = selected();
    if (!sel.length) { rows.innerHTML = emptyMsg; return; }
    rows.innerHTML = sel.map((k) => {
      const r = RATES[k];
      const fields = [];
      if (!r.single) fields.push(stepper(k, 'units', `Aantal ${r.unit}`, 1, 10));
      if (r.day && k === 'lapa') fields.push(stepper(k, 'days', 'Aantal dae', 1, 7));
      fields.push(stepper(k, 'adults', 'Volwassenes', 0, k === 'lapa' || k === 'groep' ? 300 : 60));
      fields.push(stepper(k, 'kids', 'Kinders 3+', 0, 60));
      if (r.vehicles) fields.push(stepper(k, 'vehicles', 'Ekstra voertuie', 0, 10));
      return `
        <section class="stay-row" data-row="${k}">
          <header class="stay-row-head">
            <h4>${r.label}</h4>
            <span class="stay-row-sub" data-sub="${k}">-</span>
            <button type="button" class="stay-remove" data-remove="${k}" aria-label="Verwyder ${r.label}">${icon('x')}</button>
          </header>
          <div class="stay-row-fields">${fields.join('')}</div>
          <p class="hint">${r.hint}${r.vehicles ? ' Een voertuig per eenheid ingesluit, R30 per ekstra voertuig per nag.' : ''}</p>
          <p class="stay-warn" data-warn="${k}" hidden></p>
        </section>`;
    }).join('');
  }

  function calcStay(k, nights) {
    const r = RATES[k], s = state[k];
    const units = r.single ? 1 : num(s.units, 1);
    const people = num(s.adults) + num(s.kids);
    let total = null;
    if (r.quote) total = null;
    else if (r.perPerson) total = r.perPerson * people;
    else if (r.day) total = num(s.days, 1) * (units * r.base + Math.max(0, people - r.incl * units) * r.extra);
    else if (nights > 0) total = nights * (units * r.base + Math.max(0, people - r.incl * units) * r.extra) + (r.vehicles ? num(s.vehicles) * 30 * nights : 0);
    const over = r.max && people > r.max * units;
    return { r, s, units, people, total, over };
  }

  function nightsOf() {
    const a = parse(arrive.value), d = parse(depart.value);
    return { a, d, nights: a && d && d > a ? Math.round((d - a) / 864e5) : 0 };
  }

  function render() {
    const day = onlyDay();
    form.querySelector('[data-depart-wrap]').hidden = day;
    form.querySelector('[data-arrive-label]').textContent = day ? 'Datum' : 'Aankoms';
    const { a, d, nights } = nightsOf();
    S('dates').textContent = day ? (a ? fmt(a) : 'Kies datum') : a && d && d > a ? `${fmt(a)} tot ${fmt(d)}` : 'Kies datums';
    S('length').textContent = day ? 'Dagbesoek' : nights ? `${nights} ${nights === 1 ? 'nag' : 'nagte'}` : '-';

    const sel = selected();
    let sum = 0, anyPriced = false, anyQuote = false, pending = false;
    const lines = sel.map((k) => {
      const c = calcStay(k, nights);
      const sub = c.r.quote ? 'Kwotasie' : c.total != null ? rand(c.total) : '-';
      if (c.r.quote) anyQuote = true; else if (c.total != null) { sum += c.total; anyPriced = true; } else pending = true;
      const subEl = rows.querySelector(`[data-sub="${k}"]`);
      if (subEl) subEl.textContent = sub;
      const warn = rows.querySelector(`[data-warn="${k}"]`);
      if (warn) {
        warn.hidden = !c.over;
        if (c.over) warn.textContent = `Maksimum ${c.r.max} persone per eenheid. Kies nog ${c.r.unit || 'eenhede'} of minder persone.`;
      }
      const qty = c.r.single ? '' : ` x${c.units}`;
      return `<li><span>${c.r.label}${qty}<small>${c.people} ${c.people === 1 ? 'persoon' : 'persone'}</small></span><b>${sub}</b></li>`;
    });
    const b = num(babies.value);
    if (b) lines.push(`<li><span>Kinders onder 3<small>Gratis</small></span><b>${b}</b></li>`);
    S('lines').innerHTML = lines.length ? lines.join('') : '<li class="sum-empty">Nog geen verblyf gekies nie</li>';
    S('total').textContent = anyPriced && !pending ? rand(sum) + (anyQuote ? ' +' : '') : anyQuote && !anyPriced ? 'Kwotasie' : '-';
    S('note').textContent = anyQuote
      ? '\'n Skatting volgens die 2026/27 tariewe. Groepe en bos troues word apart gekwoteer.'
      : '\'n Skatting volgens die 2026/27 tariewe. Die kantoor bevestig die finale bedrag.';
  }

  // ticking and unticking stays
  boxes.forEach((b) => b.addEventListener('change', () => { renderRows(); render(); setErr('stays'); }));
  rows.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-remove]');
    if (rm) { boxes.find((b) => b.value === rm.dataset.remove).checked = false; renderRows(); render(); }
  });

  // steppers (static and per-stay)
  form.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-step]');
    if (!btn) return;
    const input = btn.parentElement.querySelector('input');
    const next = (parseInt(input.value, 10) || 0) + parseInt(btn.dataset.step, 10);
    input.value = Math.min(parseInt(input.max, 10), Math.max(parseInt(input.min, 10), next));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  form.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.stay) state[t.dataset.stay][t.dataset.k] = num(t.value, parseInt(t.min, 10) || 0);
    render();
  });
  form.addEventListener('change', render);

  // preselect from links like bespreek.html?verblyf=huisie or ?verblyf=huisie,staanplek
  const pre = (new URLSearchParams(location.search).get('verblyf') || '').split(',');
  boxes.forEach((b) => { if (pre.includes(b.value)) b.checked = true; });
  renderRows();
  render();

  function setErr(field, msg) {
    const wrap = form.querySelector(`[data-field="${field}"]`);
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!msg);
    const err = wrap.querySelector(':scope > .err');
    if (err) err.textContent = msg || '';
    const input = wrap.querySelector('input:not([type="checkbox"])');
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    const sel = selected();
    const day = onlyDay();
    const { a, d } = nightsOf();
    const errs = {};
    if (!sel.length) errs.stays = 'Kies ten minste een verblyf.';
    if (!a) errs.arrive = day ? 'Kies \'n datum.' : 'Kies jou aankomsdatum.';
    else if (a < today) errs.arrive = 'Die datum is reeds verby.';
    if (sel.length && !day && (!d || (a && d <= a))) errs.depart = 'Vertrek moet na aankoms wees.';
    if (sel.some((k) => num(state[k].adults) + num(state[k].kids) < 1)) errs.stays = 'Elke verblyf het ten minste een persoon nodig.';
    if (nameI.value.trim().length < 2) errs.name = 'Vul asseblief jou naam in.';
    if (phone.value.replace(/\D/g, '').length < 9) errs.phone = 'Vul \'n geldige selfoonnommer in.';
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errs.email = 'Die e-posadres lyk nie reg nie.';
    ['stays', 'arrive', 'depart', 'name', 'phone', 'email'].forEach((k) => setErr(k, errs[k]));
    const first = Object.keys(errs)[0];
    if (first) {
      const el = form.querySelector(`[data-field="${first}"] input`);
      if (el) el.focus();
    }
    return !first;
  }

  function message() {
    const day = onlyDay();
    const { a, d, nights } = nightsOf();
    const sel = selected();
    const lines = ['Goeie dag Seekoeigat, ek wil graag bespreek:', ''];
    if (day) lines.push(`Datum: ${fmt(a)}`);
    else lines.push(`Aankoms: ${fmt(a)}`, `Vertrek: ${fmt(d)} (${nights} ${nights === 1 ? 'nag' : 'nagte'})`);
    let sum = 0, priced = true, quote = false;
    sel.forEach((k, i) => {
      const c = calcStay(k, nights);
      lines.push('', `${i + 1}. ${c.r.label}${c.r.single ? '' : ` x${c.units}`}`);
      if (k === 'lapa') lines.push(`   Dae: ${num(c.s.days, 1)}`);
      lines.push(`   Volwassenes: ${num(c.s.adults)}, kinders 3+: ${num(c.s.kids)}`);
      if (c.r.vehicles && num(c.s.vehicles)) lines.push(`   Ekstra voertuie: ${num(c.s.vehicles)}`);
      if (c.r.quote) { lines.push('   Koste: kwotasie asseblief'); quote = true; }
      else if (c.total != null) { lines.push(`   Subtotaal: ${rand(c.total)}`); sum += c.total; }
      else priced = false;
    });
    const b = num(babies.value);
    lines.push('');
    if (b) lines.push(`Kinders onder 3 (gratis): ${b}`);
    if (priced && sum > 0) lines.push(`Geskatte totaal: ${rand(sum)}${quote ? ' plus kwotasie' : ''}`);
    lines.push('', `Naam: ${nameI.value.trim()}`, `Selfoon: ${phone.value.trim()}`);
    if (email.value.trim()) lines.push(`E-pos: ${email.value.trim()}`);
    if (notes.value.trim()) lines.push('', `Nota: ${notes.value.trim()}`);
    const names = sel.map((k) => RATES[k].label).join(', ');
    return { text: lines.join('\n'), subject: `Besprekingsnavraag: ${names}, ${a ? fmt(a) : ''} (${nameI.value.trim()})` };
  }

  let via = 'wa';
  form.querySelectorAll('[data-send]').forEach((b) => b.addEventListener('click', () => (via = b.dataset.send)));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const m = message();
    if (via === 'mail') {
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(m.text)}`;
      status.textContent = 'Jou e-posprogram is oopgemaak met die besonderhede. Druk stuur daar om die navraag te stuur.';
    } else {
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m.text)}`, '_blank', 'noopener');
      status.textContent = 'WhatsApp is oopgemaak met jou besonderhede. Druk stuur in WhatsApp en ons kom so gou moontlik terug na jou.';
    }
    status.classList.add('show');
  });
})();
