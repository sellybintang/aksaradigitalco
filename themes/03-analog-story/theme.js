/* Tema 03 — Analog Story (darkroom / cuci foto film)
 * Undangan sebagai ruang cuci foto analog: lampu merah, nampan cairan pengembang,
 * foto "muncul" perlahan saat dicuci, cetakan dijemur di tali dengan jepitan.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const coverImg = d.cover || d.couplephoto || d.gallery[0];

      const print = (url, i, cap) => `
        <figure class="kg-print kg-dev" data-reveal style="--r:${[-3, 2, -1.5, 3, -2, 1.5][i % 6]}deg">
          <span class="kg-peg" aria-hidden="true"></span>
          <button class="kg-print__btn" data-zoom="${h.esc(url)}" aria-label="Perbesar foto ${i + 1}">${h.img(url, 'Foto ' + (i + 1))}</button>
          <figcaption>${h.esc(cap || 'No. ' + pad(i + 1))}</figcaption>
        </figure>`;

      const person = (p, n) => `
        <article class="kg-neg" data-reveal>
          <small>NEGATIF ${n}</small>
          ${p.photo ? `<div class="kg-neg__photo kg-dev" data-reveal>${h.img(p.photo, p.name)}</div>` : ''}
          <h3>${h.esc(p.name)}</h3>
          ${p.parents ? `<p>${n === '01' ? 'Putra' : 'Putri'} dari<br>${h.esc(p.parents)}</p>` : ''}
          ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
        </article>`;

      const event = (e, i) => `
        <article class="kg-env" data-reveal>
          <header><span>AMPLOP CETAK</span><span>ROLL ${pad(i + 1)}</span></header>
          <h3>${h.esc(e.title)}</h3>
          <dl>
            <div><dt>Tanggal</dt><dd>${h.esc(h.date(e.start))}</dd></div>
            <div><dt>Waktu</dt><dd>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</dd></div>
            <div><dt>Tempat</dt><dd><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</dd></div>
          </dl>
          <footer>
            ${e.maps ? `<a class="kg-btn kg-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>` : ''}
            <a class="kg-btn kg-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
          </footer>
          <span class="kg-env__stamp">${h.esc(stamp)}</span>
        </article>`;

      const digit = (k, label) => `<div class="kg-timer__cell"><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="kg-cover" id="cover">
  <div class="kg-safelight" aria-hidden="true"></div>
  <p class="kg-cover__label">ANALOG STORY · NOW DEVELOPING</p>
  <div class="kg-tray">
    <div class="kg-tray__liquid" aria-hidden="true"></div>
    <div class="kg-tray__print kg-dev" id="kg-cover-print">
      ${h.img(coverImg, `${g.nick} & ${b.nick}`)}
      <div class="kg-tray__caption"><span>The Wedding of</span><b>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</b></div>
    </div>
  </div>
  <div class="kg-tape">
    <small>Kepada Yth.</small>
    <b>${h.esc(guest)}</b>
  </div>
  <button class="kg-btn kg-btn--light" data-open>Nyalakan Lampu</button>
  <p class="kg-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>
<div class="kg-flash" aria-hidden="true"></div>

<main id="main">
  <section class="kg-hero" data-shot="hero">
    <div class="kg-line" aria-hidden="true"></div>
    <figure class="kg-print kg-print--big kg-dev" data-reveal style="--r:-1.5deg">
      <span class="kg-peg" aria-hidden="true"></span><span class="kg-peg kg-peg--r" aria-hidden="true"></span>
      ${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`)}
    </figure>
    <div class="kg-hero__text" data-reveal>
      <small>DICETAK DENGAN CINTA · ${h.esc(stamp)}</small>
      <h1>${h.esc(g.nick)}<em>&amp;</em>${h.esc(b.nick)}</h1>
      <p>${h.esc(h.date(e0.start))}</p>
    </div>
  </section>

  ${d.quote ? `
  <section class="kg-strip" data-reveal>
    <p>“${h.esc(d.quote)}”</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="kg-sec kg-sec--paper">
    <h2 class="kg-title" data-shot="couple"><small>Contact Sheet</small>Kedua Mempelai</h2>
    <div class="kg-negs">${person(g, '01')}<span class="kg-amp">&amp;</span>${person(b, '02')}</div>
  </section>

  <section class="kg-sec kg-timer" data-reveal>
    <h2 class="kg-title" data-shot="countdown"><small>Timer Cuci Foto</small>Menuju Hari Bahagia</h2>
    <div class="kg-timer__box" data-countdown="${h.esc(e0.start)}">
      ${digit('d', 'Hari')}${digit('h', 'Jam')}${digit('m', 'Menit')}${digit('s', 'Detik')}
    </div>
    <p class="kg-timer__note">● DEVELOPING</p>
  </section>

  <section class="kg-sec kg-sec--paper">
    <h2 class="kg-title" data-shot="events"><small>Siap Diambil</small>Rangkaian Acara</h2>
    ${d.events.map(event).join('')}
  </section>

  ${d.story.length ? `
  <section class="kg-sec">
    <h2 class="kg-title" data-shot="story"><small>Roll Film Kami</small>Kisah Cinta</h2>
    <ol class="kg-film">${d.story.map((s, i) => `
      <li data-reveal><span class="kg-film__no">${pad(i + 1)}A</span><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="kg-sec kg-gallery">
    <h2 class="kg-title" data-shot="gallery"><small>Sedang Dijemur</small>Galeri</h2>
    <div class="kg-line" aria-hidden="true"></div>
    <div class="kg-prints">${d.gallery.map((u, i) => print(u, i)).join('')}</div>
    <p class="kg-hint">Ketuk foto untuk memperbesar</p>
  </section>` : ''}

  <section class="kg-sec kg-sec--paper">
    <h2 class="kg-title" data-shot="rsvp"><small>Formulir Kehadiran</small>Konfirmasi Kehadiran</h2>
    <form class="kg-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="kg-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis di balik foto ini…"></textarea></label>
      <button type="submit" class="kg-btn kg-btn--red">Kirim</button>
      <p class="kg-form__done" data-rsvp-done hidden>Terima kasih, konfirmasi Anda sudah kami terima.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="kg-sec">
    <h2 class="kg-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="kg-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="kg-card" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="kg-btn kg-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="kg-card" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="kg-btn kg-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="kg-sec kg-sec--paper">
    <h2 class="kg-title" data-shot="wishes"><small>Tulisan di Balik Foto</small>Ucapan &amp; Doa</h2>
    <div class="kg-wishes" data-wishes></div>
  </section>

  <footer class="kg-footer">
    <p class="kg-fin">— Fin —</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    <p>Terima kasih telah menjadi bagian dari cerita kami.</p>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<div class="kg-lightbox" hidden><button class="kg-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="kg-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="kg-wish"><p>${h.esc(w.ucapan)}</p><footer>— ${h.esc(w.nama)}${w.kehadiran ? ` · <span>${h.esc(w.kehadiran)}</span>` : ''}</footer></article>`;
    },

    mount(root) {
      // foto di nampan sampul "dicuci" perlahan
      setTimeout(() => root.querySelector('#kg-cover-print').classList.add('is-in'), 500);
      // lightbox galeri
      const lb = root.querySelector('.kg-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      root.querySelector('.kg-flash').classList.add('is-on');
      return new Promise((ok) => setTimeout(() => { root.querySelector('#cover').classList.add('is-gone'); ok(); }, 450));
    },
  };
})();
