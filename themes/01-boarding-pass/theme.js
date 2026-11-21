/* Tema 01 — Boarding Pass
 * Undangan sebagai tiket pesawat: sampul = boarding pass yang disobek,
 * hitung mundur = papan keberangkatan, acara = tiket per gate, RSVP = check-in.
 */
(function () {
  const PLANE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg>';
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';

  const code = (s) => String(s || '').replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase().padEnd(3, 'X');
  // Barcode dekoratif yang konsisten per slug (bukan acak tiap dibuka)
  function barcode(seed) {
    let x = 0; for (const c of String(seed)) x = (x * 31 + c.charCodeAt(0)) >>> 0;
    let bars = '';
    for (let i = 0; i < 46; i++) { x = (x * 1103515245 + 12345) >>> 0; bars += `<i style="flex:${1 + (x % 3)}"></i>`; }
    return `<div class="bp-barcode" aria-hidden="true">${bars}</div>`;
  }

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const flight = `${h.initials(g.nick, b.nick)} ${String(h.year(e0.start)).slice(-2)}${String(h.parseDate(e0.start) ? h.parseDate(e0.start).getMonth() + 1 : '').padStart(2, '0')}`;
      const guest = h.guest || 'Tamu Undangan';

      const passenger = (p, role) => `
        <article class="bp-passport" data-reveal>
          ${h.img(p.photo, p.name, 'bp-passport__photo', p.nick)}
          <div class="bp-passport__body">
            <small>${role}</small>
            <h3>${h.esc(p.name)}</h3>
            ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}</p>` : ''}
            ${p.ig ? `<a class="bp-link" href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
          <span class="bp-stamp">${role === 'Mempelai Pria' ? 'P1' : 'P2'}</span>
        </article>`;

      const eventCard = (e, i) => `
        <article class="bp-mini" data-reveal>
          <header><span>${PLANE} ${h.esc(e.title)}</span><span>GATE ${String.fromCharCode(65 + i)}${i + 1}</span></header>
          <div class="bp-mini__grid">
            <div><small>TANGGAL</small><b>${h.esc(h.date(e.start))}</b></div>
            <div><small>WAKTU</small><b>${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</b></div>
            <div class="bp-span"><small>TEMPAT</small><b>${h.esc(e.place)}</b>${e.address ? `<p>${h.esc(e.address)}</p>` : ''}</div>
          </div>
          <footer>
            <a class="bp-btn bp-btn--ghost" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>
            <a class="bp-btn bp-btn--ghost" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan ke Kalender</a>
          </footer>
        </article>`;

      const flap = (k, label) => `<div class="bp-flap"><span data-cd="${k}">00</span><small>${label}</small></div>`;

      return `
<section class="bp-cover" id="cover">
  <div class="bp-cover__sky" aria-hidden="true"><span class="bp-cloud c1"></span><span class="bp-cloud c2"></span><span class="bp-cloud c3"></span><span class="bp-jet">${PLANE}</span></div>
  <p class="bp-cover__eyebrow">The Wedding Flight of</p>
  <div class="bp-ticket" id="bp-ticket">
    <div class="bp-ticket__main">
      <header class="bp-ticket__head"><span>${PLANE} LOVE AIRWAYS</span><span>BOARDING PASS</span></header>
      <div class="bp-route">
        <div><b>${code(g.nick)}</b><span>${h.esc(g.nick)}</span></div>
        <div class="bp-route__line">${PLANE}</div>
        <div><b>${code(b.nick)}</b><span>${h.esc(b.nick)}</span></div>
      </div>
      <div class="bp-fields">
        <div class="bp-span"><small>PASSENGER</small><b class="bp-guest">${h.esc(guest)}</b></div>
        <div><small>FLIGHT</small><b>${h.esc(flight)}</b></div>
        <div><small>DATE</small><b>${h.esc(h.dateShort(e0.start))}</b></div>
        <div><small>BOARDING</small><b>${h.esc(h.time(e0.start))}</b></div>
        <div><small>SEAT</small><b>VIP</b></div>
      </div>
    </div>
    <div class="bp-ticket__stub">
      ${barcode(d.slug)}
      <button class="bp-btn bp-btn--primary" data-open>Sobek Tiket &amp; Buka</button>
    </div>
  </div>
  <p class="bp-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>

<main id="main">
  <section class="bp-hero" data-shot="hero">
    <div class="bp-hero__photo">${h.img(d.cover, `${g.nick} & ${b.nick}`, 'bp-hero__img', `${h.initials(g.nick, b.nick)}`)}</div>
    <div class="bp-hero__text" data-reveal>
      <p class="bp-status"><span class="bp-dot"></span> NOW BOARDING</p>
      <h1>${h.esc(g.nick)} <em>&amp;</em> ${h.esc(b.nick)}</h1>
      <p class="bp-mono">${h.esc(h.date(e0.start))}</p>
    </div>
  </section>

  ${d.quote ? `<section class="bp-quote" data-reveal><p>“${h.esc(d.quote)}”</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}</section>` : ''}

  <section class="bp-section">
    <h2 class="bp-title" data-shot="couple"><small>Passenger List</small>Kedua Mempelai</h2>
    <div class="bp-passports">${passenger(g, 'Mempelai Pria')}${passenger(b, 'Mempelai Wanita')}</div>
  </section>

  <section class="bp-section bp-board" data-reveal>
    <h2 class="bp-title bp-title--light" data-shot="countdown"><small>Departure Board</small>Menuju Hari Bahagia</h2>
    <div class="bp-board__row"><span>${h.esc(flight)}</span><span>${h.esc(code(g.nick))} → ${h.esc(code(b.nick))}</span><span class="bp-ontime">ON TIME</span></div>
    <div class="bp-flaps" data-countdown="${h.esc(e0.start)}">${flap('d', 'Hari')}${flap('h', 'Jam')}${flap('m', 'Menit')}${flap('s', 'Detik')}</div>
  </section>

  <section class="bp-section">
    <h2 class="bp-title" data-shot="events"><small>Flight Itinerary</small>Rangkaian Acara</h2>
    ${d.events.map(eventCard).join('')}
  </section>

  ${d.story.length ? `
  <section class="bp-section">
    <h2 class="bp-title" data-shot="story"><small>Flight Log</small>Perjalanan Kami</h2>
    <ol class="bp-log">${d.story.map((s) => `<li data-reveal><span class="bp-log__pin">${PLANE}</span><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></li>`).join('')}</ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="bp-section">
    <h2 class="bp-title" data-shot="gallery"><small>Travel Album</small>Galeri</h2>
    <div class="bp-album">${d.gallery.map((u, i) => `<figure class="bp-postcard" data-reveal style="--r:${(i % 2 ? 1 : -1) * (1 + (i % 3))}deg">${h.img(u, 'Foto ' + (i + 1))}</figure>`).join('')}</div>
  </section>` : ''}

  <section class="bp-section">
    <h2 class="bp-title" data-shot="rsvp"><small>Online Check-in</small>Konfirmasi Kehadiran</h2>
    <form class="bp-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <label>Kehadiran
        <select name="hadir"><option>Hadir</option><option>Tidak Hadir</option><option>Masih Ragu</option></select>
      </label>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ucapan untuk kedua mempelai"></textarea></label>
      <button type="submit" class="bp-btn bp-btn--primary">Check-in Sekarang</button>
      <p class="bp-form__done" data-rsvp-done hidden>✓ Check-in berhasil. Terima kasih!</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="bp-section">
    <h2 class="bp-title" data-shot="gift"><small>Baggage Counter</small>Kirim Hadiah</h2>
    <p class="bp-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="bp-tag" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b class="bp-mono">${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="bp-btn bp-btn--ghost" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="bp-tag" data-reveal><div><small>KIRIM KADO</small><span>${h.esc(d.giftAddress)}</span></div><button class="bp-btn bp-btn--ghost" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="bp-section">
    <h2 class="bp-title" data-shot="wishes"><small>Arrival Log</small>Ucapan &amp; Doa</h2>
    <div class="bp-wishes" data-wishes></div>
  </section>

  <footer class="bp-footer">
    <p class="bp-mono">Thank you for flying with us</p>
    <h2>${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</h2>
    ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
    ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
  </footer>
</main>

<button class="bp-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      const st = (w.kehadiran || '').toLowerCase();
      const cls = st.startsWith('hadir') ? 'ok' : st.startsWith('tidak') ? 'no' : 'maybe';
      return `<article class="bp-wish"><header><b>${h.esc(w.nama)}</b>${w.kehadiran ? `<span class="bp-wish__st bp-wish__st--${cls}">${h.esc(w.kehadiran.toUpperCase())}</span>` : ''}</header><p>${h.esc(w.ucapan)}</p></article>`;
    },

    onOpen(root) {
      const t = root.querySelector('#bp-ticket');
      t.classList.add('is-torn');
      return new Promise((ok) => setTimeout(() => { root.querySelector('#cover').classList.add('is-gone'); ok(); }, 900));
    },
  };
})();
