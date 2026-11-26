/* Tema 13 — Japandi
 * Minimalis Jepang-Skandinavia: kertas krem, garis tipis, lingkaran kuas ensō,
 * stempel merah (hanko) berinisial, dan pintu geser shoji saat undangan dibuka.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');
  let uid = 0;

  // lingkaran kuas ensō (SVG dengan tekstur kuas)
  const enso = (cls) => {
    const id = 'jp-brush-' + (++uid);
    return `<svg class="jp-enso ${cls || ''}" viewBox="0 0 200 200" aria-hidden="true">
      <defs><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter></defs>
      <g filter="url(#${id})" fill="none" stroke="currentColor" stroke-linecap="round">
        <path d="M114 23 A78 78 0 1 1 82 25" stroke-width="7" pathLength="1"/>
        <path d="M120 28 A72 74 0 1 1 92 27" stroke-width="2.5" opacity=".45" pathLength="1"/>
      </g>
    </svg>`;
  };
  const hanko = (h, text) => `<span class="jp-hanko" aria-hidden="true">${h.esc(text)}</span>`;

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())} · ${pad(dt.getMonth() + 1)} · ${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);

      const person = (p, role) => `
        <article class="jp-person" data-reveal>
          <div class="jp-person__photo">${h.img(p.photo, p.name, '', h.initials(p.nick))}</div>
          <small>${role}</small>
          <h3>${h.esc(p.name)}</h3>
          ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari<br>${h.esc(p.parents)}</p>` : ''}
          ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
        </article>`;

      const event = (e, i) => `
        <article class="jp-event" data-reveal>
          <span class="jp-event__no">${pad(i + 1)}</span>
          <div>
            <h3>${h.esc(e.title)}</h3>
            <p class="jp-event__date">${h.esc(h.date(e.start))}</p>
            <p class="jp-event__time">${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} ${h.esc(e.tz || 'WIB')}</p>
            <p class="jp-event__place"><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</p>
            <div class="jp-event__btns">
              ${e.maps ? `<a class="jp-btn jp-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>` : ''}
              <a class="jp-btn jp-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
            </div>
          </div>
        </article>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="jp-cover" id="cover">
  <p class="jp-vert jp-vert--l">The Wedding of</p>
  <p class="jp-vert jp-vert--r">${h.esc(stamp)}</p>
  <div class="jp-cover__circle">
    ${enso('jp-enso--cover')}
    <div class="jp-cover__photo">${h.img(d.cover, `${g.nick} & ${b.nick}`, '', ini)}</div>
  </div>
  <h1 class="jp-cover__names">${h.esc(g.nick)} <span>&amp;</span> ${h.esc(b.nick)}</h1>
  ${hanko(h, ini)}
  <div class="jp-cover__guest">
    <small>Kepada Yth.</small>
    <b>${h.esc(guest)}</b>
  </div>
  <button class="jp-btn jp-btn--ink" data-open>Buka Undangan</button>
  <p class="jp-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>
<div class="jp-shoji" aria-hidden="true"><i></i><i></i></div>

<main id="main">
  <section class="jp-hero" data-shot="hero">
    <p class="jp-vert jp-vert--hero">${h.esc(stamp)}</p>
    <div class="jp-hero__photo" data-reveal>${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, '', ini)}</div>
    <div class="jp-hero__text" data-reveal>
      <small>Kami yang berbahagia</small>
      <h1>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
      <p>${h.esc(h.date(e0.start))}</p>
    </div>
  </section>

  ${d.quote ? `
  <section class="jp-quote" data-reveal>
    ${enso('jp-enso--small')}
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="jp-sec jp-sec--paper">
    <h2 class="jp-title" data-shot="couple"><small>Mempelai</small>Dua Hati, Satu Jalan</h2>
    <div class="jp-people">${person(g, 'Mempelai Pria')}<span class="jp-divider" aria-hidden="true"></span>${person(b, 'Mempelai Wanita')}</div>
  </section>

  <section class="jp-sec">
    <h2 class="jp-title" data-shot="countdown"><small>Menghitung Hari</small>Menuju Hari Bahagia</h2>
    <div class="jp-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
  </section>

  <section class="jp-sec jp-sec--paper">
    <h2 class="jp-title" data-shot="events"><small>Waktu &amp; Tempat</small>Rangkaian Acara</h2>
    ${d.events.map(event).join('')}
  </section>

  ${d.story.length ? `
  <section class="jp-sec">
    <h2 class="jp-title" data-shot="story"><small>Perjalanan</small>Kisah Cinta Kami</h2>
    <ol class="jp-story">${d.story.map((s) => `
      <li data-reveal><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="jp-sec jp-sec--paper">
    <h2 class="jp-title" data-shot="gallery"><small>Momen</small>Galeri</h2>
    <div class="jp-gallery">${d.gallery.map((u, i) => `
      <button class="jp-shot jp-shot--${i % 6}" data-reveal data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}</button>`).join('')}
    </div>
  </section>` : ''}

  <section class="jp-sec">
    <h2 class="jp-title" data-shot="rsvp"><small>Kehadiran</small>Konfirmasi Kehadiran</h2>
    <form class="jp-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="jp-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ucapan untuk kedua mempelai"></textarea></label>
      <button type="submit" class="jp-btn jp-btn--ink">Kirim</button>
      <p class="jp-form__done" data-rsvp-done hidden>Terima kasih atas konfirmasinya.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="jp-sec jp-sec--paper">
    <h2 class="jp-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="jp-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="jp-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="jp-btn jp-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="jp-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="jp-btn jp-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="jp-sec">
    <h2 class="jp-title" data-shot="wishes"><small>Doa &amp; Harapan</small>Ucapan</h2>
    <div class="jp-wishes" data-wishes></div>
  </section>

  <footer class="jp-footer">
    <div class="jp-footer__mark">${enso('jp-enso--footer')}${hanko(h, ini)}</div>
    <p>Terima kasih atas doa dan kehadiran Anda.</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<div class="jp-lightbox" hidden><button class="jp-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="jp-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="jp-wish"><p>${h.esc(w.ucapan)}</p><footer>${h.esc(w.nama)}${w.kehadiran ? ` <span>· ${h.esc(w.kehadiran)}</span>` : ''}</footer></article>`;
    },

    mount(root) {
      const lb = root.querySelector('.jp-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      // pintu shoji menutup, sampul hilang, lalu pintu terbuka memperlihatkan isi
      const shoji = root.querySelector('.jp-shoji');
      shoji.classList.add('is-closed');
      return new Promise((ok) => setTimeout(() => {
        root.querySelector('#cover').classList.add('is-gone');
        ok();
        requestAnimationFrame(() => { shoji.classList.remove('is-closed'); shoji.classList.add('is-open'); });
      }, 750));
    },
  };
})();
