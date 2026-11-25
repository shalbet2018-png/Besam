// Besam Logistics site behaviour: nav, reveals, sticky story, route, WhatsApp quote form.
const BUSINESS = {
  whatsapp: '254721567157', // 0721 567 157
  email: 'besamlogistics22@gmail.com',
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const waLink = (text) => `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(text)}`;

// 3D background loads on its own so a WebGL problem never breaks the page.
import('./scene.js')
  .then((m) => m.startScene($('#bg3d')))
  .catch(() => document.documentElement.classList.add('no-webgl'));

$('#year').textContent = new Date().getFullYear();

/* ---------- Pre-filled WhatsApp links ---------- */
$$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); });

/* ---------- Draft notice ---------- */
$('#draftClose')?.addEventListener('click', (e) => { e.stopPropagation(); $('#draftNote').classList.add('hidden'); });
$('#draftNote')?.addEventListener('click', (e) => e.currentTarget.classList.toggle('open'));

/* ---------- Nav ---------- */
const nav = $('#nav');
const burger = $('#burger');
const links = $('#navLinks');
const onScrollNav = () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  document.body.classList.toggle('past-hero', window.scrollY > window.innerHeight * 0.7);
};
onScrollNav();
window.addEventListener('scroll', onScrollNav, { passive: true });
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', String(open));
  links.classList.toggle('open', open);
});
$$('a', links).forEach((a) => a.addEventListener('click', () => {
  burger.setAttribute('aria-expanded', 'false');
  links.classList.remove('open');
}));

// Highlight the nav link for the section in view.
const navMap = new Map($$('a', links).map((a) => [a.getAttribute('href').slice(1), a]));
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navMap.forEach((a) => a.classList.remove('active'));
    navMap.get(e.target.id)?.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px' });
navMap.forEach((_, id) => { const s = document.getElementById(id); if (s) sectionObs.observe(s); });

/* ---------- Reveal on scroll ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach((el) => revealObs.observe(el));

/* ---------- Sticky image story ---------- */
const steps = $$('.story .step');
const frames = $$('.story .frame img');
const hud = $('#hudLabel');
const bar = $('#storyBar');
function setStep(i) {
  steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
  frames.forEach((f) => f.classList.toggle('is-active', Number(f.dataset.step) === i));
  hud.textContent = steps[i].dataset.label;
  bar.style.width = `${((i + 1) / steps.length) * 100}%`;
}
const stepObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) setStep(steps.indexOf(e.target)); });
}, { rootMargin: '-45% 0px -45% 0px' });
steps.forEach((s) => stepObs.observe(s));
setStep(0);

/* ---------- Route: the truck drives along the line as you scroll ---------- */
const route = $('#route');
const path = $('#routePath');
const done = $('#routeDone');
const truck = $('#routeTruck');
const svg = $('.route-line');
const len = path.getTotalLength();
done.style.strokeDasharray = `${len} ${len}`;
function drawRoute() {
  const r = route.getBoundingClientRect();
  const vh = window.innerHeight;
  const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
  done.style.strokeDashoffset = String(len * (1 - p));
  const pt = path.getPointAtLength(len * p);
  const box = svg.getBoundingClientRect();
  const x = (pt.x / 1000) * box.width;
  const y = (pt.y / 200) * box.height;
  truck.style.transform = `translate(${x}px, ${y + (box.top - r.top)}px)`;
}
let routeTicking = false;
window.addEventListener('scroll', () => {
  if (routeTicking) return;
  routeTicking = true;
  requestAnimationFrame(() => { drawRoute(); routeTicking = false; });
}, { passive: true });
window.addEventListener('resize', drawRoute);
drawRoute();

