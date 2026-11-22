/* Tema 09 — Celestial
 * Langit malam yang tenang: peta bintang medali dengan rasi berbentuk hati (unik per pasangan),
 * fase bulan asli pada malam pernikahan, bintang berkelip, dan efek "melesat ke bintang" saat dibuka.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');

  // pembangkit acak yang konsisten per pasangan (hasil sama setiap dibuka)
  function rng(seedText) {
    let s = 2166136261;
    for (const c of String(seedText)) s = Math.imul(s ^ c.charCodeAt(0), 16777619) >>> 0;
    return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }

  // fase bulan (0 = bulan baru, 0.5 = purnama) — perhitungan sinodik sederhana
  function moonPhase(date) {
    const jd = date.getTime() / 86400000 + 2440587.5;
    const p = ((jd - 2451550.1) / 29.530588853) % 1;
    return p < 0 ? p + 1 : p;
  }
  function phaseName(p) {
    if (p < 0.03 || p > 0.97) return 'Bulan Baru';
    if (p < 0.22) return 'Sabit Awal';
    if (p < 0.28) return 'Separuh Awal';
    if (p < 0.47) return 'Cembung Awal';
    if (p < 0.53) return 'Purnama';
    if (p < 0.72) return 'Cembung Akhir';
    if (p < 0.78) return 'Separuh Akhir';
    return 'Sabit Akhir';
  }
  function moonSvg(p) {
    const r = 46, cx = 50, cy = 50;
    const rx = Math.abs(Math.cos(2 * Math.PI * p)) * r;
    const lit = (1 - Math.cos(2 * Math.PI * p)) / 2;
    let d;
    if (p <= 0.5) d = `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx} ${cy + r} A${rx} ${r} 0 0 ${p < 0.25 ? 0 : 1} ${cx} ${cy - r}Z`;
    else d = `M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} A${rx} ${r} 0 0 ${p < 0.75 ? 0 : 1} ${cx} ${cy - r}Z`;
    return `<svg class="cl-moon" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="46" class="cl-moon__dark"/>
      ${lit > 0.01 ? `<path d="${d}" class="cl-moon__lit"/>` : ''}
      <circle cx="50" cy="50" r="46" class="cl-moon__rim"/>
    </svg>`;
  }

  // peta bintang medali + rasi berbentuk hati
  let mapId = 0;
  function starMap(seed, label) {
    const R = rng(seed), size = 300, c = size / 2, rad = 132, ringId = 'cl-ring-' + (++mapId);
    let stars = '';
    for (let i = 0; i < 170; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * rad, s = Math.pow(R(), 3) * 1.8 + .35;
      stars += `<circle cx="${(c + Math.cos(a) * d).toFixed(1)}" cy="${(c + Math.sin(a) * d).toFixed(1)}" r="${s.toFixed(2)}" opacity="${(.45 + R() * .55).toFixed(2)}"/>`;
    }
    const pts = [];
    for (let i = 0; i < 14; i++) {
      const t = (i / 14) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push([c + x * 4.4 + (R() - .5) * 4, c + y * 4.4 + 10 + (R() - .5) * 4]);
    }
    const line = pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');
    const grid = [44, 88, 132].map((r) => `<circle cx="${c}" cy="${c}" r="${r}" class="cl-map__grid"/>`).join('')
      + [0, 30, 60, 90, 120, 150].map((deg) => { const a = deg * Math.PI / 180; return `<line x1="${c - Math.cos(a) * rad}" y1="${c - Math.sin(a) * rad}" x2="${c + Math.cos(a) * rad}" y2="${c + Math.sin(a) * rad}" class="cl-map__grid"/>`; }).join('');
    return `<svg class="cl-map" viewBox="0 0 ${size} ${size}" role="img" aria-label="Peta bintang ${label}">
      <defs><path id="${ringId}" d="M ${c} ${c} m -142 0 a 142 142 0 1 1 284 0 a 142 142 0 1 1 -284 0"/></defs>
      <circle cx="${c}" cy="${c}" r="${rad + 4}" class="cl-map__bg"/>
      ${grid}
      <g class="cl-map__stars">${stars}</g>
      <polyline points="${line} ${pts[0].map((v) => v.toFixed(1)).join(',')}" class="cl-map__line"/>
      <g class="cl-map__nodes">${pts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="2.6"/>`).join('')}</g>
      <circle cx="${c}" cy="${c}" r="${rad + 4}" class="cl-map__rim"/>
      <text class="cl-map__ring"><textPath href="#${ringId}" startOffset="25%" text-anchor="middle">${label}</textPath></text>
    </svg>`;
  }

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())} . ${pad(dt.getMonth() + 1)} . ${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);
      const city = (e0.address || e0.place || '').split(',').pop().trim();
      const ringLabel = h.esc(`${g.nick} & ${b.nick} · ${stamp}${city ? ' · ' + city : ''}`.toUpperCase());
      const p = dt ? moonPhase(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 20)) : 0.5;

      const person = (q, role) => `
        <article class="cl-person" data-reveal>
          <div class="cl-person__photo">${h.img(q.photo, q.name, '', h.initials(q.nick))}</div>
          <small>${role}</small>
          <h3>${h.esc(q.name)}</h3>
          ${q.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari<br>${h.esc(q.parents)}</p>` : ''}
          ${q.ig ? `<a href="https://instagram.com/${h.esc(q.ig)}" target="_blank" rel="noopener">@${h.esc(q.ig)}</a>` : ''}
        </article>`;

      const event = (e) => `
        <article class="cl-event" data-reveal>
          <small>${h.esc(h.date(e.start))}</small>
          <h3>${h.esc(e.title)}</h3>
          <p class="cl-event__time">${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</p>
          <p><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</p>
          <div class="cl-event__btns">
            <a class="cl-btn cl-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>
            <a class="cl-btn cl-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
          </div>
        </article>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<canvas class="cl-sky" aria-hidden="true"></canvas>
<section class="cl-cover" id="cover">
  <p class="cl-cover__kicker">Di bawah langit yang sama</p>
  <div class="cl-cover__map">${starMap(d.slug + stamp, ringLabel)}</div>
  <h1 class="cl-cover__names">${h.esc(g.nick)} <span>&amp;</span> ${h.esc(b.nick)}</h1>
  <p class="cl-cover__date">${h.esc(stamp)}</p>
  <div class="cl-cover__guest"><small>Kepada Yth.</small><b>${h.esc(guest)}</b></div>
  <button class="cl-btn cl-btn--gold" data-open>Buka Undangan</button>
  <p class="cl-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>

<main id="main">
  <section class="cl-hero" data-shot="hero">
    <div class="cl-hero__photo" data-reveal>${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, '', ini)}</div>
    <div data-reveal>
      <small>The Wedding of</small>
      <h1>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
      <p>${h.esc(h.date(e0.start))}</p>
    </div>
  </section>

  ${d.quote ? `
  <section class="cl-quote" data-reveal>
    <span class="cl-spark" aria-hidden="true">✦</span>
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="cl-sec">
    <h2 class="cl-title" data-shot="couple"><small>Dua Bintang</small>Kedua Mempelai</h2>
    <div class="cl-people">${person(g, 'Mempelai Pria')}<span class="cl-amp" aria-hidden="true">&amp;</span>${person(b, 'Mempelai Wanita')}</div>
  </section>

  <section class="cl-sec">
    <h2 class="cl-title" data-shot="countdown"><small>Menghitung Malam</small>Menuju Hari Bahagia</h2>
    <div class="cl-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
    <div class="cl-moonbox" data-reveal>
      ${moonSvg(p)}
      <div><small>Bulan di malam pernikahan kami</small><b>${phaseName(p)}</b><span>${h.esc(h.date(e0.start))}</span></div>
    </div>
  </section>

  <section class="cl-sec">
    <h2 class="cl-title" data-shot="events"><small>Waktu &amp; Tempat</small>Rangkaian Acara</h2>
    ${d.events.map(event).join('')}
  </section>

  ${d.story.length ? `
  <section class="cl-sec">
    <h2 class="cl-title" data-shot="story"><small>Rasi Perjalanan</small>Kisah Cinta Kami</h2>
    <ol class="cl-story">${d.story.map((s) => `
      <li data-reveal><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="cl-sec">
    <h2 class="cl-title" data-shot="gallery"><small>Momen</small>Galeri</h2>
    <div class="cl-gallery">${d.gallery.map((u, i) => `
      <button class="cl-shot cl-shot--${i % 4}" data-reveal data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}</button>`).join('')}
    </div>
  </section>` : ''}

  <section class="cl-sec">
    <h2 class="cl-title" data-shot="rsvp"><small>Kehadiran</small>Konfirmasi Kehadiran</h2>
    <form class="cl-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="cl-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Titipkan doa Anda untuk kami"></textarea></label>
      <button type="submit" class="cl-btn cl-btn--gold">Kirim</button>
      <p class="cl-form__done" data-rsvp-done hidden>Terima kasih, doa Anda sudah kami terima.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="cl-sec">
    <h2 class="cl-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="cl-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="cl-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="cl-btn cl-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="cl-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="cl-btn cl-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="cl-sec">
    <h2 class="cl-title" data-shot="wishes"><small>Doa yang Dititipkan</small>Ucapan</h2>
    <div class="cl-wishes" data-wishes></div>
  </section>

  <footer class="cl-footer">
    <div class="cl-footer__map">${starMap(d.slug + stamp, ringLabel)}</div>
    <p>Terima kasih telah menjadi bagian dari langit kami.</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<div class="cl-lightbox" hidden><button class="cl-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="cl-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="cl-wish"><span aria-hidden="true">✦</span><div><p>${h.esc(w.ucapan)}</p><footer>${h.esc(w.nama)}${w.kehadiran ? ` · ${h.esc(w.kehadiran)}` : ''}</footer></div></article>`;
    },

    mount(root, d) {
      const lb = root.querySelector('.cl-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

      // langit berbintang (kanvas) — berkelip pelan, melesat saat undangan dibuka
      const cv = root.querySelector('.cl-sky'), ctx = cv.getContext('2d');
      const R = rng(d.slug || 'sky');
      let W = 0, H = 0, stars = [], warp = 0;
      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = Array.from({ length: Math.round(W * H / 2600) }, () => ({ x: R() * W, y: R() * H, z: R(), tw: R() * 6.28 }));
      };
      resize(); window.addEventListener('resize', resize);
      const still = document.documentElement.classList.contains('u-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches;
      let t = 0;
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const s of stars) {
          if (warp) { const dx = s.x - W / 2, dy = s.y - H / 2; s.x += dx * warp * .06; s.y += dy * warp * .06; if (s.x < 0 || s.x > W || s.y < 0 || s.y > H) { s.x = W / 2 + (R() - .5) * 40; s.y = H / 2 + (R() - .5) * 40; } }
          const a = .35 + .65 * (still ? .8 : (Math.sin(t * .02 + s.tw) * .5 + .5)) * (.4 + s.z * .6);
          ctx.fillStyle = `rgba(244,239,225,${a.toFixed(3)})`;
          ctx.beginPath(); ctx.arc(s.x, s.y, .4 + s.z * 1.1 + warp * .6, 0, 6.28); ctx.fill();
        }
        t++;
        if (!still) requestAnimationFrame(draw);
      };
      draw();
      this._warp = (v) => { warp = v; };
    },

    onOpen(root) {
      const cover = root.querySelector('#cover');
      cover.classList.add('is-leaving');
      if (this._warp) this._warp(1);
      return new Promise((ok) => setTimeout(() => { cover.classList.add('is-gone'); if (this._warp) this._warp(0); ok(); }, 1100));
    },
  };
})();
