/* Tema 20 — Atlas
 * Peta topografi modern: dua penanda (mempelai) berangkat dari arah berbeda dan bertemu di satu
 * tujuan (hari pernikahan). Hitung mundur = "jarak ke tujuan", acara = checkpoint, kisah = waypoint.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');

  function rng(seedText) {
    let s = 2166136261;
    for (const c of String(seedText)) s = Math.imul(s ^ c.charCodeAt(0), 16777619) >>> 0;
    return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }

  // garis kontur topografi: beberapa "bukit" dengan kontur bertingkat (halus, unik per pasangan)
  function topo(seed, w, h, hills) {
    const R = rng(seed);
    let paths = '';
    hills.forEach(([hx, hy, levels, step]) => {
      const ph = [R() * 6.28, R() * 6.28, R() * 6.28], amp = [.16 + R() * .1, .08 + R() * .06, .05];
      for (let k = 1; k <= levels; k++) {
        const r = k * step, n = 36, pts = [];
        for (let i = 0; i < n; i++) {
          const t = (i / n) * Math.PI * 2;
          const f = 1 + amp[0] * Math.sin(2 * t + ph[0] + k * .15) + amp[1] * Math.sin(3 * t + ph[1]) + amp[2] * Math.sin(5 * t + ph[2] - k * .1);
          pts.push([hx * w + Math.cos(t) * r * f, hy * h + Math.sin(t) * r * f * .82]);
        }
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        let d = `M${mid(pts[n - 1], pts[0]).map((v) => v.toFixed(1)).join(' ')}`;
        for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); d += `Q${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }
        paths += `<path d="${d}Z" class="${k % 5 === 0 ? 'at-topo__major' : ''}"/>`;
      }
    });
    return `<svg class="at-topo" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g>${paths}</g></svg>`;
  }

  const compass = `<svg class="at-compass" viewBox="0 0 100 100" aria-hidden="true">
    <circle cx="50" cy="50" r="44" class="at-compass__ring"/><circle cx="50" cy="50" r="36" class="at-compass__ring at-compass__ring--thin"/>
    <path d="M50 8 L57 50 L50 46 L43 50Z" class="at-compass__n"/><path d="M50 92 L43 50 L50 54 L57 50Z" class="at-compass__s"/>
    <path d="M8 50 L50 45 L92 50 L50 55Z" class="at-compass__ew"/>
    <text x="50" y="6" class="at-compass__t">U</text></svg>`;

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);
      const city = (e0.address || e0.place || '').split(',').pop().trim();
      const seed = d.slug + stamp;

      const explorer = (p, role, tag) => `
        <article class="at-explorer" data-reveal>
          <div class="at-explorer__photo">${h.img(p.photo, p.name, '', h.initials(p.nick))}<span class="at-tag">${tag}</span></div>
          <div>
            <small>${role}</small>
            <h3>${h.esc(p.name)}</h3>
            ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}</p>` : ''}
            ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
        </article>`;

      const checkpoint = (e, i) => `
        <article class="at-check" data-reveal>
          <div class="at-check__pin">${PIN}<b>${pad(i + 1)}</b></div>
          <div class="at-check__body">
            <small>Checkpoint ${pad(i + 1)}</small>
            <h3>${h.esc(e.title)}</h3>
            <dl>
              <div><dt>Tanggal</dt><dd>${h.esc(h.date(e.start))}</dd></div>
              <div><dt>Waktu</dt><dd>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} ${h.esc(e.tz || 'WIB')}</dd></div>
              <div><dt>Lokasi</dt><dd><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</dd></div>
            </dl>
            <div class="at-check__btns">
              ${e.maps ? `<a class="at-btn at-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Buka Rute</a>` : ''}
              <a class="at-btn at-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
            </div>
          </div>
        </article>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="at-cover" id="cover">
  ${topo(seed, 390, 844, [[.22, .3, 11, 15], [.85, .62, 9, 14], [.4, .9, 7, 16]])}
  <svg class="at-route" viewBox="0 0 390 844" preserveAspectRatio="none" aria-hidden="true">
    <path d="M58 760 C 40 660, 120 640, 110 540 S 170 330, 195 253" class="at-route__line" vector-effect="non-scaling-stroke"/>
    <path d="M340 726 C 370 640, 300 600, 300 520 S 220 330, 195 253" class="at-route__line at-route__line--b" vector-effect="non-scaling-stroke"/>
  </svg>
  <div class="at-pin at-pin--a"><span>${PIN}</span><b>${h.esc(g.nick)}</b></div>
  <div class="at-pin at-pin--b"><span>${PIN}</span><b>${h.esc(b.nick)}</b></div>
  <div class="at-pin at-pin--dest"><span>${PIN}</span><b>${h.esc(stamp)}</b></div>
  ${compass}
  <div class="at-cover__card">
    <small>Ekspedisi Cinta${city ? ' · ' + h.esc(city) : ''}</small>
    <h1>${h.esc(g.nick)} <span>&amp;</span> ${h.esc(b.nick)}</h1>
    <p class="at-cover__guest">Peserta: <b>${h.esc(guest)}</b></p>
    <button class="at-btn at-btn--go" data-open>${PIN} Mulai Perjalanan</button>
    <p class="at-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
  </div>
</section>

<main id="main">
  <section class="at-hero" data-shot="hero">
    ${topo(seed + 'h', 390, 700, [[.85, .2, 9, 16], [.1, .85, 8, 15]])}
    <div class="at-hero__photo" data-reveal>${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, '', ini)}<span class="at-coord">${h.esc(city ? city.toUpperCase() + ' · ' : '')}${h.esc(stamp)}</span></div>
    <div class="at-hero__text" data-reveal>
      <small>Tujuan Akhir</small>
      <h1>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
      <p>${h.esc(h.date(e0.start))}</p>
    </div>
  </section>

  ${d.quote ? `
  <section class="at-note" data-reveal>
    <small>Catatan Perjalanan</small>
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="at-sec">
    <h2 class="at-title" data-shot="couple"><small>Para Penjelajah</small>Kedua Mempelai</h2>
    ${explorer(g, 'Mempelai Pria', 'A')}
    ${explorer(b, 'Mempelai Wanita', 'B')}
  </section>

  <section class="at-sec at-sec--green">
    <h2 class="at-title" data-shot="countdown"><small>Jarak ke Tujuan</small>Menuju Hari Bahagia</h2>
    <div class="at-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
    <div class="at-progress" data-reveal>
      <span class="at-progress__end">A+B</span>
      <div class="at-progress__track"><i id="at-progress"></i><span class="at-progress__pin" id="at-progress-pin">${PIN}</span></div>
      <span class="at-progress__end">${PIN}</span>
    </div>
  </section>

  <section class="at-sec">
    <h2 class="at-title" data-shot="events"><small>Titik Pemberhentian</small>Rangkaian Acara</h2>
    ${d.events.map(checkpoint).join('')}
  </section>

  ${d.story.length ? `
  <section class="at-sec at-sec--paper">
    <h2 class="at-title" data-shot="story"><small>Waypoint</small>Kisah Cinta Kami</h2>
    <ol class="at-story">${d.story.map((s) => `
      <li data-reveal><span class="at-story__pin">${PIN}</span><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="at-sec">
    <h2 class="at-title" data-shot="gallery"><small>Foto Lapangan</small>Galeri</h2>
    <div class="at-gallery">${d.gallery.map((u, i) => `
      <figure class="at-shot at-shot--${i % 3}" data-reveal>
        <button data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}</button>
        <figcaption>${PIN} Foto ${pad(i + 1)}</figcaption>
      </figure>`).join('')}
    </div>
  </section>` : ''}

  <section class="at-sec at-sec--paper">
    <h2 class="at-title" data-shot="rsvp"><small>Daftar Peserta</small>Konfirmasi Kehadiran</h2>
    <form class="at-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="at-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis pesan untuk kedua penjelajah"></textarea></label>
      <button type="submit" class="at-btn at-btn--go">Daftar Hadir</button>
      <p class="at-form__done" data-rsvp-done hidden>Terima kasih! Sampai jumpa di titik tujuan.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="at-sec">
    <h2 class="at-title" data-shot="gift"><small>Bekal Perjalanan</small>Amplop Digital</h2>
    <p class="at-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="at-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="at-btn at-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="at-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="at-btn at-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="at-sec at-sec--paper">
    <h2 class="at-title" data-shot="wishes"><small>Buku Catatan</small>Ucapan &amp; Doa</h2>
    <div class="at-wishes" data-wishes></div>
  </section>

  <footer class="at-footer">
    ${topo(seed + 'f', 390, 420, [[.5, .55, 10, 14]])}
    <div class="at-footer__in">
      ${compass}
      <p>Sampai jumpa di titik tujuan.</p>
      <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
      ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
      ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
    </div>
  </footer>
</main>

<div class="at-lightbox" hidden><button class="at-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="at-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="at-wish"><header><b>${h.esc(w.nama)}</b>${w.kehadiran ? `<span>${h.esc(w.kehadiran)}</span>` : ''}</header><p>${h.esc(w.ucapan)}</p></article>`;
    },

    mount(root, d, h) {
      // penanda bergerak di rute sesuai kedekatan hari H (180 hari terakhir)
      const target = h.parseDate((d.events[0] || {}).start);
      if (target) {
        const pct = Math.min(96, Math.max(6, 100 - ((target - Date.now()) / (180 * 86400e3)) * 100));
        const bar = root.querySelector('#at-progress'), pin = root.querySelector('#at-progress-pin');
        if (bar) bar.style.width = pct + '%';
        if (pin) pin.style.left = pct + '%';
      }
      const lb = root.querySelector('.at-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      const cover = root.querySelector('#cover');
      cover.classList.add('is-going');
      return new Promise((ok) => {
        setTimeout(() => cover.classList.add('is-zoom'), 900);
        setTimeout(() => { cover.classList.add('is-gone'); ok(); }, 1700);
      });
    },
  };
})();
