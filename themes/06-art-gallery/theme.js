/* Tema 06 — Art Gallery
 * Undangan sebagai pameran seni: sampul = lukisan berbingkai emas di bawah lampu sorot
 * dengan plakat karya, galeri = dinding salon penuh bingkai, ucapan = kesan pengunjung.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');
  const roman = (n) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][n - 1] || String(n);

  const frame = (h, url, alt, cls, ph) => `
    <div class="ag-frame ${cls || ''}"><div class="ag-frame__mat">${h.img(url, alt, '', ph)}</div></div>`;

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);

      const portrait = (p, n, role) => `
        <article class="ag-portrait" data-reveal>
          ${frame(h, p.photo, p.name, 'ag-frame--black ag-frame--sm', h.initials(p.nick))}
          <div class="ag-label">
            <span class="ag-label__no">No. ${n}</span>
            <h3>${h.esc(p.name)}</h3>
            <p class="ag-label__meta">${role}${p.parents ? ` · ${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}` : ''}</p>
            ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
        </article>`;

      const room = (e, i) => `
        <article class="ag-room" data-reveal>
          <div class="ag-room__no"><small>Ruang</small><b>${roman(i + 1)}</b></div>
          <div class="ag-room__body">
            <h3>${h.esc(e.title)}</h3>
            <dl>
              <div><dt>Tanggal</dt><dd>${h.esc(h.date(e.start))}</dd></div>
              <div><dt>Waktu</dt><dd>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</dd></div>
              <div><dt>Lokasi</dt><dd><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</dd></div>
            </dl>
            <div class="ag-room__btns">
              <a class="ag-btn ag-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>
              <a class="ag-btn ag-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
            </div>
          </div>
        </article>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="ag-cover" id="cover">
  <div class="ag-spot" aria-hidden="true"></div>
  <p class="ag-cover__eyebrow">Pameran Tunggal · ${h.esc(stamp)}</p>
  <div class="ag-cover__art" id="ag-art">
    ${frame(h, d.cover, `${g.nick} & ${b.nick}`, 'ag-frame--gold', ini)}
  </div>
  <div class="ag-plaque">
    <b>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</b>
    <span>“Sebuah Kisah Cinta”, ${h.esc(h.year(e0.start))}</span>
    <span>Foto di atas kanvas · Koleksi pribadi</span>
  </div>
  <div class="ag-ticket">
    <small>Tiket Masuk · Tamu Kehormatan</small>
    <b>${h.esc(guest)}</b>
  </div>
  <button class="ag-btn ag-btn--dark" data-open>Masuki Galeri</button>
  <p class="ag-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>

<main id="main">
  <section class="ag-hero" data-shot="hero">
    <p class="ag-hero__kicker" data-reveal>Galeri Cinta mempersembahkan</p>
    <h1 data-reveal>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
    <p class="ag-hero__sub" data-reveal>A Love Exhibition</p>
    <div class="ag-hero__art" data-reveal>${frame(h, d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, 'ag-frame--white', ini)}</div>
    <p class="ag-hero__date" data-reveal><span>${h.esc(h.date(e0.start))}</span></p>
  </section>

  ${d.quote ? `
  <section class="ag-wall" data-reveal>
    <small>Teks Dinding</small>
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>— ${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="ag-sec">
    <h2 class="ag-title" data-shot="couple"><small>Para Seniman</small>Kedua Mempelai</h2>
    <div class="ag-portraits">${portrait(g, '01', 'Mempelai Pria')}${portrait(b, '02', 'Mempelai Wanita')}</div>
  </section>

  <section class="ag-sec ag-sec--dark">
    <h2 class="ag-title" data-shot="countdown"><small>Pembukaan Pameran</small>Menuju Hari Bahagia</h2>
    <div class="ag-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
  </section>

  <section class="ag-sec">
    <h2 class="ag-title" data-shot="events"><small>Jadwal Pameran</small>Rangkaian Acara</h2>
    ${d.events.map(room).join('')}
  </section>

  ${d.story.length ? `
  <section class="ag-sec ag-sec--warm">
    <h2 class="ag-title" data-shot="story"><small>Koleksi Permanen</small>Kisah Cinta Kami</h2>
    <ol class="ag-story">${d.story.map((s, i) => `
      <li data-reveal><span class="ag-story__yr">${h.esc(s.date)}</span><div><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p><small>Karya ${roman(i + 1)}</small></div></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="ag-sec">
    <h2 class="ag-title" data-shot="gallery"><small>Ruang Pamer</small>Galeri</h2>
    <div class="ag-salon">${d.gallery.map((u, i) => `
      <figure class="ag-piece ag-piece--${i % 5}" data-reveal>
        <button data-zoom="${h.esc(u)}" aria-label="Perbesar karya ${i + 1}">${frame(h, u, 'Karya ' + (i + 1), i % 3 === 1 ? 'ag-frame--black' : 'ag-frame--gold')}</button>
        <figcaption>No. ${pad(i + 1)}</figcaption>
      </figure>`).join('')}
    </div>
    <p class="ag-hint">Ketuk karya untuk melihat lebih dekat</p>
  </section>` : ''}

  <section class="ag-sec ag-sec--warm">
    <h2 class="ag-title" data-shot="rsvp"><small>Buku Tamu</small>Konfirmasi Kehadiran</h2>
    <form class="ag-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="ag-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Kesan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis kesan dan doa untuk kedua mempelai"></textarea></label>
      <button type="submit" class="ag-btn ag-btn--dark">Tanda Tangani Buku Tamu</button>
      <p class="ag-form__done" data-rsvp-done hidden>Terima kasih atas kunjungan Anda.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="ag-sec">
    <h2 class="ag-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="ag-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="ag-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="ag-btn ag-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="ag-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="ag-btn ag-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="ag-sec ag-sec--warm">
    <h2 class="ag-title" data-shot="wishes"><small>Kesan Pengunjung</small>Ucapan &amp; Doa</h2>
    <div class="ag-wishes" data-wishes></div>
  </section>

  <footer class="ag-footer">
    <div class="ag-mono">${h.esc(ini)}</div>
    <p class="ag-footer__kicker">Terima kasih telah berkunjung</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    <p>Kehadiran dan doa Anda adalah bagian terindah dari pameran ini.</p>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<div class="ag-lightbox" hidden><button class="ag-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="ag-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="ag-wish"><p>“${h.esc(w.ucapan)}”</p><footer><b>${h.esc(w.nama)}</b>${w.kehadiran ? ` · ${h.esc(w.kehadiran)}` : ''}</footer></article>`;
    },

    mount(root) {
      const lb = root.querySelector('.ag-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      root.querySelector('#cover').classList.add('is-entering');
      return new Promise((ok) => setTimeout(() => { root.querySelector('#cover').classList.add('is-gone'); ok(); }, 1100));
    },
  };
})();
