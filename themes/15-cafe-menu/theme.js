/* Tema 15 — Café Menu
 * Undangan sebagai kafe modern: sampul = struk pesanan yang tercetak dengan nama tamu,
 * acara = daftar menu, hitung mundur = cangkir kopi yang terisi, ucapan = catatan pelanggan.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const BEAN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C7 2 4 7 4 12s3 10 8 10 8-5 8-10S17 2 12 2zm1.6 17.6c-1.9-2.1-2.3-4.4-1.2-7.1 1-2.6.6-5.1-1.2-7.4C15.6 5.6 18 8.6 18 12s-1.8 6.7-4.4 7.6z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');

  const cup = () => `
    <div class="cf-cup" aria-hidden="true">
      <div class="cf-cup__steam"><i></i><i></i><i></i></div>
      <div class="cf-cup__body"><div class="cf-cup__coffee"></div><div class="cf-cup__art"></div></div>
      <div class="cf-cup__handle"></div>
      <div class="cf-cup__plate"></div>
    </div>`;

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}` : '';
      const order = dt ? `${pad(dt.getDate())}${pad(dt.getMonth() + 1)}` : '0001';
      const guest = h.guest || 'Tamu Undangan';

      const item = (p, role, flavor) => `
        <article class="cf-item" data-reveal>
          <div class="cf-item__photo">${h.img(p.photo, p.name, '', h.initials(p.nick))}</div>
          <div class="cf-item__body">
            <div class="cf-item__head"><h3>${h.esc(p.name)}</h3><span>∞</span></div>
            <p class="cf-item__flavor">${role} · ${flavor}</p>
            ${p.parents ? `<p>${role === 'Mempelai Pria' ? 'Putra' : 'Putri'} dari ${h.esc(p.parents)}</p>` : ''}
            ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
          </div>
        </article>`;

      const menu = (e) => `
        <article class="cf-menu" data-reveal>
          <div class="cf-menu__line"><h3>${h.esc(e.title)}</h3><i></i><b>${h.esc(h.time(e.start))}</b></div>
          <p class="cf-menu__desc">${h.esc(h.date(e.start))} · ${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} WIB</p>
          <p class="cf-menu__place"><b>${h.esc(e.place)}</b>${e.address ? ` — ${h.esc(e.address)}` : ''}</p>
          <div class="cf-menu__btns">
            ${e.maps ? `<a class="cf-btn cf-btn--line" href="${h.esc(h.mapsUrl(e))}" target="_blank" rel="noopener">Lihat Peta</a>` : ''}
            <a class="cf-btn cf-btn--line" href="${h.esc(h.calendarUrl(e, d))}" target="_blank" rel="noopener">Simpan Tanggal</a>
          </div>
        </article>`;

      const cell = (k, label) => `<div><span data-cd="${k}">00</span><small>${label}</small></div>`;
      const row = (l, r) => `<div class="cf-receipt__row"><span>${l}</span><span>${r}</span></div>`;

      return `
<section class="cf-cover" id="cover">
  <div class="cf-window">
    ${h.img(d.cover, `${g.nick} & ${b.nick}`, 'cf-window__img', h.initials(g.nick, b.nick))}
    <p class="cf-sign">${h.esc(g.nick)} <span>&amp;</span> ${h.esc(b.nick)}</p>
  </div>
  <div class="cf-printer" aria-hidden="true"></div>
  <div class="cf-receipt-wrap">
    <div class="cf-receipt">
      <p class="cf-receipt__brand">Café ${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</p>
      <p class="cf-receipt__center">— Order #${h.esc(order)} —</p>
      <div class="cf-receipt__guest"><small>Atas nama</small><b>${h.esc(guest)}</b></div>
      ${row('1x Undangan Pernikahan', 'Gratis')}
      ${row('1x Doa Restu', 'Priceless')}
      ${row('Tanggal', h.esc(stamp))}
      <div class="cf-receipt__total">${row('TOTAL', 'Kehadiran Anda')}</div>
      <div class="cf-receipt__bar" aria-hidden="true"></div>
    </div>
  </div>
  <button class="cf-btn cf-btn--dark" data-open>${BEAN} Lihat Menu</button>
  <p class="cf-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
</section>

<main id="main">
  <section class="cf-hero" data-shot="hero">
    <p class="cf-hero__kicker" data-reveal>Today's Special</p>
    <h1 data-reveal>${h.esc(g.nick)} <em>&amp;</em> ${h.esc(b.nick)}</h1>
    <p class="cf-hero__sub" data-reveal>The Wedding Blend · ${h.esc(h.year(e0.start))}</p>
    <div class="cf-hero__photo" data-reveal>${h.img(d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, '', h.initials(g.nick, b.nick))}<span class="cf-badge">Fresh<br>Brew</span></div>
    <p class="cf-hero__date" data-reveal>${h.esc(h.date(e0.start))}</p>
  </section>

  ${d.quote ? `
  <section class="cf-note" data-reveal>
    <small>Barista's Note</small>
    <p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}
  </section>` : ''}

  <section class="cf-sec">
    <h2 class="cf-title" data-shot="couple"><small>Signature Blend</small>Kedua Mempelai</h2>
    ${item(g, 'Mempelai Pria', 'bold & hangat')}
    ${item(b, 'Mempelai Wanita', 'manis & lembut')}
  </section>

  <section class="cf-sec cf-sec--dark">
    <h2 class="cf-title" data-shot="countdown"><small>Brewing Time</small>Menuju Hari Bahagia</h2>
    <div class="cf-brew" data-reveal>
      ${cup()}
      <div class="cf-count" data-countdown="${h.esc(e0.start)}">${cell('d', 'Hari')}${cell('h', 'Jam')}${cell('m', 'Menit')}${cell('s', 'Detik')}</div>
      <p class="cf-brew__note">Cangkir terisi penuh di hari bahagia kami</p>
    </div>
  </section>

  <section class="cf-sec cf-sec--board">
    <h2 class="cf-title" data-shot="events"><small>Menu Hari Ini</small>Rangkaian Acara</h2>
    ${d.events.map(menu).join('')}
  </section>

  ${d.story.length ? `
  <section class="cf-sec">
    <h2 class="cf-title" data-shot="story"><small>Our Blend</small>Kisah Cinta Kami</h2>
    <ol class="cf-story">${d.story.map((s, i) => `
      <li data-reveal><span class="cf-story__no">${pad(i + 1)}</span><div><small>${h.esc(s.date)}</small><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></div></li>`).join('')}
    </ol>
  </section>` : ''}

  ${d.gallery.length ? `
  <section class="cf-sec cf-sec--kraft">
    <h2 class="cf-title" data-shot="gallery"><small>Coffee Moments</small>Galeri</h2>
    <div class="cf-gallery">${d.gallery.map((u, i) => `
      <button class="cf-photo" data-reveal data-zoom="${h.esc(u)}" style="--r:${[-2.5, 2, -1, 3, -2, 1.5][i % 6]}deg" aria-label="Perbesar foto ${i + 1}">${h.img(u, 'Foto ' + (i + 1))}</button>`).join('')}
    </div>
  </section>` : ''}

  <section class="cf-sec">
    <h2 class="cf-title" data-shot="rsvp"><small>Reservasi</small>Konfirmasi Kehadiran</h2>
    <form class="cf-form" data-rsvp data-reveal>
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="cf-choice"><legend>Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Tidak Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ucapan untuk kedua mempelai"></textarea></label>
      <button type="submit" class="cf-btn cf-btn--dark">Pesan Tempat</button>
      <p class="cf-form__done" data-rsvp-done hidden>Reservasi Anda sudah kami catat. Sampai jumpa!</p>
    </form>
  </section>

  ${d.gifts.length || d.giftAddress ? `
  <section class="cf-sec cf-sec--soft">
    <h2 class="cf-title" data-shot="gift"><small>Tip Jar</small>Amplop Digital</h2>
    <p class="cf-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="cf-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="cf-btn cf-btn--line" data-copy="${h.esc(x.number)}">Salin</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="cf-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="cf-btn cf-btn--line" data-copy="${h.esc(d.giftAddress)}">Salin</button></article>` : ''}
  </section>` : ''}

  <section class="cf-sec">
    <h2 class="cf-title" data-shot="wishes"><small>Catatan Pelanggan</small>Ucapan &amp; Doa</h2>
    <div class="cf-wishes" data-wishes></div>
  </section>

  <footer class="cf-footer">
    <div class="cf-footer__receipt">
      <p class="cf-receipt__brand">Café ${h.esc(g.nick)} &amp; ${h.esc(b.nick)}</p>
      <p>Terima kasih telah mampir.<br>Sampai jumpa di hari bahagia kami!</p>
      ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
      ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
    </div>
  </footer>
</main>

<div class="cf-lightbox" hidden><button class="cf-lightbox__close" aria-label="Tutup">×</button><img alt=""></div>
<button class="cf-music" data-music aria-label="Putar/hentikan musik">${NOTE}</button>`;
    },

    renderWish(w, h) {
      return `<article class="cf-wish"><p>${h.esc(w.ucapan)}</p><footer>— ${h.esc(w.nama)}${w.kehadiran ? ` <span>${h.esc(w.kehadiran)}</span>` : ''}</footer></article>`;
    },

    mount(root, d, h) {
      // cangkir terisi sesuai kedekatan hari H (180 hari terakhir)
      const target = h.parseDate((d.events[0] || {}).start);
      const cupEl = root.querySelector('.cf-cup');
      if (target && cupEl) {
        const pct = Math.min(96, Math.max(12, 100 - ((target - Date.now()) / (180 * 86400e3)) * 100));
        cupEl.style.setProperty('--fill', pct + '%');
      }
      const lb = root.querySelector('.cf-lightbox'), img = lb.querySelector('img');
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    },

    onOpen(root) {
      root.querySelector('#cover').classList.add('is-leaving');
      return new Promise((ok) => setTimeout(() => { root.querySelector('#cover').classList.add('is-gone'); ok(); }, 800));
    },
  };
})();
