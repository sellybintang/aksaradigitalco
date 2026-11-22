/* Tema 12 — Editorial
 * Undangan sebagai majalah fashion edisi spesial: sampul majalah dengan cover lines,
 * daftar isi yang bisa diklik, feature story, photo essay, surat pembaca, dan kolofon.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');
  const MONTH = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const issue = dt ? `${MONTH[dt.getMonth()]} ${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);

      // daftar isi — hanya bagian yang benar-benar ada
      const toc = [
        ['ed-couple', 'Profil', 'Mengenal kedua mempelai'],
        ['ed-count', 'Hitung Mundur', 'Menuju hari bahagia'],
        ['ed-events', 'Agenda', 'Waktu & tempat acara'],
        d.story.length && ['ed-story', 'Feature', 'Kisah cinta kami'],
        d.gallery.length && ['ed-gallery', 'Photo Essay', 'Galeri momen'],
        ['ed-rsvp', 'RSVP', 'Konfirmasi kehadiran'],
        (d.gifts.length || d.giftAddress) && ['ed-gift', 'Tanda Kasih', 'Amplop digital'],
        ['ed-letters', 'Surat Pembaca', 'Ucapan & doa'],
      ].filter(Boolean);

      const profile = (p, role) => `
        <article class="ed-profile" data-reveal>
          <div class="ed-profile__photo">${h.img(p.photo, p.name, '', h.initials(p.nick))}</div>
          <div class="ed-profile__body">
            <small>${role}</small>
            <h3>${h.esc(p.name)}</h3>
            ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}</p>` : ''}
            ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
        </article>`;

      const agenda = (e) => {
        const t = h.parseDate(e.start);
        return `
        <article class="ed-agenda" data-reveal>
          <div class="ed-agenda__day"><b>${t ? pad(t.getDate()) : ''}</b><span>${t ? MONTH[t.getMonth()] : ''}</span></div>
          <div class="ed-agenda__body">
            <small>${h.esc(h.date(e.start))}</small>
            <h3>${h.esc(e.title)}</h3>
            <p>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</p>
            <p><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</p>
            <div class="ed-agenda__btns">
              <a class="ed-btn ed-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>
              <a class="ed-btn ed-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
            </div>
          </div>
        </article>`;
      };

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="ed-cover" id="cover">
  ${h.img(d.cover, `${g.nick} & ${b.nick}`, 'ed-cover__img', ini)}
  <div class="ed-cover__shade" aria-hidden="true"></div>
  <header class="ed-mast">
    <span class="ed-mast__top"><span>Edisi Spesial</span><span>Vol. 01</span><span>${h.esc(issue)}</span></span>
    <h1 class="ed-mast__title">AMOUR</h1>
  </header>
  <div class="ed-lines ed-lines--l">
    <p><small>Eksklusif</small><b>Kisah ${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</b></p>
    <p><small>Agenda</small><b>${h.esc(stamp)}</b></p>
  </div>
  <div class="ed-lines ed-lines--r">
    <p><small>Untuk pembaca istimewa</small><b>${h.esc(guest)}</b></p>
  </div>
  <div class="ed-cover__foot">
    <p class="ed-cover__big">${h.esc(g.nick)}<br><em>&amp;</em> ${h.esc(b.nick)}</p>
    <div class="ed-cover__row">
      <button class="ed-btn ed-btn--red" data-open>Baca Edisi Ini</button>
      <span class="ed-barcode" aria-hidden="true"></span>
    </div>
    <p class="ed-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
  </div>
</section>

<main id="main">
  <section class="ed-toc" data-shot="hero">
    <header class="ed-toc__head" data-reveal><h2>Daftar Isi</h2><span>Vol. 01 · ${h.esc(issue)}</span></header>
    <div class="ed-toc__photo" data-reveal>${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, '', ini)}<p class="ed-caption">${h.esc(g.nick)} &amp; ${h.esc(b.nick)}, difoto untuk edisi ini.</p></div>
    <ol class="ed-toc__list">${toc.map(([id, t, sub], i) => `
      <li data-reveal><a href="#${id}"><span class="ed-toc__no">${pad(i + 4)}</span><span><b>${t}</b><em>${sub}</em></span></a></li>`).join('')}
    </ol>
  </section>

  ${d.quote ? `
  <section class="ed-letter" data-reveal>
    <small>Dari Meja Redaksi</small>
    <p class="ed-dropcap">${h.esc(d.quote)}</p>
    ${d.quoteSource ? `<cite>— ${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="ed-sec" id="ed-couple">
    <h2 class="ed-title" data-shot="couple"><small>Profil</small>Kedua Mempelai</h2>
    ${profile(g, 'Mempelai Pria')}
    <p class="ed-pull" data-reveal>“Dua cerita, satu halaman baru.”</p>
    ${profile(b, 'Mempelai Wanita')}
  </section>

  <section class="ed-sec ed-sec--black" id="ed-count">
    <h2 class="ed-title" data-shot="countdown"><small>Hitung Mundur</small>Terbit Sebentar Lagi</h2>
    <div class="ed-count" data-countdown="${h.esc(e0.start)}" data-reveal>${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
  </section>

  <section class="ed-sec" id="ed-events">
    <h2 class="ed-title" data-shot="events"><small>Agenda</small>Rangkaian Acara</h2>
    ${d.events.map(agenda).join('')}
  </section>

  ${d.story.length ? `
  <section class="ed-sec ed-sec--paper" id="ed-story">
    <h2 class="ed-title" data-shot="story"><small>Feature</small>Kisah Cinta Kami</h2>
    <div class="ed-feature">${d.story.map((s, i) => `
      <article data-reveal><h3><span>${h.esc(s.date)}</span>${h.esc(s.title)}</h3><p class="${i === 0 ? 'ed-dropcap' : ''}">${h.esc(s.text)}</p></article>`).join('')}
    </div>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="ed-sec" id="ed-gallery">
    <h2 class="ed-title" data-shot="gallery"><small>Photo Essay</small>Galeri</h2>
    <div class="ed-essay">${d.gallery.map((u, i) => `
      <figure class="ed-shot ed-shot--${i % 5}" data-reveal>
        <button data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}</button>
        <figcaption>${pad(i + 1)}</figcaption>
      </figure>`).join('')}
    </div>
  </section>` : ''}

  <section class="ed-sec ed-sec--paper" id="ed-rsvp">
    <h2 class="ed-title" data-shot="rsvp"><small>RSVP</small>Konfirmasi Kehadiran</h2>
    <form class="ed-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="ed-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Surat untuk Mempelai<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ucapan dan doa Anda"></textarea></label>
      <button type="submit" class="ed-btn ed-btn--red">Kirim</button>
      <p class="ed-form__done" data-rsvp-done hidden>Terima kasih, surat Anda sudah kami terima.</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="ed-sec" id="ed-gift">
    <h2 class="ed-title" data-shot="gift"><small>Tanda Kasih</small>Amplop Digital</h2>
    <p class="ed-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="ed-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="ed-btn ed-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="ed-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="ed-btn ed-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="ed-sec ed-sec--paper" id="ed-letters">
    <h2 class="ed-title" data-shot="wishes"><small>Surat Pembaca</small>Ucapan &amp; Doa</h2>
    <div class="ed-wishes" data-wishes></div>
  </section>

  <footer class="ed-colophon">
    <p class="ed-colophon__mast">AMOUR</p>
    <dl>
      <div><dt>Pemimpin Redaksi</dt><dd>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</dd></div>
      <div><dt>Penerbit</dt><dd>Keluarga besar kedua mempelai</dd></div>
      ${d.photoCredit ? `<div><dt>Fotografer</dt><dd>${h.esc(d.photoCredit)}</dd></div>` : ''}
      ${h.brand ? `<div><dt>Tata Letak</dt><dd>${h.esc(h.brand)}</dd></div>` : ''}
    </dl>
    <p class="ed-colophon__thanks">Terima kasih telah membaca. Sampai jumpa di hari bahagia kami.</p>
  </footer>
</main>

<div class="ed-lightbox" hidden><button class="ed-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="ed-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="ed-wish"><p>“${h.esc(w.ucapan)}”</p><footer><b>${h.esc(w.nama)}</b>${w.kehadiran ? ` — ${h.esc(w.kehadiran)}` : ''}</footer></article>`;
    },

    mount(root) {
      const lb = root.querySelector('.ed-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
      // daftar isi: gulir halus ke bagian
      root.querySelectorAll('.ed-toc__list a').forEach((a) => a.addEventListener('click', (e) => {
        const t = root.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
      }));
    },

    onOpen(root) {
      // sampul dibalik seperti halaman majalah
      root.querySelector('#cover').classList.add('is-turning');
      return new Promise((ok) => setTimeout(() => { root.querySelector('#cover').classList.add('is-gone'); ok(); }, 950));
    },
  };
})();
