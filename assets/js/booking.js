/* Booking enquiry: live estimate from the 2026/27 rates, sent via WhatsApp or e-mail */
(() => {
  const form = document.querySelector('[data-booking]');
  if (!form) return;

  const WA = '27603514738';
  const EMAIL = 'seekoeigatkameeldoorn@gmail.com';

  // base = price per night (or per day), incl = people included, extra = per extra person, max = people per unit
  const RATES = {
    staanplek: { label: 'Staanplek (woonwa of tent)', base: 480, incl: 4, extra: 120, max: 6, vehicles: true, hint: 'R480 per nag vir 4 persone, R120 per ekstra persoon. Maks 6 per staanplek.' },
    safari: { label: 'Safari-tent', base: 500, incl: 2, extra: 0, max: 2, hint: 'R500 per nag vir 2 persone. Twee enkelbeddens, bring eie beddegoed.' },
    huisie: { label: 'Huisie', base: 560, incl: 2, extra: 120, max: 4, hint: 'R560 per nag vir 2 persone, R120 per ekstra persoon. Maks 4, selfsorg.' },
    boskamp: { label: 'Boskamp', base: 500, incl: 4, extra: 100, hint: 'R500 per nag vir 4 persone, R100 per ekstra persoon. Hele kamp: R4 500 per naweek.' },
    terras: { label: 'Terras by Huisie 3', base: 480, incl: 4, extra: 120, max: 6, vehicles: true, hint: 'R480 per nag vir 4 persone, R120 per ekstra persoon. Maks 6.' },
    wildkamp: { label: 'Wildkamp', base: 480, incl: 4, extra: 50, max: 6, hint: 'R480 per nag vir 4 persone, maks 6. Geen krag, slegs groepe.' },
    pensioen: { label: 'Pensionarisse', base: 350, incl: 2, extra: 150, vehicles: true, hint: 'R350 per nag vir 2 persone. Week R1 200 (Ma tot Vr), maand R3 000. Nie oor Paasnaweek en Desember nie.' },
    dag: { label: 'Dagbesoek', perPerson: 150, day: true, hint: 'R150 per persoon. Dagbesoekers is welkom tot 18:00.' },
    lapa: { label: 'Lapa', base: 1800, incl: 20, extra: 50, day: true, hint: 'R1 800 per dag vir 20 gaste, R50 per ekstra persoon.' },
    groep: { label: 'Groep, klub of bos troue', quote: true, hint: 'Vir groepe van meer as 10 en bos troues stuur ons vir jou \'n kwotasie.' },
  };

  const $ = (s) => form.querySelector(s);
  const S = (k) => document.querySelector(`[data-s="${k}"]`);
  const type = $('#b-type'), arrive = $('#b-arrive'), depart = $('#b-depart');
  const adults = $('#b-adults'), kids = $('#b-kids'), babies = $('#b-babies'), vehicles = $('#b-vehicles');
  const nameI = $('#b-name'), phone = $('#b-phone'), email = $('#b-email'), notes = $('#b-notes');
  const status = form.querySelector('[data-status]');
  const rand = (n) => 'R' + Math.round(n).toLocaleString('en-ZA').replace(/,/g, ' ');

  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  arrive.min = iso(today);
  depart.min = iso(new Date(today.getTime() + 864e5));

  const parse = (v) => (v ? new Date(v + 'T00:00:00') : null);
  const fmt = (d) => d.toLocaleDateString('af-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const int = (el) => Math.max(parseInt(el.min || '0', 10), parseInt(el.value || '0', 10) || 0);

  form.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
    const input = b.parentElement.querySelector('input');
    const next = (parseInt(input.value, 10) || 0) + parseInt(b.dataset.step, 10);
    input.value = Math.min(parseInt(input.max, 10), Math.max(parseInt(input.min, 10), next));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }));

  arrive.addEventListener('change', () => {
    const a = parse(arrive.value);
    if (!a) return;
    const minD = new Date(a.getTime() + 864e5);
    depart.min = iso(minD);
    if (!depart.value || parse(depart.value) <= a) depart.value = iso(new Date(a.getTime() + 2 * 864e5));
  });

  function calc() {
    const r = RATES[type.value];
    const a = parse(arrive.value), d = parse(depart.value);
    const people = int(adults) + int(kids);
    const nights = a && d && d > a ? Math.round((d - a) / 864e5) : 0;
    const units = r.day ? 1 : nights;
    let total = null;
    if (r.quote) total = null;
    else if (r.perPerson) total = r.perPerson * people;
    else if (units > 0) total = units * (r.base + Math.max(0, people - r.incl) * r.extra) + (r.vehicles ? int(vehicles) * 30 * units : 0);
    return { r, a, d, people, nights, total };
  }

  function render() {
    const { r, a, d, people, nights, total } = calc();
    form.querySelector('[data-type-hint]').textContent = r.hint;
    form.querySelector('[data-depart-wrap]').hidden = !!r.day;
    form.querySelector('[data-arrive-label]').textContent = r.day ? 'Datum' : 'Aankoms';
    form.querySelector('[data-vehicles-wrap]').hidden = !r.vehicles;
    S('type').textContent = r.label;
    S('dates').textContent = r.day ? (a ? fmt(a) : 'Kies datum') : a && d && d > a ? `${fmt(a)} tot ${fmt(d)}` : 'Kies datums';
    S('length').textContent = r.day ? '1 dag' : nights ? `${nights} ${nights === 1 ? 'nag' : 'nagte'}` : '-';
    const b = int(babies);
    S('people').textContent = `${people}${b ? ` + ${b} onder 3` : ''}`;
    S('total').textContent = r.quote ? 'Kwotasie' : total != null ? rand(total) : '-';
    const over = r.max && people > r.max;
    S('note').textContent = over
      ? `Maksimum ${r.max} persone per eenheid. Ons help jou graag met 'n tweede eenheid.`
      : r.quote ? 'Ons stuur vir jou \'n kwotasie na jou navraag.' : '\'n Skatting volgens die 2026/27 tariewe. Die kantoor bevestig die finale bedrag.';
  }

  // preselect from links like bespreek.html?verblyf=huisie
  const pre = new URLSearchParams(location.search).get('verblyf');
  if (pre && RATES[pre]) type.value = pre;

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  render();

  function setErr(field, msg) {
    const wrap = form.querySelector(`[data-field="${field}"]`);
    if (!wrap) return;
    wrap.classList.toggle('has-error', !!msg);
    wrap.querySelector('.err').textContent = msg || '';
    const input = wrap.querySelector('input');
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }

  function validate() {
    const { r, a, d, people } = calc();
    const errs = {};
    if (!a) errs.arrive = r.day ? 'Kies \'n datum.' : 'Kies jou aankomsdatum.';
    else if (a < today) errs.arrive = 'Die datum is reeds verby.';
    if (!r.day && (!d || (a && d <= a))) errs.depart = 'Vertrek moet na aankoms wees.';
    if (people < 1) errs.adults = 'Ten minste een persoon.';
    if (nameI.value.trim().length < 2) errs.name = 'Vul asseblief jou naam in.';
    if (phone.value.replace(/\D/g, '').length < 9) errs.phone = 'Vul \'n geldige selfoonnommer in.';
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errs.email = 'Die e-posadres lyk nie reg nie.';
    ['arrive', 'depart', 'adults', 'name', 'phone', 'email'].forEach((k) => setErr(k, errs[k]));
    const first = Object.keys(errs)[0];
    if (first) {
      const el = form.querySelector(`[data-field="${first}"] input`);
      if (el) el.focus({ preventScroll: false });
    }
    return !first;
  }

  function message() {
    const { r, a, d, people, nights, total } = calc();
    const lines = ['Goeie dag Seekoeigat, ek wil graag bespreek:', ''];
    lines.push(`Verblyf: ${r.label}`);
    if (r.day) lines.push(`Datum: ${fmt(a)}`);
    else lines.push(`Aankoms: ${fmt(a)}`, `Vertrek: ${fmt(d)} (${nights} ${nights === 1 ? 'nag' : 'nagte'})`);
    lines.push(`Volwassenes: ${int(adults)}`, `Kinders 3 jaar en ouer: ${int(kids)}`);
    if (int(babies)) lines.push(`Kinders onder 3: ${int(babies)}`);
    if (r.vehicles && int(vehicles)) lines.push(`Ekstra voertuie: ${int(vehicles)}`);
    if (total != null) lines.push(`Geskatte koste: ${rand(total)}`);
    lines.push('', `Naam: ${nameI.value.trim()}`, `Selfoon: ${phone.value.trim()}`);
    if (email.value.trim()) lines.push(`E-pos: ${email.value.trim()}`);
    if (notes.value.trim()) lines.push('', `Nota: ${notes.value.trim()}`);
    return { text: lines.join('\n'), subject: `Besprekingsnavraag: ${r.label}, ${a ? fmt(a) : ''} (${nameI.value.trim()})`, people };
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
