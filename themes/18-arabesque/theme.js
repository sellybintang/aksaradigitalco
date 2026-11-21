/* Tema 18 — Arabesque
 * Nuansa Maroko untuk pasangan muslim: hijau zamrud & emas, pola zellige, lengkung pintu,
 * lentera berayun. Sampul = pintu kayu dalam lengkungan yang terbuka memperlihatkan foto.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');
  const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
  const DOA = 'بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ';

  const arch = (h, url, alt, cls, ph) => `<div class="ar-arch ${cls || ''}"><div class="ar-arch__in">${h.img(url, alt, '', ph)}</div></div>`;
  const lanterns = () => `<div class="ar-lanterns" aria-hidden="true">${[0, 1, 2].map((i) => `<span class="ar-lantern ar-lantern--${i}"><i></i></span>`).join('')}</div>`;
  const star = () => '<span class="ar-star" aria-hidden="true"></span>';

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())} . ${pad(dt.getMonth() + 1)} . ${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);

      const person = (p, role) => `
        <article class="ar-person" data-reveal>
          ${arch(h, p.photo, p.name, 'ar-arch--sm', h.initials(p.nick))}
          <h3>${h.esc(p.name)}</h3>
          ${p.parents ? `<p>${role === 'pria' ? 'Putra' : 'Putri'} dari<br>${h.esc(p.parents)}</p>` : ''}
          ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
        </article>`;

      const event = (e) => `
        <article class="ar-event" data-reveal>
          <div class="ar-event__top">${star()}</div>
          <h3>${h.esc(e.title)}</h3>
          <p class="ar-event__date">${h.esc(h.date(e.start))}</p>
          <p class="ar-event__time">Pukul ${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</p>
          <p class="ar-event__place"><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</p>
          <div class="ar-event__btns">
            <a class="ar-btn ar-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>
            <a class="ar-btn ar-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
          </div>
        </article>`;

      const cell = (k, label) => `<div class="ar-count__cell"><div class="ar-count__star"><span data-cd="${k}">00</span></div><small>${label}</small></div>`;

      return `
<section class="ar-cover" id="cover">
  ${lanterns()}
  <p class="ar-bismillah" lang="ar" dir="rtl">${BISMILLAH}</p>
  <div class="ar-portal" id="ar-portal">
    <div class="ar-portal__frame">
      <div class="ar-portal__in">
        ${h.img(d.cover, `${g.nick} & ${b.nick}`, 'ar-portal__img', ini)}
        <div class="ar-door ar-door--l"></div>
        <div class="ar-door ar-door--r"></div>
      </div>
    </div>
  </div>
  <p class="ar-cover__kicker">The Wedding of</p>
  <h1 class="ar-cover__names">${h.esc(g.nick)} <span>&amp;</span> ${h.esc(b.nick)}</h1>
  <div class="ar-cover__guest"><small>Kepada Yth. Bapak/Ibu/Saudara/i</small><b>${h.esc(guest)}</b></div>
  <button class="ar-btn ar-btn--gold" data-open>Buka Undangan</button>
  <p class="ar-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>

<main id="main">
  <section class="ar-hero" data-shot="hero">
    ${lanterns()}
    <p class="ar-bismillah ar-bismillah--hero" lang="ar" dir="rtl" data-reveal>${BISMILLAH}</p>
    <p class="ar-salam" data-reveal>Assalamu'alaikum Warahmatullahi Wabarakatuh</p>
    <p class="ar-intro" data-reveal>Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.</p>
    <div data-reveal>${arch(h, d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, 'ar-arch--hero', ini)}</div>
    <h1 data-reveal>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
    <p class="ar-hero__date" data-reveal>${h.esc(stamp)}</p>
  </section>

  ${d.quote ? `
  <section class="ar-quote" data-reveal>
    ${star()}
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="ar-sec ar-sec--cream">
    <h2 class="ar-title" data-shot="couple"><small>Mempelai</small>Kedua Mempelai</h2>
    <div class="ar-people">${person(g, 'pria')}<p class="ar-amp" aria-hidden="true">&amp;</p>${person(b, 'wanita')}</div>
  </section>

  <section class="ar-sec">
    <h2 class="ar-title" data-shot="countdown"><small>Hitung Mundur</small>Menuju Hari Bahagia</h2>
    <div class="ar-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
  </section>

  <section class="ar-sec ar-sec--cream">
    <h2 class="ar-title" data-shot="events"><small>Waktu &amp; Tempat</small>Rangkaian Acara</h2>
    <div class="ar-events">${d.events.map(event).join('')}</div>
  </section>

  ${d.story.length ? `
  <section class="ar-sec">
    <h2 class="ar-title" data-shot="story"><small>Perjalanan</small>Kisah Cinta Kami</h2>
    <ol class="ar-story">${d.story.map((s) => `
      <li data-reveal>${star()}<div><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></div></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="ar-sec ar-sec--cream">
    <h2 class="ar-title" data-shot="gallery"><small>Momen Bahagia</small>Galeri</h2>
    <div class="ar-gallery">${d.gallery.map((u, i) => `
      <button class="ar-gal ar-gal--${i % 3}" data-reveal data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${arch(h, u, 'Foto ' + (i + 1))}</button>`).join('')}
    </div>
  </section>` : ''}

  <section class="ar-sec">
    <h2 class="ar-title" data-shot="rsvp"><small>RSVP</small>Konfirmasi Kehadiran</h2>
    <form class="ar-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="ar-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ucapan dan doa untuk kedua mempelai"></textarea></label>
      <button type="submit" class="ar-btn ar-btn--gold">Kirim</button>
      <p class="ar-form__done" data-rsvp-done hidden>Jazakumullahu khairan atas konfirmasinya.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="ar-sec ar-sec--cream">
    <h2 class="ar-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="ar-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="ar-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="ar-btn ar-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="ar-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="ar-btn ar-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="ar-sec">
    <h2 class="ar-title" data-shot="wishes"><small>Doa &amp; Harapan</small>Ucapan</h2>
    <div class="ar-wishes" data-wishes></div>
  </section>

  <footer class="ar-footer">
    <p class="ar-doa" lang="ar" dir="rtl">${DOA}</p>
    <p class="ar-doa__id">“Semoga Allah memberkahimu dan menetapkan berkah atasmu, serta mengumpulkan kalian berdua dalam kebaikan.” (HR. Abu Dawud)</p>
    <p class="ar-salam">Wassalamu'alaikum Warahmatullahi Wabarakatuh</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<div class="ar-lightbox" hidden><button class="ar-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="ar-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="ar-wish"><header><b>${h.esc(w.nama)}</b>${w.kehadiran ? `<span>${h.esc(w.kehadiran)}</span>` : ''}</header><p>${h.esc(w.ucapan)}</p></article>`;
    },

    mount(root) {
      const lb = root.querySelector('.ar-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      // pintu terbuka → masuk ke dalam lengkungan
      const cover = root.querySelector('#cover');
      cover.classList.add('is-opening');
      return new Promise((ok) => {
        setTimeout(() => cover.classList.add('is-entering'), 1100);
        setTimeout(() => { cover.classList.add('is-gone'); ok(); }, 1900);
      });
    },
  };
})();
