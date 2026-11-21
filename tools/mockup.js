/* Pembuat gambar katalog: menyusun layar undangan asli (iframe mode foto) ke dalam
 * komposisi 1080×1080 memakai warna & font dari themes/<tema>/meta.json. */
(async function () {
  const qs = new URLSearchParams(location.search);
  const theme = (qs.get('theme') || '01-boarding-pass').replace(/[^a-z0-9-]/gi, '');
  const layout = qs.get('layout') || 'utama';
  const CFG = window.UNDANGAN_CONFIG || {};
  const stage = document.getElementById('stage');
  const meta = await (await fetch(`/themes/${theme}/meta.json`)).json();

  // warna & font tema
  const st = stage.style;
  Object.entries(meta.warna).forEach(([k, v]) => st.setProperty('--' + k, v));
  st.setProperty('--f-judul', meta.font.judul);
  st.setProperty('--f-label', meta.font.label);
  const font = document.createElement('link'); font.rel = 'stylesheet'; font.href = meta.font.url; document.head.appendChild(font);

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const src = (shot, guest) => `/${meta.demo}?theme=${theme}&shot=${shot}&to=${encodeURIComponent(guest || 'Budi Santoso')}`;
  const screen = (shot, s, opt = {}) => `
    <div class="${opt.phone ? 'ph' : 'card'} ${opt.cls || ''}" style="--s:${s};${opt.style || ''}">
      <div class="scr"><iframe src="${src(shot, opt.guest)}" width="390" height="844" scrolling="no" tabindex="-1"></iframe></div>
    </div>`;
  const brand = CFG.brand ? `<span class="brand">${esc(CFG.brand)}</span>` : '';
  const domain = CFG.domain || 'tokoanda.com';

  const FITUR = ['Nama tamu otomatis di setiap link', 'Hitung mundur hari H', 'RSVP & buku ucapan', 'Amplop digital — salin rekening sekali ketuk', 'Galeri foto & kisah cinta', 'Peta lokasi & simpan ke kalender', 'Musik latar', 'Masa aktif sesuai paket'];
  const PILL = ['Nama Tamu Otomatis', 'RSVP', 'Amplop Digital', 'Galeri', 'Musik', 'Maps'];

  const layouts = {
    utama: () => {
      const cols = [0, 1, 2, 3].map((c) => `<div class="col" style="--y:${[-150, 40, -70, 120][c]}px">${screen(meta.layar.kolase[c * 2], .46)}${screen(meta.layar.kolase[c * 2 + 1], .46)}</div>`).join('');
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
        ${screen(meta.layar.utama, .74, { phone: true, cls: 'hero-phone' })}
        <footer class="bar"><div class="pills">${PILL.map((p) => `<span>${esc(p)}</span>`).join('')}</div>${brand}</footer>`;
    },
    fitur: () => `
      <div class="bg-grain"></div>
      <section class="fitur">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Fitur<br>Lengkap</h1>
        <ul>${FITUR.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
        ${brand}
      </section>
      <div class="trio">
        ${screen(meta.layar.fitur[0], .58, { phone: true, cls: 'p1' })}
        ${screen(meta.layar.fitur[1], .58, { phone: true, cls: 'p2' })}
        ${screen(meta.layar.fitur[2], .58, { phone: true, cls: 'p3' })}
      </div>`,
    'nama-tamu': () => `
      <div class="bg-grain"></div>
      <header class="nt-head">
        <small>${esc(meta.nama)} · Undangan Digital</small>
        <h1>Nama Tamu Otomatis</h1>
        <p>Satu undangan, setiap tamu mendapat link dengan namanya sendiri.</p>
      </header>
      <div class="nt-pair">
        <figure class="nt-back">${screen('cover', .56, { phone: true, guest: 'Keluarga Bpk. Ahmad' })}<figcaption>${esc(domain)}/raka-nadia?to=<b>Keluarga+Bpk.+Ahmad</b></figcaption></figure>
        <figure class="nt-front">${screen('cover', .66, { phone: true, guest: 'Budi Santoso' })}<figcaption>${esc(domain)}/raka-nadia?to=<b>Budi+Santoso</b></figcaption></figure>
      </div>
      <footer class="nt-foot">Tinggal salin &amp; kirim lewat WhatsApp ${brand ? '· ' + brand : ''}</footer>`,
  };

  stage.className = 'l-' + layout + (meta.terang ? ' is-light' : '');
  stage.innerHTML = (layouts[layout] || layouts.utama)();

  // tanda siap (dipakai skrip render)
  const frames = [...stage.querySelectorAll('iframe')];
  await document.fonts.ready;
  const allReady = () => frames.every((f) => { try { return f.contentDocument.body.dataset.shotReady === '1'; } catch (e) { return false; } });
  const t0 = Date.now();
  while (!allReady() && Date.now() - t0 < 30000) await new Promise((r) => setTimeout(r, 200));
  setTimeout(() => (document.body.dataset.ready = '1'), 400);
})();
