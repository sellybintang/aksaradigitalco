/* Tema 04 — Vinyl Record
 * Undangan sebagai album piringan hitam retro: sampul = sleeve album dengan piringan
 * mengintip, dibuka dengan "memutar" piringan. Acara = tracklist Side A/B,
 * hitung mundur = pemutar musik, ucapan = fan mail.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  const PREV = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>';
  const NEXT = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 18l8.5-6L6 6zm10-12h2v12h-2z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');

  const record = (h, photo, text, cls) => `
    <div class="vr-record ${cls || ''}" aria-hidden="true">
      <div class="vr-record__label">${photo ? h.img(photo, '') : `<span>${h.esc(text)}</span>`}</div>
    </div>`;

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const ini = h.initials(g.nick, b.nick).split('').join(' & ');
      const guest = h.guest || 'Tamu Undangan';
      const side = (i) => `${i < 1 ? 'A' : 'B'}${(i % 1) + 1}`;

      const artist = (p, role) => `
        <article class="vr-artist" data-reveal>
          ${record(h, p.photo, h.initials(p.nick), 'vr-record--mini')}
          <div>
            <small>${role}</small>
            <h3>${h.esc(p.name)}</h3>
            ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}</p>` : ''}
            ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
        </article>`;

      const track = (e, i) => `
        <li class="vr-track" data-reveal>
          <div class="vr-track__head">
            <span class="vr-track__no">${side(i)}</span>
            <b>${h.esc(e.title)}</b>
            <span class="vr-track__time">${h.esc(h.time(e.start))}</span>
          </div>
          <div class="vr-track__body">
            <p><small>Tanggal</small>${h.esc(h.date(e.start))}</p>
            <p><small>Waktu</small>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</p>
            <p><small>Tempat</small><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</p>
            <div class="vr-track__btns">
              <a class="vr-btn vr-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>
              <a class="vr-btn vr-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
            </div>
          </div>
        </li>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="vr-cover" id="cover">
  <p class="vr-eyebrow">The Wedding Album · ${h.esc(h.year(e0.start))}</p>
  <div class="vr-deck" id="vr-deck">
    ${record(h, '', ini, 'vr-record--cover')}
    <div class="vr-sleeve">
      ${h.img(d.cover, `${g.nick} & ${b.nick}`, 'vr-sleeve__img', ini)}
      <div class="vr-sleeve__title"><b>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</b><span>Side A · ${h.esc(stamp)}</span></div>
      <span class="vr-sticker">Limited<br>Edition</span>
    </div>
  </div>
  <div class="vr-guest">
    <small>Diputar khusus untuk</small>
    <b>${h.esc(guest)}</b>
  </div>
  <button class="vr-btn vr-btn--play" data-open>${PLAY} Putar Undangan</button>
  <p class="vr-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>

<main id="main">
  <section class="vr-hero" data-shot="hero">
    <div class="vr-turntable" data-reveal>
      ${record(h, d.couplephoto || d.cover, ini, 'vr-record--spin')}
      <div class="vr-arm" aria-hidden="true"><i></i></div>
      <span class="vr-knob" aria-hidden="true"></span>
    </div>
    <div class="vr-hero__text" data-reveal>
      <p class="vr-np"><span class="vr-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span> Now Playing</p>
      <h1>${h.esc(g.nick)} <em>&amp;</em> ${h.esc(b.nick)}</h1>
      <p class="vr-hero__sub">The Wedding Album</p>
      <p class="vr-hero__date">${h.esc(h.date(e0.start))}</p>
    </div>
  </section>

  ${d.quote ? `
  <section class="vr-notes" data-reveal>
    <small>Liner Notes</small>
    <p>“${h.esc(d.quote)}”</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="vr-sec">
    <h2 class="vr-title" data-shot="couple"><small>Featuring</small>Kedua Mempelai</h2>
    <div class="vr-artists">${artist(g, 'Mempelai Pria')}${artist(b, 'Mempelai Wanita')}</div>
  </section>

  <section class="vr-sec vr-sec--dark">
    <h2 class="vr-title" data-shot="countdown"><small>Time Remaining</small>Menuju Hari Bahagia</h2>
    <div class="vr-player" data-reveal>
      <div class="vr-player__time" data-countdown="${h.esc(e0.start)}">${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
      <div class="vr-progress"><i id="vr-progress"></i></div>
      <div class="vr-player__meta"><span>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</span><span>${h.esc(stamp)}</span></div>
      <div class="vr-controls" aria-hidden="true"><span>${PREV}</span><span class="vr-controls__play">${PLAY}</span><span>${NEXT}</span></div>
    </div>
  </section>

  <section class="vr-sec">
    <h2 class="vr-title" data-shot="events"><small>Tracklist</small>Rangkaian Acara</h2>
    <ol class="vr-tracks">${d.events.map(track).join('')}</ol>
  </section>

  ${d.story.length ? `
  <section class="vr-sec vr-sec--paper">
    <h2 class="vr-title" data-shot="story"><small>Bonus Tracks</small>Kisah Cinta Kami</h2>
    <ol class="vr-story">${d.story.map((s, i) => `
      <li data-reveal><span class="vr-story__no">${pad(i + 1)}</span><div><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></div></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="vr-sec">
    <h2 class="vr-title" data-shot="gallery"><small>Album Art</small>Galeri</h2>
    <div class="vr-covers">${d.gallery.map((u, i) => `
      <button class="vr-cover-art" data-reveal data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}<span>Vol. ${pad(i + 1)}</span></button>`).join('')}
    </div>
  </section>` : ''}

  <section class="vr-sec vr-sec--paper">
    <h2 class="vr-title" data-shot="rsvp"><small>Guest List</small>Konfirmasi Kehadiran</h2>
    <form class="vr-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="vr-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis pesan untuk kedua mempelai"></textarea></label>
      <button type="submit" class="vr-btn vr-btn--play">Kirim</button>
      <p class="vr-form__done" data-rsvp-done hidden>Terima kasih! Nama Anda sudah masuk guest list.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="vr-sec">
    <h2 class="vr-title" data-shot="gift"><small>Support the Couple</small>Amplop Digital</h2>
    <p class="vr-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="vr-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="vr-btn vr-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="vr-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="vr-btn vr-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="vr-sec vr-sec--paper">
    <h2 class="vr-title" data-shot="wishes"><small>Fan Mail</small>Ucapan &amp; Doa</h2>
    <div class="vr-wishes" data-wishes></div>
  </section>

  <footer class="vr-footer">
    ${record(h, '', ini, 'vr-record--footer')}
    <p class="vr-footer__end">Side B · The End</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    <p>Terima kasih telah menjadi bagian dari lagu kami.</p>
    <small>℗ ${h.esc(h.year(e0.start))} ${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</small>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<div class="vr-lightbox" hidden><button class="vr-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="vr-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="vr-wish"><header><b>${h.esc(w.nama)}</b>${w.kehadiran ? `<span>${h.esc(w.kehadiran)}</span>` : ''}</header><p>${h.esc(w.ucapan)}</p></article>`;
    },

    mount(root, d, h) {
      // progres "lagu": 180 hari terakhir menuju hari H
      const target = h.parseDate((d.events[0] || {}).start);
      const bar = root.querySelector('#vr-progress');
      if (target && bar) {
        const span = 180 * 86400e3;
        const pct = Math.min(100, Math.max(4, 100 - ((target - Date.now()) / span) * 100));
        bar.style.width = pct + '%';
      }
      const lb = root.querySelector('.vr-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      root.querySelector('#vr-deck').classList.add('is-playing');
      return new Promise((ok) => setTimeout(() => { root.querySelector('#cover').classList.add('is-gone'); ok(); }, 1300));
    },
  };
})();
