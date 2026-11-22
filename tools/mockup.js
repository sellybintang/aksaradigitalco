/* Pembuat gambar katalog: menyusun layar undangan asli (iframe mode foto) ke dalam
 * komposisi 1080×1080.
 *  - Per tema   : ?theme=<tema>&layout=utama|nama-tamu|fitur|tampilan|cara-order
 *                 (warna & font dari themes/<tema>/meta.json)
 *  - Gabungan   : ?layout=koleksi-kipas|koleksi-grid|koleksi-deret
 *                 (tema diambil dari config.js → katalog.koleksi) */
(async function () {
  const qs = new URLSearchParams(location.search);
  const layout = qs.get('layout') || 'utama';
  const CFG = window.UNDANGAN_CONFIG || {};
  const KAT = Object.assign({ koleksi: [], proses: '1×24 jam', revisi: '2× revisi', aktif: '6 bulan', fasilitas: [] }, CFG.katalog || {});
  const stage = document.getElementById('stage');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const loadFont = (url) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = url; document.head.appendChild(l); };
  const brand = CFG.brand ? `<span class="brand">${esc(CFG.brand)}</span>` : '';
  const domain = CFG.domain || 'tokoanda.com';
  // varian tema: "19-nusantara~tanpa-foto" → meta.json ditimpa meta.tanpa-foto.json (demo/nama berbeda)
  const getMeta = async (t) => {
    const [id, v] = t.split('~');
    const base = await (await fetch(`/themes/${id}/meta.json`)).json();
    const extra = v ? await (await fetch(`/themes/${id}/meta.${v}.json`)).json() : {};
    return Object.assign(base, extra, { id, layar: Object.assign({}, base.layar, extra.layar) });
  };

  // satu layar undangan (iframe) — sebagai kartu atau ponsel berbingkai
  const screen = (meta, shot, s, opt = {}) => {
    const src = `/${meta.demo}?theme=${meta.id}&shot=${shot}&to=${encodeURIComponent(opt.guest || 'Budi Santoso')}`;
    return `
    <div class="${opt.phone ? 'ph' : 'card'} ${opt.cls || ''}" style="--s:${s};${opt.style || ''}">
      <div class="scr"><iframe src="${src}" width="390" height="844" scrolling="no" tabindex="-1"></iframe></div>
    </div>`;
  };

  const FITUR = ['Nama tamu otomatis di setiap link', 'Hitung mundur hari H', 'RSVP & buku ucapan', 'Amplop digital — salin rekening sekali ketuk', 'Galeri foto & kisah cinta', 'Peta lokasi & simpan ke kalender', 'Musik latar', 'Masa aktif sesuai paket'];
  const PILL = ['Nama Tamu Otomatis', 'RSVP', 'Amplop Digital', 'Galeri', 'Musik', 'Maps'];
  const LANGKAH = [
    ['Pilih tema & checkout', 'Pilih tema favorit lalu selesaikan pesanan di Shopee.'],
    ['Kirim data', 'Kirim nama mempelai, jadwal acara, dan foto lewat chat Shopee.'],
    [`Jadi maks. ${KAT.proses}`, `Kami kirimkan link untuk dicek. ${KAT.revisi} sampai cocok.`],
    ['Bagikan ke tamu', `Satu link per tamu dengan namanya sendiri. Aktif ${KAT.aktif}.`],
  ];

  // ikon garis sederhana untuk kartu fasilitas
  const IKON = {
    'Request Musik': '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    'Bebas Revisi': '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
    'Maks. 1×24 Jam Jadi': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'Nama Tamu Tanpa Batas': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.5-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c2 .7 3.2 2.6 3.5 5.5"/>',
    'Link Custom': '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    'Aktif 6 Bulan': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'Rekap RSVP & Ucapan': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    'Template Pesan WA': '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 10h6M9 13h4"/>',
  };
  const ikon = (t) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${IKON[t] || '<path d="M5 12l4 4 10-10"/>'}</svg>`;

  /* ---------------- layout per tema ---------------- */
  const perTema = (meta) => ({
    utama: () => {
      const cols = [0, 1, 2, 3].map((c) => `<div class="col" style="--y:${[-150, 40, -70, 120][c]}px">${screen(meta, meta.layar.kolase[c * 2], .46)}${screen(meta, meta.layar.kolase[c * 2 + 1], .46)}</div>`).join('');
      return `
        <div class="bg-grain"></div>
        <div class="collage">${cols}</div>
        <div class="vignette"></div>
        <header class="head">
          <small>Undangan Digital · Website</small>
          <h1>${esc(meta.nama)}</h1>
          <p>${esc(meta.tagline)}</p>
        </header>
        <div class="seal"><span>PREMIUM</span><b>EDITION</b></div>
        ${screen(meta, meta.layar.utama, .74, { phone: true, cls: 'hero-phone' })}
        <footer class="bar"><div class="pills">${PILL.map((p) => `<span>${esc(p)}</span>`).join('')}</div>${brand}</footer>`;
    },
    fitur: () => `
      <div class="bg-grain"></div>
      <section class="fitur">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Fitur<br>Lengkap</h1>
        <ul>${FITUR.map((f) => (f.startsWith('Galeri') && meta.fiturGaleri ? meta.fiturGaleri : f)).map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        ${brand}
      </section>
      <div class="trio">
        ${screen(meta, meta.layar.fitur[0], .58, { phone: true, cls: 'p1' })}
        ${screen(meta, meta.layar.fitur[1], .58, { phone: true, cls: 'p2' })}
        ${screen(meta, meta.layar.fitur[2], .58, { phone: true, cls: 'p3' })}
      </div>`,
    'nama-tamu': () => `
      <div class="bg-grain"></div>
      <header class="nt-head">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Nama Tamu Otomatis</h1>
        <p>Satu undangan, setiap tamu mendapat link dengan namanya sendiri.</p>
      </header>
      <div class="nt-pair">
        <figure class="nt-back">${screen(meta, 'cover', .56, { phone: true, guest: 'Keluarga Bpk. Ahmad' })}<figcaption>${esc(domain)}/raka-nadia?to=<b>Keluarga+Bpk.+Ahmad</b></figcaption></figure>
        <figure class="nt-front">${screen(meta, 'cover', .66, { phone: true, guest: 'Budi Santoso' })}<figcaption>${esc(domain)}/raka-nadia?to=<b>Budi+Santoso</b></figcaption></figure>
      </div>
      <footer class="nt-foot">Tinggal salin &amp; kirim lewat WhatsApp ${brand ? '· ' + brand : ''}</footer>`,
    tampilan: () => {
      const items = meta.layar.tampilan || [['hero', 'Pembuka'], ['countdown', 'Hitung Mundur'], ['events', 'Acara'], ['gallery', 'Galeri']];
      return `
      <div class="bg-grain"></div>
      <header class="tp-head">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Tampilan Lengkap</h1>
        <p>Satu halaman berisi semua informasi untuk tamu Anda.</p>
      </header>
      <div class="tp-row">${items.map(([shot, label], i) => `
        <figure style="--y:${[30, 0, 40, 10][i % 4]}px">${screen(meta, shot, .54, { phone: true })}<figcaption>${esc(label)}</figcaption></figure>`).join('')}
      </div>
      <footer class="tp-foot">${PILL.map((p) => `<span>${esc(p)}</span>`).join('')}</footer>`;
    },
    fasilitas: () => `
      <div class="bg-grain"></div>
      <header class="fs-head">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Fasilitas &amp; Bonus</h1>
        <p>Semua sudah termasuk dalam satu harga.</p>
      </header>
      <div class="fs-grid">${KAT.fasilitas.map(([t, d]) => `<div class="fs-card"><i>${ikon(t)}</i><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`).join('')}</div>
      <footer class="fs-foot">${brand}</footer>`,
    'cara-order': () => `
      <div class="bg-grain"></div>
      <section class="co-list">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Cara Order</h1>
        <ol>${LANGKAH.map(([t, d], i) => `<li><b>${i + 1}</b><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></li>`).join('')}</ol>
        ${brand}
      </section>
      <div class="co-phone">${screen(meta, 'cover', .92, { phone: true })}<span class="co-badge">Maks.<br><b>${esc(KAT.proses)}</b></span></div>`,
  });

  /* ---------------- layout gabungan (bundel) ---------------- */
  const koleksi = (metas) => {
    const n = metas.length;
    const judul = `${n} Tema Premium`;
    const label = (m) => `<span class="kl-name">${esc(m.nama)}</span>`;
    return {
      'koleksi-kipas': () => {
        const mid = (n - 1) / 2;
        return `
        <div class="bg-grain"></div>
        <header class="kl-head">
          <small>Undangan Digital · Website</small>
          <h1>${judul}</h1>
          <p>Pilih satu tema, nama tamu otomatis di setiap link.</p>
        </header>
        <div class="kl-fan">${metas.map((m, i) => {
          const a = (i - mid) * 7, z = 10 - Math.round(Math.abs(i - mid) * 2);
          return `<figure style="--a:${a}deg;z-index:${z}">${screen(m, 'cover', .48, { phone: true })}${label(m)}</figure>`;
        }).join('')}</div>
        <div class="kl-fan-names">${metas.map((m) => `<span>${esc(m.nama)}</span>`).join('')}</div>
        <footer class="kl-bar"><div class="pills">${PILL.map((p) => `<span>${esc(p)}</span>`).join('')}</div>${brand}</footer>`;
      },
      'koleksi-grid': () => `
        <div class="bg-grain"></div>
        <header class="kl-grid-head">
          <div><small>Undangan Digital · Website</small><h1>Pilih Tema<br>Favoritmu</h1></div>
          <div class="kl-seal"><b>${n}</b><span>Tema<br>Premium</span></div>
        </header>
        <div class="kl-grid">${metas.map((m, i) => `
          <figure class="${i >= 4 ? 'kl-r2' : ''}">${screen(m, 'cover', .3, { phone: true })}${label(m)}</figure>`).join('')}
        </div>
        <footer class="kl-grid-foot">Nama tamu otomatis · RSVP · Amplop digital · Galeri · Musik ${brand ? '· ' + brand : ''}</footer>`,
      'koleksi-deret': () => `
        <div class="bg-grain"></div>
        <div class="kl-cascade">${metas.map((m, i) => `
          <figure style="--x:${30 + i * 122}px;--y:${560 - i * 50}px;z-index:${i + 1}">${screen(m, 'cover', .46, { phone: true })}${label(m)}</figure>`).join('')}
        </div>
        <header class="kl-deret-head">
          <small>Undangan Digital · Website</small>
          <h1>Undangan<br>Premium</h1>
          <p>${n} pilihan tema eksklusif</p>
        </header>
        <div class="kl-deret-seal"><span>Nama Tamu</span><b>Otomatis</b></div>
        <footer class="kl-deret-foot">${brand}</footer>`,
    };
  };

  /* ---------------- jalankan ---------------- */
  let html;
  if (layout.startsWith('koleksi')) {
    const list = (qs.get('themes') ? qs.get('themes').split(',') : KAT.koleksi).map((t) => t.replace(/[^a-z0-9-]/gi, ''));
    const metas = await Promise.all(list.map(getMeta));
    loadFont('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;1,500&family=Inter:wght@400;500;600&display=swap');
    stage.className = 'l-' + layout + (layout === 'koleksi-grid' ? '' : ' is-koleksi-light');
    const L = koleksi(metas);
    html = (L[layout] || L['koleksi-kipas'])();
  } else {
    const meta = await getMeta((qs.get('theme') || '01-boarding-pass').replace(/[^a-z0-9~-]/gi, ''));
    const st = stage.style;
    Object.entries(meta.warna).forEach(([k, v]) => st.setProperty('--' + k, v));
    st.setProperty('--f-judul', meta.font.judul);
    st.setProperty('--f-label', meta.font.label);
    loadFont(meta.font.url);
    stage.className = 'l-' + layout + (meta.terang ? ' is-light' : '');
    const L = perTema(meta);
    html = (L[layout] || L.utama)();
  }
  stage.innerHTML = html;

  // tanda siap (dipakai skrip render)
  const frames = [...stage.querySelectorAll('iframe')];
  await document.fonts.ready;
  const allReady = () => frames.every((f) => { try { return f.contentDocument.body.dataset.shotReady === '1'; } catch (e) { return false; } });
  const t0 = Date.now();
  while (!allReady() && Date.now() - t0 < 40000) await new Promise((r) => setTimeout(r, 200));
  setTimeout(() => (document.body.dataset.ready = '1'), 400);
})();