/* ---------- Quote form ---------- */
const ITEMS = {
  'Equipment hire': ['Excavator', '5-ton shovel (wheel loader)', 'Tipper truck', 'Not sure, advise me'],
  'Materials supply & delivery': ['Murram', 'Sand', 'Ballast', 'Hardcore', 'Building stones', 'Other'],
  Earthworks: ['Mass excavation', 'Trenching', 'Site / bush clearing', 'Grading & levelling', 'Backfilling & compaction', 'Dumping & disposal'],
  'Glass & aluminium': ['Windows', 'Doors', 'Shopfront', 'Office partitions', 'Shower cubicle', 'Other'],
  'Stainless steel': ['Balustrades', 'Handrails', 'Gates / other'],
  'Transport & haulage': ['Site delivery', 'Heavy haulage', 'Spoil removal'],
};
const form = $('#quoteForm');
const service = $('#q-service');
const item = $('#q-item');
const err = $('#formError');

function fillItems() {
  const list = ITEMS[service.value] || [];
  item.innerHTML = list.length
    ? `<option value="">Choose one</option>${list.map((x) => `<option>${x}</option>`).join('')}`
    : '<option value="">Choose a service first</option>';
}
service.addEventListener('change', fillItems);

// Material buttons jump to the form, pre-selected.
$$('.material').forEach((b) => b.addEventListener('click', () => {
  service.value = 'Materials supply & delivery';
  fillItems();
  const m = b.dataset.material;
  item.value = [...item.options].some((o) => o.value === m) ? m : 'Other';
  if (item.value === 'Other' && m !== 'Other material') $('#q-notes').value = m;
  $('#quote').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#q-qty').focus({ preventScroll: true }), 700);
}));

// Today as the earliest date.
$('#q-date').min = new Date().toISOString().slice(0, 10);

// Optional: attach a Google Maps pin of the visitor's current position.
$('#pinBtn').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  const loc = $('#q-loc');
  if (!navigator.geolocation) { btn.textContent = 'Not supported'; return; }
  btn.textContent = 'Locating…';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude: la, longitude: lo } = pos.coords;
      const pin = `https://maps.google.com/?q=${la.toFixed(6)},${lo.toFixed(6)}`;
      loc.value = loc.value ? `${loc.value} (${pin})` : pin;
      btn.textContent = 'Pin added ✓';
    },
    () => { btn.textContent = 'Location blocked'; },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

let channel = 'wa';
$$('button[type=submit]', form).forEach((b) => b.addEventListener('click', () => { channel = b.dataset.channel; }));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const required = ['#q-service', '#q-loc', '#q-name', '#q-phone'].map((s) => $(s));
  required.forEach((f) => f.classList.toggle('invalid', !f.value.trim()));
  const missing = required.filter((f) => !f.value.trim());
  if (missing.length) {
    err.hidden = false;
    err.textContent = 'Please fill in the service, site location, your name and phone.';
    missing[0].focus();
    return;
  }
  err.hidden = true;
  const v = (s) => $(s).value.trim();
  const opt = (s, line) => (v(s) ? line : null);
  const lines = [
    'Hello Besam Logistics, I would like a quote.',
    '',
    `Service: ${v('#q-service')}`,
    opt('#q-item', `Item: ${v('#q-item')}`),
    opt('#q-qty', `Quantity / duration: ${v('#q-qty')}`),
    opt('#q-date', `Date needed: ${v('#q-date')}`),
    `Site location: ${v('#q-loc')}`,
    opt('#q-notes', `Notes: ${v('#q-notes')}`),
    '',
    `Name: ${v('#q-name')}`,
    `Phone: ${v('#q-phone')}`,
  ].filter((x) => x !== null);
  const text = lines.join('\n');
  if (channel === 'email') {
    const subject = `Quote request: ${v('#q-service')}${v('#q-item') ? ` (${v('#q-item')})` : ''}`;
    window.location.href = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  } else {
    window.open(waLink(text), '_blank', 'noopener');
  }
  // Analytics hook: if Google Analytics is added, record the lead.
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: channel, service: v('#q-service') });
});

// Track call and WhatsApp clicks too, once analytics is added.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="tel:"], a[href*="wa.me"]');
  if (a && typeof window.gtag === 'function') window.gtag('event', a.href.startsWith('tel:') ? 'call_click' : 'whatsapp_click');
});
