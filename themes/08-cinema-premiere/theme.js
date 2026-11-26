/* Tema 08 — Cinema Premiere
 * Undangan sebagai pemutaran perdana film: sampul = layar lebar ber-letterbox "Coming Soon",
 * dibuka dengan hitung mundur film 3-2-1, acara = tiket bioskop, ucapan = ulasan penonton,
 * penutup = credit title.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');
  const stars = (n) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);
      const parentsLine = [g.parents, b.parents].filter(Boolean).map((p) => 'Keluarga ' + p.split('&')[0].trim()).join(' & ');

      const cast = (p, role) => `
        <article class="cp-cast" data-reveal>
          ${h.img(p.photo, p.name, 'cp-cast__photo', h.initials(p.nick))}
          <div>
            <h3>${h.esc(p.name)}</h3>
            <p class="cp-cast__as">sebagai <em>${role}</em></p>
            ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}</p>` : ''}
            ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
        </article>`;

      const ticket = (e, i) => `
        <article class="cp-ticket" data-reveal>
          <div class="cp-ticket__main">
            <small>Studio ${i + 1} · Pemutaran Perdana</small>
            <h3>${h.esc(e.title)}</h3>
            <div class="cp-ticket__grid">
              <div><small>Tanggal</small><b>${h.esc(h.date(e.start))}</b></div>
              <div><small>Jam Tayang</small><b>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} ${h.esc(e.tz || 'WIB')}</b></div>
              <div class="cp-span"><small>Lokasi</small><b>${h.esc(e.place)}</b>${e.address ? `<span>${h.esc(e.address)}</span>` : ''}</div>
            </div>
            <div class="cp-ticket__btns">
              ${e.maps ? `<a class="cp-btn cp-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>` : ''}
              <a class="cp-btn cp-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
            </div>
          </div>
          <div class="cp-ticket__stub"><small>Kursi</small><b>VIP</b><small>Baris</small><b>${String.fromCharCode(65 + i)}</b></div>
        </article>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="cp-cover" id="cover">
  ${h.img(d.cover, `${g.nick} & ${b.nick}`, 'cp-cover__bg', '')}
  <div class="cp-cover__shade" aria-hidden="true"></div>
  <div class="cp-bar cp-bar--top" aria-hidden="true"></div>
  <div class="cp-bar cp-bar--bot" aria-hidden="true"></div>
  <div class="cp-cover__content">
    <p class="cp-presents">${h.esc(parentsLine || 'Kedua keluarga')} mempersembahkan</p>
    <h1 class="cp-cover__title">${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
    <p class="cp-soon">Coming Soon · ${h.esc(stamp)}</p>
    <div class="cp-screening">
      <small>Special Screening untuk</small>
      <b>${h.esc(guest)}</b>
    </div>
    <button class="cp-btn cp-btn--play" data-open>${PLAY} Mulai Pemutaran</button>
    <p class="cp-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
  </div>
  <span class="cp-rating" aria-hidden="true">SU</span>
</section>
<div class="cp-leader" aria-hidden="true"><div class="cp-leader__ring"><span>3</span></div></div>

<main id="main">
  <section class="cp-poster" data-shot="hero">
    ${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, 'cp-poster__img', ini)}
    <div class="cp-poster__shade" aria-hidden="true"></div>
    <div class="cp-poster__text">
      <p class="cp-poster__tag" data-reveal>Sebuah kisah cinta yang ditulis oleh takdir</p>
      <h1 data-reveal>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
      <p class="cp-poster__date" data-reveal>Tayang ${h.esc(h.date(e0.start))}</p>
      <p class="cp-billing" data-reveal>${h.esc(parentsLine || 'Kedua keluarga')} mempersembahkan <b>${h.esc(g.name)}</b> <b>${h.esc(b.name)}</b> dalam sebuah perjalanan menuju ikatan suci pernikahan. Disutradarai oleh cinta, diproduksi dengan doa.</p>
    </div>
  </section>

  ${d.quote ? `
  <section class="cp-subtitle" data-reveal>
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="cp-sec">
    <h2 class="cp-title" data-shot="couple"><small>Starring</small>Pemeran Utama</h2>
    <div class="cp-casts">${cast(g, 'Mempelai Pria')}${cast(b, 'Mempelai Wanita')}</div>
  </section>

  <section class="cp-sec cp-sec--count">
    <h2 class="cp-title" data-shot="countdown"><small>Premiere Dalam</small>Menuju Hari Bahagia</h2>
    <div class="cp-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
  </section>

  <section class="cp-sec">
    <h2 class="cp-title" data-shot="events"><small>Jadwal Tayang</small>Rangkaian Acara</h2>
    ${d.events.map(ticket).join('')}
  </section>

  ${d.story.length ? `
  <section class="cp-sec cp-sec--alt">
    <h2 class="cp-title" data-shot="story"><small>Behind The Scenes</small>Kisah Cinta Kami</h2>
    <ol class="cp-scenes">${d.story.map((s, i) => `
      <li data-reveal><div class="cp-clap"><small>Scene</small><b>${pad(i + 1)}</b><small>${h.esc(s.date)}</small></div><div><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></div></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="cp-sec">
    <h2 class="cp-title" data-shot="gallery"><small>Movie Stills</small>Galeri</h2>
    <div class="cp-stills">${d.gallery.map((u, i) => `
      <button class="cp-still cp-still--${i % 3}" data-reveal data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}<span>${pad(i + 1)}</span></button>`).join('')}
    </div>
  </section>` : ''}

  <section class="cp-sec cp-sec--alt">
    <h2 class="cp-title" data-shot="rsvp"><small>Reservasi Kursi</small>Konfirmasi Kehadiran</h2>
    <form class="cp-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="cp-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Kursi<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ulasan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ulasan dan doa untuk kedua mempelai"></textarea></label>
      <button type="submit" class="cp-btn cp-btn--play">Pesan Kursi</button>
      <p class="cp-form__done" data-rsvp-done hidden>Kursi Anda sudah dipesan. Sampai jumpa di hari H!</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="cp-sec">
    <h2 class="cp-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="cp-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="cp-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="cp-btn cp-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="cp-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="cp-btn cp-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="cp-sec cp-sec--alt">
    <h2 class="cp-title" data-shot="wishes"><small>Ulasan Penonton</small>Ucapan &amp; Doa</h2>
    <div class="cp-wishes" data-wishes></div>
  </section>

  <footer class="cp-credits">
    <p class="cp-credits__end">The Beginning</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    <dl>
      <div><dt>Pemeran Utama</dt><dd>${h.esc(g.name)}<br>${h.esc(b.name)}</dd></div>
      ${parentsLine ? `<div><dt>Produser</dt><dd>${h.esc(parentsLine)}</dd></div>` : ''}
      <div><dt>Pemeran Pendukung</dt><dd>Keluarga, sahabat, dan Anda</dd></div>
      ${d.photoCredit ? `<div><dt>Sinematografi</dt><dd>${h.esc(d.photoCredit)}</dd></div>` : ''}
      ${h.brand ? `<div><dt>Undangan Digital</dt><dd>${h.esc(h.brand)}</dd></div>` : ''}
    </dl>
    <p class="cp-credits__thanks">Terima kasih telah menjadi bagian dari kisah kami.</p>
  </footer>
</main>

<div class="cp-lightbox" hidden><button class="cp-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="cp-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      const st = (w.kehadiran || '').toLowerCase();
      const n = st.startsWith('tidak') ? 4 : 5;
      return `<article class="cp-wish"><header><b>${h.esc(w.nama)}</b><span class="cp-stars" aria-label="${n} bintang">${stars(n)}</span></header><p>${h.esc(w.ucapan)}</p>${w.kehadiran ? `<small>${h.esc(w.kehadiran)}</small>` : ''}</article>`;
    },

    mount(root) {
      const lb = root.querySelector('.cp-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      // hitung mundur film 3-2-1
      const leader = root.querySelector('.cp-leader'), num = leader.querySelector('span');
      root.querySelector('#cover').classList.add('is-closing');
      leader.classList.add('is-on');
      return new Promise((ok) => {
        let n = 3;
        const tick = setInterval(() => {
          n -= 1;
          if (n > 0) { num.textContent = n; return; }
          clearInterval(tick);
          root.querySelector('#cover').classList.add('is-gone');
          leader.classList.add('is-done');
          ok();
        }, 550);
      });
    },
  };
})();
