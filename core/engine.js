/*
 * Mesin inti undangan — dipakai SEMUA tema.
 * Tugas: baca slug dari URL → ambil data klien → muat tema → pasang perilaku umum
 * (buka undangan, musik, hitung mundur, salin rekening, RSVP & ucapan, animasi muncul).
 *
 * Tema cukup menyediakan:
 *   themes/<nama>/theme.css
 *   themes/<nama>/theme.js  → window.UndanganTheme = { render(d, h), mount?(root, d, h), onOpen?(root), renderWish?(w, h) }
 *
 * Atribut yang dikenali mesin di HTML tema:
 *   [data-open]                 tombol buka undangan
 *   [data-music]                tombol musik (kelas .is-playing saat berbunyi)
 *   [data-countdown="ISO"]      berisi [data-cd="d|h|m|s"]
 *   [data-copy="teks"]          salin ke clipboard (opsional data-copied="Tersalin!")
 *   form[data-rsvp]             field: nama, hadir, jumlah, ucapan
 *   [data-wishes]               wadah daftar ucapan
 *   [data-reveal]               dapat kelas .is-in saat terlihat di layar
 */
(function () {
  'use strict';
  const CFG = Object.assign({ apiUrl: '', brand: '', timezone: 'Asia/Jakarta', defaultTheme: '01-boarding-pass' }, window.UNDANGAN_CONFIG || {});
  const qs = new URLSearchParams(location.search);
  const app = document.getElementById('app');

  /* ---------- util ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parseDate = (s) => { if (!s) return null; const d = new Date(String(s).trim().replace(' ', 'T')); return isNaN(d) ? null : d; };
  const split = (s, sep) => String(s || '').split(sep).map((x) => x.trim()).filter(Boolean);
  const fmt = (s, opt) => { const d = parseDate(s); return d ? new Intl.DateTimeFormat('id-ID', opt).format(d) : ''; };
  const pad = (n) => String(n).padStart(2, '0');
  const isDemo = (slug) => slug === 'demo' || slug.startsWith('demo-');

  function getSlug() {
    if (qs.get('id')) return qs.get('id');
    const p = location.pathname.replace(/^\/+|\/+$/g, '');
    if (!p || p === 'index.html') return 'demo';
    return decodeURIComponent(p.split('/')[0]).toLowerCase();
  }

  const h = {
    esc,
    guest: (qs.get('to') || '').trim().slice(0, 60),
    date: (s) => fmt(s, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    dateShort: (s) => fmt(s, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
    time: (s) => fmt(s, { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':'),
    year: (s) => { const d = parseDate(s); return d ? d.getFullYear() : ''; },
    parseDate,
    initials: (...names) => names.map((n) => String(n || '?').trim()[0] || '?').join('').toUpperCase(),
    mapsUrl: (e) => e.maps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([e.place, e.address].filter(Boolean).join(', ')),
    calendarUrl(e, d) {
      const st = parseDate(e.start); if (!st) return '#';
      const en = parseDate(e.end) || new Date(st.getTime() + 2 * 3600e3);
      const f = (x) => `${x.getFullYear()}${pad(x.getMonth() + 1)}${pad(x.getDate())}T${pad(x.getHours())}${pad(x.getMinutes())}00`;
      const p = new URLSearchParams({ action: 'TEMPLATE', text: `${e.title} ${d.groom.nick} & ${d.bride.nick}`, dates: `${f(st)}/${f(en)}`, location: [e.place, e.address].filter(Boolean).join(', '), ctz: CFG.timezone });
      return 'https://calendar.google.com/calendar/render?' + p.toString();
    },
    img(url, alt, cls, fallbackText) {
      if (url) return `<img class="${esc(cls || '')}" src="${esc(url)}" alt="${esc(alt || '')}" loading="lazy" decoding="async">`;
      return `<div class="u-ph ${esc(cls || '')}" role="img" aria-label="${esc(alt || '')}"><span>${esc(fallbackText || '')}</span></div>`;
    },
    brand: CFG.brand,
  };

  /* ---------- data ---------- */
  // Data klien berbentuk "satu baris Google Sheets" (kolom datar) lalu dirapikan di sini,
  // jadi file demo JSON dan Google Sheets memakai format yang sama persis.
  function normalize(r) {
    const person = (p) => ({ name: r[p + '_nama'] || '', nick: r[p + '_panggilan'] || (r[p + '_nama'] || '').split(' ')[0], parents: r[p + '_ortu'] || '', photo: r[p + '_foto'] || '', ig: (r[p + '_ig'] || '').replace(/^@/, '') });
    const event = (k, def) => ({ key: k, title: r[k + '_judul'] || def, start: r[k + '_mulai'], end: r[k + '_selesai'], place: r[k + '_tempat'] || '', address: r[k + '_alamat'] || '', maps: r[k + '_maps'] || '' });
    return {
      slug: r.slug, theme: r.template, until: r.aktif_sampai,
      groom: person('pria'), bride: person('wanita'),
      events: [event('akad', 'Akad Nikah'), event('resepsi', 'Resepsi')].filter((e) => parseDate(e.start)),
      story: split(r.cerita, /\r?\n/).map((l) => { const [date, title, text] = l.split('|').map((s) => (s || '').trim()); return { date, title, text }; }),
      gallery: split(r.galeri, /[\r\n,]+/),
      gifts: split(r.rekening, /\r?\n/).map((l) => { const [bank, number, name] = l.split('|').map((s) => (s || '').trim()); return { bank, number, name }; }).filter((g) => g.number),
      giftAddress: r.alamat_kado || '',
      cover: r.foto_sampul || '', couplephoto: r.foto_berdua || '', music: r.musik || '',
      photoCredit: r.kredit_foto || '',
      quote: r.kutipan || '', quoteSource: r.kutipan_sumber || '',
      showStats: String(r.tampilkan_jumlah_tamu || '').toLowerCase() === 'ya',
      noPhoto: String(r.tanpa_foto || '').toLowerCase() === 'ya',   // versi tanpa foto (ilustrasi)
    };
  }

  async function loadData(slug) {
    let res;
    if (isDemo(slug) || !CFG.apiUrl) {
      res = await fetch('/demo-data/' + encodeURIComponent(slug) + '.json');
      if (!res.ok) throw new Error('notfound');
      const row = await res.json();
      return { data: normalize(row), wishes: row._ucapan || [] };
    }
    res = await fetch(CFG.apiUrl + '?action=get&slug=' + encodeURIComponent(slug));
    const j = await res.json();
    if (!j.ok) throw new Error(j.error || 'notfound');
    return { data: normalize(j.data), wishes: j.wishes || [] };
  }

  /* ---------- tampilan pesan ---------- */
  function message(title, text) {
    document.body.classList.remove('u-locked');
    app.innerHTML = `<div class="u-msg"><h1>${esc(title)}</h1><p>${esc(text)}</p></div>`;
  }

  function loadAsset(tag, attrs) {
    return new Promise((ok, fail) => {
      const el = document.createElement(tag);
      Object.assign(el, attrs);
      el.onload = ok; el.onerror = () => fail(new Error('theme'));
      document.head.appendChild(el);
    });
  }

  /* ---------- perilaku umum ---------- */
  let audio = null;
  function setupMusic(root, d) {
    const btns = root.querySelectorAll('[data-music]');
    if (!d.music) { btns.forEach((b) => b.remove()); return; }
    audio = new Audio(d.music); audio.loop = true; audio.preload = 'none';
    const sync = () => btns.forEach((b) => b.classList.toggle('is-playing', !audio.paused));
    audio.addEventListener('play', sync); audio.addEventListener('pause', sync);
    btns.forEach((b) => b.addEventListener('click', () => (audio.paused ? audio.play().catch(() => {}) : audio.pause())));
    document.addEventListener('visibilitychange', () => { if (document.hidden && audio && !audio.paused) { audio.pause(); audio._resume = true; } else if (!document.hidden && audio && audio._resume) { audio._resume = false; audio.play().catch(() => {}); } });
  }

  function setupOpen(root, Theme) {
    root.querySelectorAll('[data-open]').forEach((btn) => btn.addEventListener('click', async () => {
      btn.disabled = true;
      if (audio) audio.play().catch(() => {});
      if (Theme.onOpen) await Theme.onOpen(root);
      document.body.classList.remove('u-locked');
      document.body.classList.add('u-opened');
      const main = document.getElementById('main');
      if (main) main.scrollIntoView({ behavior: 'smooth' });
    }));
  }

  function setupCountdown(root) {
    root.querySelectorAll('[data-countdown]').forEach((box) => {
      const target = parseDate(box.dataset.countdown); if (!target) return;
      const cells = {}; box.querySelectorAll('[data-cd]').forEach((c) => (cells[c.dataset.cd] = c));
      const tick = () => {
        let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
        const v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
        for (const k in cells) {
          const txt = pad(v[k]);
          if (cells[k].textContent !== txt) { cells[k].textContent = txt; cells[k].classList.remove('u-tick'); void cells[k].offsetWidth; cells[k].classList.add('u-tick'); }
        }
        box.classList.toggle('is-done', s === 0);
      };
      tick(); setInterval(tick, 1000);
    });
  }

  function setupCopy(root) {
    root.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      const text = b.dataset.copy;
      try { await navigator.clipboard.writeText(text); } catch (e) {
        const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
      }
      const old = b.textContent; b.textContent = b.dataset.copied || 'Tersalin!'; b.classList.add('is-copied');
      setTimeout(() => { b.textContent = old; b.classList.remove('is-copied'); }, 1800);
    }));
  }

  const defaultWish = (w, hh) => `<article class="u-wish"><header><b>${hh.esc(w.nama)}</b>${w.kehadiran ? `<span class="u-badge">${hh.esc(w.kehadiran)}</span>` : ''}</header><p>${hh.esc(w.ucapan)}</p></article>`;

  function setupWishes(root, d, wishes, Theme, slug) {
    const list = root.querySelector('[data-wishes]');
    const render = Theme.renderWish || defaultWish;
    const paint = () => { if (list) list.innerHTML = wishes.length ? wishes.map((w) => render(w, h)).join('') : '<p class="u-empty">Belum ada ucapan. Jadilah yang pertama!</p>'; };
    paint();
    root.querySelectorAll('form[data-rsvp]').forEach((form) => {
      if (form.elements.nama && h.guest) form.elements.nama.value = h.guest;
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const f = form.elements;
        const payload = { action: 'rsvp', slug, nama: (f.nama.value || '').trim(), kehadiran: f.hadir ? f.hadir.value : '', jumlah: f.jumlah ? f.jumlah.value : '', ucapan: (f.ucapan ? f.ucapan.value : '').trim() };
        if (!payload.nama) { f.nama.focus(); return; }
        const btn = form.querySelector('[type=submit]'); const label = btn.textContent; btn.disabled = true; btn.textContent = 'Mengirim…';
        try {
          if (CFG.apiUrl && !isDemo(slug)) {
            // text/plain agar tidak memicu CORS preflight di Apps Script
            const r = await fetch(CFG.apiUrl, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
            const j = await r.json(); if (!j.ok) throw new Error(j.error);
          }
          if (payload.ucapan) { wishes.unshift({ nama: payload.nama, kehadiran: payload.kehadiran, ucapan: payload.ucapan }); paint(); }
          form.classList.add('is-sent');
          const note = form.querySelector('[data-rsvp-done]'); if (note) note.hidden = false;
          if (f.ucapan) f.ucapan.value = '';
        } catch (e) {
          alert('Maaf, gagal mengirim. Coba lagi sebentar lagi.');
        } finally { btn.disabled = false; btn.textContent = label; }
      });
    });
  }

  function setupReveal(root) {
    const els = root.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { threshold: 0.15 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- jalan ---------- */
  async function start() {
    const slug = getSlug();
    let pack;
    try { pack = await loadData(slug); } catch (e) {
      if (e.message === 'expired') return message('Undangan telah berakhir', 'Masa aktif undangan ini sudah habis. Terima kasih atas doa dan perhatiannya.');
      return message('Undangan tidak ditemukan', 'Periksa kembali link yang Anda terima.');
    }
    const d = pack.data;
    const until = parseDate(d.until);
    if (until && Date.now() > until.getTime() + 86400e3) return message('Undangan telah berakhir', 'Masa aktif undangan ini sudah habis. Terima kasih atas doa dan perhatiannya.');

    // Di demo, tema bisa diganti lewat ?theme= agar satu data contoh dipakai semua katalog.
    let theme = (isDemo(slug) && qs.get('theme')) || d.theme || CFG.defaultTheme;
    theme = theme.replace(/[^a-z0-9-]/gi, '');
    try {
      await Promise.all([
        loadAsset('link', { rel: 'stylesheet', href: `/themes/${theme}/theme.css` }),
        loadAsset('script', { src: `/themes/${theme}/theme.js` }),
      ]);
    } catch (e) { return message('Tema tidak ditemukan', `Tema "${theme}" belum tersedia.`); }

    const Theme = window.UndanganTheme;
    document.title = `The Wedding of ${d.groom.nick} & ${d.bride.nick}`;
    document.body.dataset.theme = theme;
    app.innerHTML = Theme.render(d, h);
    setupMusic(app, d);
    setupOpen(app, Theme);
    setupCountdown(app);
    setupCopy(app);
    setupWishes(app, d, pack.wishes, Theme, slug);
    setupReveal(app);
    if (Theme.mount) Theme.mount(app, d, h);
    window.scrollTo(0, 0);
    if (qs.get('shot')) shotMode(qs.get('shot'));
  }

  // Mode foto untuk gambar katalog: ?shot=cover|hero|couple|countdown|events|story|gallery|rsvp|gift|wishes
  // Semua animasi dimatikan dan halaman langsung diarahkan ke bagian yang diminta.
  function shotMode(name) {
    document.documentElement.classList.add('u-shot');
    app.querySelectorAll('[data-reveal], .kg-dev').forEach((e) => e.classList.add('is-in'));
    const imgs = [...app.querySelectorAll('img')];
    imgs.forEach((i) => (i.loading = 'eager'));
    const go = () => {
      if (name === 'cover') return;
      document.body.classList.remove('u-locked');
      document.body.classList.add('u-opened');
      const cover = document.getElementById('cover'); if (cover) cover.style.display = 'none';
      const target = app.querySelector(`[data-shot="${name.replace(/[^a-z-]/g, '')}"]`);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + Number(qs.get('offset') || -28), behavior: 'instant' });
    };
    go();
    // tandai siap setelah semua gambar & font termuat (dipakai pembuat gambar katalog)
    Promise.all([document.fonts.ready, ...imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.addEventListener('load', r); i.addEventListener('error', r); })))])
      .then(() => Promise.all(imgs.map((i) => (i.decode ? i.decode().catch(() => {}) : 0))))
      .then(() => { go(); setTimeout(() => (document.body.dataset.shotReady = '1'), 200); });
  }
  start();
})();
