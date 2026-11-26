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
  // Kolom Sheets "zona_waktu": WIB / WITA / WIT (kosong = WIB). Dipakai untuk label jam & tombol kalender.
  const ZONA = { WIB: 'Asia/Jakarta', WITA: 'Asia/Makassar', WIT: 'Asia/Jayapura' };
  const zonaOf = (s) => { const z = String(s || '').toUpperCase().trim(); return ZONA[z] ? z : 'WIB'; };

  /* ---------- util ---------- */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const parseDate = (s) => { if (!s) return null; const d = new Date(String(s).trim().replace(' ', 'T')); return isNaN(d) ? null : d; };
  const split = (s, sep) => String(s || '').split(sep).map((x) => x.trim()).filter(Boolean);
  const fmt = (s, opt) => { const d = parseDate(s); return d ? new Intl.DateTimeFormat('id-ID', opt).format(d) : ''; };
  const pad = (n) => String(n).padStart(2, '0');
  // demo = data contoh (RSVP tidak dikirim ke Sheets). "ad001" dst. = demo per SKU yang datanya di Google Sheets.
  const isSkuDemo = (slug) => /^ad\d+$/i.test(slug);
  const isDemo = (slug) => slug === 'demo' || slug.startsWith('demo-') || isSkuDemo(slug);
  const BASE = String(CFG.base || '').replace(/\/+$/, '');
  // kode SKU (mis. AD002, tidak peka huruf besar/kecil) → nama folder tema (lihat config.js → sku)
  const skuTheme = (v) => { const k = Object.keys(CFG.sku || {}).find((x) => x.toLowerCase() === String(v || '').trim().toLowerCase()); return k ? CFG.sku[k] : ''; };

  // Alamat foto/musik dari data: link Google Drive (dibagikan "siapa saja yang memiliki link") diubah jadi
  // gambar/audio langsung; alamat pendek "/assets/..." diberi awalan subfolder situs bila perlu.
  function media(url, kind) {
    const u = String(url || '').trim();
    if (!u) return '';
    const m = u.match(/(?:drive|docs)\.google\.com\/(?:file\/d\/|open\?(?:[^#]*&)?id=|uc\?(?:[^#]*&)?id=)([\w-]{20,})/);
    if (m) return kind === 'audio' ? `https://drive.google.com/uc?export=download&id=${m[1]}` : `https://lh3.googleusercontent.com/d/${m[1]}=w1600`;
    if (BASE && u.startsWith('/') && !u.startsWith('//') && !u.startsWith(BASE + '/')) return BASE + u;
    return u;
  }

  function getSlug() {
    if (qs.get('id')) return qs.get('id');
    // CFG.base: situs di subfolder (mis. GitHub Pages "/aksaradigitalco"), diisi otomatis saat build
    const base = String(CFG.base || '').replace(/\/+$/, '');
    let path = location.pathname;
    if (base && (path === base || path.startsWith(base + '/'))) path = path.slice(base.length);
    const p = path.replace(/^\/+|\/+$/g, '');
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
      const p = new URLSearchParams({ action: 'TEMPLATE', text: `${e.title} ${d.groom.nick} & ${d.bride.nick}`, dates: `${f(st)}/${f(en)}`, location: [e.place, e.address].filter(Boolean).join(', '), ctz: ZONA[e.tz] || CFG.timezone });
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
    const person = (p) => ({ name: r[p + '_nama'] || '', nick: r[p + '_panggilan'] || (r[p + '_nama'] || '').split(' ')[0], parents: r[p + '_ortu'] || '', photo: media(r[p + '_foto']), ig: (r[p + '_ig'] || '').replace(/^@/, '') });
    const tz = zonaOf(r.zona_waktu);
    const event = (k, def) => ({ key: k, title: r[k + '_judul'] || def, start: r[k + '_mulai'], end: r[k + '_selesai'], place: r[k + '_tempat'] || '', address: r[k + '_alamat'] || '', maps: r[k + '_maps'] || '', tz });
    return {
      slug: r.slug, theme: r.template, until: r.aktif_sampai, tz,
      groom: person('pria'), bride: person('wanita'),
      events: [event('akad', 'Akad Nikah'), event('resepsi', 'Resepsi')].filter((e) => parseDate(e.start)),
      story: split(r.cerita, /\r?\n/).map((l) => { const [date, title, text] = l.split('|').map((s) => (s || '').trim()); return { date, title, text }; }),
      gallery: split(r.galeri, /[\r\n,]+/).map((u) => media(u)),
      gifts: split(r.rekening, /\r?\n/).map((l) => { const [bank, number, name] = l.split('|').map((s) => (s || '').trim()); return { bank, number, name }; }).filter((g) => g.number),
      giftAddress: r.alamat_kado || '',
      cover: media(r.foto_sampul), couplephoto: media(r.foto_berdua), music: /^(-|tidak|tanpa)$/i.test(String(r.musik || '').trim()) ? '' : media(r.musik, 'audio'),
      noMusic: /^(-|tidak|tanpa)$/i.test(String(r.musik || '').trim()),   // "-" / "tidak" = tanpa musik
      layout: r.tampilan || '',   // "slide" = per halaman, kosong = gulir biasa
      photoCredit: r.kredit_foto || '',
      quote: r.kutipan || '', quoteSource: r.kutipan_sumber || '',
      showStats: String(r.tampilkan_jumlah_tamu || '').toLowerCase() === 'ya',
      noPhoto: String(r.tanpa_foto || '').toLowerCase() === 'ya',   // versi tanpa foto (ilustrasi)
    };
  }

  async function loadFile(name) {
    const res = await fetch('/demo-data/' + encodeURIComponent(name) + '.json');
    if (!res.ok) throw new Error('notfound');
    const row = await res.json();
    return { data: normalize(row), wishes: row._ucapan || [] };
  }

  async function loadData(slug) {
    const fromSheet = slug !== 'demo' && !slug.startsWith('demo-') && CFG.apiUrl;
    if (fromSheet) {
      try {
        const res = await fetch(CFG.apiUrl + '?action=get&slug=' + encodeURIComponent(slug));
        const j = await res.json();
        if (j.ok) return { data: normalize(j.data), wishes: j.wishes || [] };
        if (!isSkuDemo(slug)) throw new Error(j.error || 'notfound');
      } catch (e) { if (!isSkuDemo(slug)) throw e; }
    } else if (!isSkuDemo(slug)) return loadFile(slug);
    // demo SKU (mis. /ad011) belum ada di Sheets / Sheets gagal dimuat → pakai data demo bawaan tema
    const theme = skuTheme(slug);
    if (!theme) throw new Error('notfound');
    const meta = await (await fetch(`/themes/${theme}/meta.json`)).json();
    const pack = await loadFile(meta.demo);
    pack.data.theme = theme;
    return pack;
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
      if (document.body.classList.contains('u-slide')) window.scrollTo({ top: 0, behavior: 'instant' });
      else if (main) main.scrollIntoView({ behavior: 'smooth' });
    }));
  }

  /* ---------- mode slide (kolom Sheets "tampilan" = slide, atau ?tampilan=slide) ----------
   * Setiap anak langsung <main id="main"> (section/footer) jadi satu halaman. Pindah halaman lewat
   * tombol ‹ ›, titik, geser kiri/kanan, atau panah keyboard. Section yang lebih panjang dari layar
   * tetap bisa digulir di dalam halamannya sendiri. */
  // "slide" = per halaman & berjalan otomatis; "slide-manual" = per halaman tanpa otomatis.
  const layoutOf = (d) => (qs.get('tampilan') || d.layout || CFG.tampilan || '').toLowerCase().trim();
  function slideMode(d) { return /^slide(-manual)?$/.test(layoutOf(d)); }

  // Menu bawah mode slide. Halaman dikenali dari penanda data-shot tema (couple, events, ...),
  // lalu dari judul halaman, lalu kecocokan cadangan. Urutan baris = prioritas.
  // [label, regex judul, ikon, regex cadangan, kunci data-shot]
  const DOCK = [
    ['Mempelai', /mempelai|pemeran|dua hati|seniman|featuring|starring|dua bintang/i, '<path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21z"/>', null, 'couple'],
    ['Acara', /rangkaian acara|waktu & tempat|jadwal|agenda|itinerary/i, '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>', /menuju hari|hitung/i, 'events'],
    ['Lokasi', /lokasi acara|penunjuk arah/i, '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>', null, 'maps'],
    ['Galeri', /galeri|album|photo essay|movie stills/i, '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/>', null, 'gallery'],
    ['RSVP', /konfirmasi|kehadiran|rsvp|check-in|reservasi|buku tamu/i, '<path d="M4 5.5h16v11H8.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>', null, 'rsvp'],
    ['Hadiah', /amplop|kirim hadiah|tanda kasih|tip jar/i, '<rect x="3.5" y="9" width="17" height="11" rx="1.5"/><path d="M2.5 9h19M12 9v11M12 9S10.5 4 7.8 4.6C5.4 5.2 7 9 12 9zm0 0s1.5-5 4.2-4.4C18.6 5.2 17 9 12 9z"/>', null, 'gift'],
    ['Ucapan', /ucapan|doa/i, '<path d="M20 12.5a7.5 7.5 0 0 1-11 6.6L4 20l1.1-4.5A7.5 7.5 0 1 1 20 12.5z"/>', null, 'wishes'],
  ];

  function buildDock(slides, meta, go) {
    if (document.querySelector('#app > nav')) return null;   // tema sudah punya menu bawah sendiri
    const items = [];
    const heads = slides.map((s, i) => { const hd = s.querySelector('h2, h3'); return i && hd ? hd.textContent : ''; });
    const shots = slides.map((s, i) => (i ? [s.dataset.shot, ...[...s.querySelectorAll('[data-shot]')].map((x) => x.dataset.shot)].filter(Boolean) : []));
    const free = (label, i) => !items.some((y) => y.label === label || y.i === i);
    // 1) penanda data-shot, 2) judul halaman, 3) cadangan (mis. jadwal acara yang menyatu dengan hitung mundur)
    slides.forEach((_, i) => { for (const x of DOCK) if (shots[i].includes(x[4]) && free(x[0], i)) { items.push({ label: x[0], icon: x[2], i }); break; } });
    for (const pass of [1, 3]) heads.forEach((t, i) => {
      if (!t) return;
      const it = DOCK.find((x) => x[pass] && x[pass].test(t) && free(x[0], i));
      if (it) items.push({ label: it[0], icon: it[2], i });
    });
    items.sort((a, b) => a.i - b.i);
    if (items.length < 3) return null;
    const w = meta.warna || {}, f = meta.font || {};
    const dock = document.createElement('nav');
    dock.className = 'u-dock';
    dock.setAttribute('aria-label', 'Menu undangan');
    dock.style.cssText = `--dock-bg:${w.bg || '#1d1d1f'};--dock-ac:${w.aksen || '#c9a24a'};--dock-tx:${w.teks || '#fff'};--dock-font:${f.label || 'system-ui, sans-serif'}`;
    const svg = (p) => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
    dock.innerHTML = items.map((it) => `<button type="button" data-goto="${it.i}">${svg(it.icon)}<span>${it.label}</span></button>`).join('');
    const music = document.querySelector('#app [data-music]');
    if (music) {   // tombol musik tema dipindah ke menu bawah
      dock.insertAdjacentHTML('beforeend', `<button type="button" class="u-dock__music" aria-label="Putar/hentikan musik">${svg('<path class="u-eq" d="M6 16V9M10 18V6M14 16V9M18 14v-3"/>')}<span>Musik</span></button>`);
      const mb = dock.querySelector('.u-dock__music');
      mb.addEventListener('click', () => music.click());
      const sync = () => mb.classList.toggle('is-playing', music.classList.contains('is-playing'));
      new MutationObserver(sync).observe(music, { attributes: true, attributeFilter: ['class'] }); sync();
      document.body.classList.add('u-dock-music');
    }
    dock.addEventListener('click', (e) => { const b = e.target.closest('[data-goto]'); if (b) go(Number(b.dataset.goto)); });
    document.body.appendChild(dock);
    document.body.classList.add('u-has-dock');
    const btns = [...dock.querySelectorAll('[data-goto]')];
    return (cur) => {   // tandai item untuk halaman yang sedang tampil (atau item terakhir sebelum halaman ini)
      let on = null; btns.forEach((b) => { if (Number(b.dataset.goto) <= cur) on = b; });
      btns.forEach((b) => b.classList.toggle('is-on', b === on));
      if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
      document.body.classList.toggle('u-slide-first', cur === 0);
    };
  }

  function setupSlides(meta, auto) {
    const main = document.getElementById('main');
    const slides = main ? [...main.children] : [];
    if (slides.length < 2) return;
    // Rata tengah vertikal hanya untuk halaman berpenataan biasa (block); sampul/hero yang memakai
    // grid/flex sendiri dibiarkan agar tata letaknya tidak bergeser.
    slides.forEach((s) => { if (getComputedStyle(s).display === 'block') s.classList.add('u-slide-center'); });
    document.body.classList.add('u-slide');
    const nav = document.createElement('nav');
    nav.className = 'u-slidenav';
    nav.setAttribute('aria-label', 'Pindah halaman');
    nav.innerHTML = `<button type="button" class="u-slidenav__btn" data-dir="-1" aria-label="Halaman sebelumnya">‹</button>`
      + `<span class="u-slidenav__dots">${slides.map((_, i) => `<i data-i="${i}" title="Halaman ${i + 1}"></i>`).join('')}</span>`
      + `<button type="button" class="u-slidenav__btn" data-dir="1" aria-label="Halaman berikutnya">›</button>`;
    document.body.appendChild(nav);
    const dots = [...nav.querySelectorAll('[data-i]')];
    const prev = nav.querySelector('[data-dir="-1"]'), next = nav.querySelector('[data-dir="1"]');
    let cur = -1;
    let markDock = null;
    const go = (i) => {
      i = Math.max(0, Math.min(slides.length - 1, i));
      if (i === cur) return;
      const s = slides[i], dir = i > cur ? 'next' : 'prev';
      slides.forEach((el, k) => el.classList.toggle('u-slide-on', k === i));
      s.classList.remove('u-slide-in-next', 'u-slide-in-prev'); void s.offsetWidth; s.classList.add('u-slide-in-' + dir);
      s.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'));
      cur = i;
      dots.forEach((dt, k) => dt.classList.toggle('is-on', k === i));
      if (markDock) markDock(i);
      prev.disabled = i === 0; next.disabled = i === slides.length - 1;
      if (document.body.classList.contains('u-opened')) window.scrollTo({ top: main.getBoundingClientRect().top + window.scrollY, behavior: 'instant' });
      elapsed = 0; userScrolled = false;   // slide otomatis mulai dari awal untuk halaman ini
    };
    let elapsed = 0, userScrolled = false, holdUntil = 0;
    nav.addEventListener('click', (e) => {
      const b = e.target.closest('[data-dir]'); if (b) return go(cur + Number(b.dataset.dir));
      const dt = e.target.closest('[data-i]'); if (dt) go(Number(dt.dataset.i));
    });
    // geser kiri/kanan (bukan saat mengetik di form RSVP)
    let sx = 0, sy = 0;
    main.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    main.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && !e.target.closest('input, textarea, select, iframe')) go(cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
    // Ketuk layar: sisi kiri (30%) = kembali, sisanya = lanjut — seperti story. Tombol, tautan, form,
    // foto galeri (data-zoom), peta & teks yang sedang diseleksi tidak ikut memindah halaman.
    let moved = false;
    main.addEventListener('touchmove', () => { moved = true; }, { passive: true });
    main.addEventListener('touchstart', () => { moved = false; }, { passive: true });
    main.addEventListener('click', (e) => {
      if (moved || !document.body.classList.contains('u-opened')) return;
      if (e.target.closest('a, button, input, textarea, select, label, iframe, video, audio, summary, details, [data-zoom], [data-copy], [role="button"], [role="tab"], [contenteditable]')) return;
      if (String(window.getSelection && window.getSelection()).trim()) return;
      const r = main.getBoundingClientRect();
      go(cur + ((e.clientX - r.left) < r.width * 0.3 ? -1 : 1));
      hideHint();
    });
    // petunjuk singkat sekali di awal
    let hint = null;
    const hideHint = () => { if (hint) { hint.classList.remove('is-on'); setTimeout(() => hint && hint.remove(), 400); hint = null; } };
    document.querySelectorAll('[data-open]').forEach((b) => b.addEventListener('click', () => {
      if (hint || sessionStorage.getItem('u-hint')) return;
      try { sessionStorage.setItem('u-hint', '1'); } catch (err) { /* abaikan */ }
      hint = document.createElement('div'); hint.className = 'u-hint';
      hint.innerHTML = '<span>Ketuk layar untuk lanjut</span><b>›</b>';
      const w = meta.warna || {}; hint.style.cssText = `--dock-bg:${w.bg || '#1d1d1f'};--dock-ac:${w.aksen || '#c9a24a'};--dock-tx:${w.teks || '#fff'}`;
      document.body.appendChild(hint); requestAnimationFrame(() => setTimeout(() => hint && hint.classList.add('is-on'), 600));
      setTimeout(hideHint, 4200);
    }, { once: true }));
    document.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('u-opened') || e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight') go(cur + 1);
      if (e.key === 'ArrowLeft') go(cur - 1);
    });
    // Menu/tombol tema yang menggulir ke suatu bagian → pindah ke halaman yang memuat bagian itu.
    const slideOf = (el) => slides.findIndex((s) => s === el || s.contains(el));
    const origScroll = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function (...args) {
      const k = slideOf(this);
      if (k >= 0 && k !== cur) { go(k); if (this !== slides[k]) origScroll.apply(this, args); return; }
      return origScroll.apply(this, args);
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return;
      const t = document.getElementById(a.getAttribute('href').slice(1)); const k = t ? slideOf(t) : -1;
      if (k >= 0) { e.preventDefault(); go(k); if (t !== slides[k]) origScroll.call(t, { behavior: 'smooth' }); }
    });
    markDock = buildDock(slides, meta, go);
    // titik hanya dipakai bila tidak ada menu bawah (menu tema sendiri / judul halaman tidak dikenali)
    if (markDock || document.querySelector('#app > nav')) nav.classList.add('u-slidenav--nodots');
    go(0);
    if (auto) setupAutoSlide();

    /* Slide otomatis: tiap halaman tampil ±7 detik (+ waktu tambahan untuk halaman yang lebih panjang dari
     * layar; halaman panjang digulir pelan ke bawah), lalu pindah sendiri. Berhenti di halaman terakhir.
     * Jeda bila tamu sedang berinteraksi: menggulir, mengisi form, membuka foto, atau tab tidak aktif. */
    function setupAutoSlide() {
      const BASE = (Number(CFG.slideDetik) || 7) * 1000;
      const bar = document.createElement('div');
      bar.className = 'u-progress';
      const w = meta.warna || {}; bar.style.setProperty('--dock-ac', w.aksen || '#fff');
      bar.innerHTML = '<i></i>';
      document.body.appendChild(bar);
      const fill = bar.firstChild;
      const hold = (ms) => { holdUntil = Math.max(holdUntil, performance.now() + ms); };
      const userScroll = () => { userScrolled = true; hold(6000); };
      addEventListener('wheel', userScroll, { passive: true });
      main.addEventListener('touchmove', userScroll, { passive: true });
      addEventListener('keydown', (e) => { if (/Arrow(Up|Down)|Page|Home|End|Space/.test(e.code)) userScroll(); });
      const busy = () => {
        const a = document.activeElement;
        if (a && a.matches && a.matches('input, textarea, select')) return true;   // sedang mengisi RSVP
        if ([...document.querySelectorAll('[class*="lightbox"]')].some((l) => !l.hidden && l.offsetParent !== null)) return true;   // melihat foto
        return false;
      };
      let last = performance.now();
      const tick = (now) => {
        const dt = Math.min(100, now - last); last = now;
        const s = slides[cur];
        const opened = document.body.classList.contains('u-opened');
        const lastSlide = cur >= slides.length - 1;
        const extra = Math.max(0, s.offsetHeight - innerHeight);
        const dur = BASE + (extra / innerHeight) * 5000;
        const paused = !opened || document.hidden || busy() || now < holdUntil;
        if (!paused && !lastSlide) elapsed += dt;
        const p = Math.min(1, elapsed / dur);
        bar.classList.toggle('is-on', opened && !lastSlide);
        bar.classList.toggle('is-paused', paused);
        fill.style.transform = `scaleX(${p})`;
        // halaman panjang: gulir pelan dari atas ke bawah (kecuali tamu sudah menggulir sendiri)
        if (!paused && extra > 0 && !userScrolled) {
          const top = main.getBoundingClientRect().top + window.scrollY;
          const q = Math.min(1, Math.max(0, (p - 0.12) / 0.78));
          window.scrollTo({ top: top + extra * q, behavior: 'instant' });
        }
        if (p >= 1 && !lastSlide) go(cur + 1);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
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
    let theme = String((isDemo(slug) && qs.get('theme')) || d.theme || CFG.defaultTheme).trim();
    if (skuTheme(theme)) theme = skuTheme(theme);
    else if (/^ad\d+$/i.test(theme)) return message('Tema tidak ditemukan', `Kode tema "${theme.toUpperCase()}" belum terdaftar.`);
    theme = theme.replace(/[^a-z0-9-]/gi, '');
    try {
      await Promise.all([
        loadAsset('link', { rel: 'stylesheet', href: `/themes/${theme}/theme.css` }),
        loadAsset('script', { src: `/themes/${theme}/theme.js` }),
      ]);
    } catch (e) { return message('Tema tidak ditemukan', `Tema "${theme}" belum tersedia.`); }

    const Theme = window.UndanganTheme;
    if (!Theme || typeof Theme.render !== 'function') return message('Tema tidak ditemukan', `Tema "${theme}" belum tersedia.`);
    let meta = {};
    try { meta = await (await fetch(`/themes/${theme}/meta.json`)).json(); } catch (e) { /* abaikan */ }
    // Kolom musik kosong → lagu default tema (meta.json "musik"), lalu config.musikDefault.
    // Demo yang temanya diganti lewat ?theme= memakai lagu tema itu (bukan lagu data demo umum).
    const demoTheme = isDemo(slug) && qs.get('theme') && meta.musik;
    if (!d.noMusic && (!d.music || demoTheme)) d.music = media((demoTheme && meta.musik) || d.music || meta.musik || CFG.musikDefault || '', 'audio');
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
    if (!qs.get('shot') && slideMode(d)) setupSlides(meta, layoutOf(d) !== 'slide-manual' && qs.get('otomatis') !== '0');
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
