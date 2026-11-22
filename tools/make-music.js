// Membuat musik latar orisinal (bebas royalti) dengan sintesis sederhana, lalu diubah ke MP3 oleh ffmpeg.
// Jalankan: node tools/make-music.js            -> assets/music/gending-manten.mp3
// Gaya: "gending manten" yang ceria & romantis — tangga nada pentatonis mayor (cerah, bukan seram),
// tempo hidup, kendang, saron/peking, bonang, siter dipetik, suling sebagai melodi, gong ringan.
// Semua melodi & aransemen di sini ciptaan sendiri.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SR = 44100;
const TAU = Math.PI * 2;

/* ---------- nada: pentatonis mayor di G (1=G 2=A 3=B 5=D 6=E) ---------- */
const BASE = { 1: 392.0, 2: 440.0, 3: 493.88, 5: 587.33, 6: 659.25 };
// "6," = oktaf bawah, "1'" = oktaf atas
const hz = (s) => { const n = parseInt(s, 10); let f = BASE[n]; for (const ch of s.slice(1)) f *= ch === "'" ? 2 : ch === ',' ? .5 : 1; return f; };
const seq = (s) => s.trim().split(/\s+/);

/* ---------- komposisi ---------- */
// balungan per bagian (tiap angka = 1 ketukan), ditulis per gatra (4 ketukan)
const A = seq(`3 2 3 5  6 5 3 2  5 6 1' 6  5 3 2 1
               2 3 5 6  5 3 2 3  1 2 3 5  6 5 3 5`);
const B = seq(`6 1' 2' 1'  6 5 6 1'  2' 3' 2' 1'  6 5 3 5
               6 5 3 2  3 5 6 5  3 2 1 2  3 2 1 1`);
const INTRO = seq(`5 6 1' 6  5 3 2 1`);
// suling: [nada, panjang dalam ketukan] — melodi lirih yang "bernyanyi" di atas balungan
const SUL_A = [["3'", 1.5], ["2'", .5], ["3'", 1], ["5'", 1], ["6'", 2], ["5'", 1], ["3'", 1], ["5'", 1], ["6'", 1], ["1''", 2], ["6'", 1], ["5'", 1], ["3'", 1], ["2'", 1],
  ["2'", 1.5], ["3'", .5], ["5'", 1], ["6'", 1], ["5'", 1.5], ["3'", .5], ["2'", 1], ["3'", 1], ["1'", 1], ["2'", 1], ["3'", 1], ["5'", 1], ["6'", 2], ["5'", 2]];
const SUL_B = [["6'", 1], ["1''", 1], ["2''", 2], ["1''", 1], ["6'", 1], ["5'", 2], ["2''", 1], ["3''", 1], ["2''", 1], ["1''", 1], ["6'", 2], ["5'", 2],
  ["6'", 1.5], ["5'", .5], ["3'", 2], ["3'", 1], ["5'", 1], ["6'", 2], ["3'", 1], ["2'", 1], ["1'", 1], ["2'", 1], ["3'", 2], ["1'", 2]];
const SUL_INTRO = [["5'", 2], ["6'", 1], ["1''", 1], ["6'", 1.5], ["5'", .5], ["3'", 1], ["2'", 1]];

// susunan lagu
const PARTS = [
  { bal: INTRO, sul: SUL_INTRO, full: false },
  { bal: A, sul: SUL_A, full: true },
  { bal: B, sul: SUL_B, full: true },
  { bal: A, sul: SUL_A, full: true, end: true },
];
const BEAT = 0.31;                                   // ~97 ketukan/menit

// peta waktu ketukan (dengan ritardando di 6 ketukan terakhir)
const beats = []; let tt = 0.6;
PARTS.forEach((p, pi) => p.bal.forEach((n, i) => {
  const left = p.end ? p.bal.length - i : 99;
  const d = BEAT * (left <= 6 ? 1 + (7 - left) * .12 : 1);
  beats.push({ t: tt, d, n, part: pi, i, full: p.full, end: p.end && left === 1 });
  tt += d;
}));
const LEN = tt + 4.5;

/* ---------- mesin suara (stereo) ---------- */
const L = new Float32Array(Math.ceil(LEN * SR)), R = new Float32Array(L.length);
const add = (t0, dur, pan, fn) => {
  const s = Math.floor(t0 * SR), n = Math.floor(dur * SR), gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && s + i < L.length; i++) { const v = fn(i / SR); L[s + i] += v * gl; R[s + i] += v * gr; }
};
const metal = (f, amp, decay, partials) => (t) => {
  let v = 0; for (const [r, a] of partials) v += a * Math.sin(TAU * f * r * t);
  return amp * Math.min(1, t / .003) * Math.exp(-t * decay) * v;
};
const SARON = [[1, 1], [2.76, .25], [5.4, .08]];
const BONANG = [[1, 1], [2.0, .12], [2.98, .18]];

// siter: Karplus–Strong (senar dipetik)
const pluck = (f, amp, dur) => {
  const n = Math.max(2, Math.round(SR / f)), line = new Float32Array(n);
  { let lpv = 0; for (let i = 0; i < n; i++) { lpv += (Math.random() * 2 - 1 - lpv) * .5; line[i] = lpv * 1.6; } }
  const out = new Float32Array(Math.floor(dur * SR)); let p = 0;
  for (let i = 0; i < out.length; i++) { const a = line[p], b = line[(p + 1) % n]; line[p] = (a + b) * .4985; out[i] = a * amp; p = (p + 1) % n; }
  return (t) => out[Math.min(out.length - 1, Math.floor(t * SR))];
};
// kendang: "dhung" (bulat, nada turun), "tak" (tepukan), "ket" (kecil)
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const dhung = (amp) => { let ph = 0; return (t) => { ph += TAU * (110 + 90 * Math.exp(-t * 30)) / SR; return amp * Math.exp(-t * 16) * Math.sin(ph); }; };
const tak = (amp) => { let lp = 0; return (t) => { lp += (rnd() - lp) * .18; return amp * Math.exp(-t * 55) * (lp * .7 + .6 * Math.sin(TAU * 380 * t)); }; };
const ket = (amp) => (t) => amp * Math.exp(-t * 30) * Math.sin(TAU * (300 + 60 * Math.exp(-t * 40)) * t);

/* ---------- aransemen ---------- */
for (const b of beats) {
  const f = hz(b.n);
  if (b.full) {
    add(b.t, 1.6, -.15, metal(f / 2, .30, 3.0, SARON));                                   // saron (balungan)
    add(b.t, .7, .35, metal(f, .10, 6, SARON)); add(b.t + b.d / 2, .7, .35, metal(f, .08, 6, SARON));  // peking (dobel)
    // bonang: pola mipil — nada & nada atasnya bergantian, 2 pukulan per ketukan
    const up = hz(String(b.n).replace(/[',]/g, '') === '6' ? "1'" : { 1: '2', 2: '3', 3: '5', 5: '6' }[String(b.n)[0]] + String(b.n).slice(1));
    add(b.t, 1.0, -.45, metal(f, .09, 4.5, BONANG)); add(b.t + b.d / 2, 1.0, -.45, metal(up, .07, 4.5, BONANG));
    if (b.i % 4 === 3) add(b.t, 2.4, .1, metal(f / 2, .16, 1.8, [[1, 1], [2.02, .2]]));   // kenong tiap gatra
    if (b.i % 4 === 1) add(b.t, .6, .2, metal(f, .05, 9, [[1, 1], [3, .15]]));            // kethuk
    // kendang: dhung . tak dhung | tak . dhung tak (per gatra, setengah ketukan)
    const pat = ['D', '', 'k', 'T', '', 'k', 'D', 'T'], k = (b.i % 2) * 4;
    for (let h = 0; h < 4; h++) {
      const s = pat[k + h], th = b.t + h * b.d / 4 * 2 / 2;
      if (s === 'D') add(th, .5, 0, dhung(.3)); else if (s === 'T') add(th, .2, .05, tak(.12)); else if (s === 'k') add(th, .2, .05, ket(.12));
    }
  }
  // siter: arpeggio cepat (4 petikan per ketukan) dari nada balungan
  const chord = [f, f * 1.25, f * 1.5, f * 2].map((x) => x / 2);
  for (let h = 0; h < 4; h++) add(b.t + h * b.d / 4, 1.4, h % 2 ? .55 : -.55, pluck(chord[(b.i + h) % 4], b.full ? .13 : .2, 1.4));
  // gong: ringan & pendek di akhir tiap putaran
  if (b.i === PARTS[b.part].bal.length - 1) add(b.t, b.end ? 5 : 3.2, 0, metal(98, b.end ? .34 : .26, b.end ? .8 : 1.3, [[1, 1], [1.009, .7], [2.0, .2]]));
}

// suling: satu jalur kontinu dengan portamento, vibrato, & napas
{
  const notes = []; let bi = 0;
  PARTS.forEach((p) => {
    let acc = 0; const start = beats.findIndex((b, k) => k >= bi && b.part === PARTS.indexOf(p));
    for (const [n, len] of p.sul) {
      const b0 = beats[start + Math.floor(acc)], t0 = b0.t + (acc % 1) * b0.d;
      const b1 = beats[Math.min(beats.length - 1, start + Math.floor(acc + len))], t1 = b1.t + ((acc + len) % 1) * b1.d;
      notes.push({ f: hz(n), t0, t1: Math.max(t1, t0 + .1) }); acc += len;
    }
    bi = start + p.bal.length;
  });
  let ph = 0, fcur = notes[0].f, lp = 0;
  const s0 = Math.floor(notes[0].t0 * SR), s1 = Math.min(L.length, Math.floor((notes[notes.length - 1].t1 + 1.2) * SR));
  let ni = 0;
  for (let s = s0; s < s1; s++) {
    const t = s / SR;
    while (ni < notes.length - 1 && t >= notes[ni + 1].t0) ni++;
    const nt = notes[ni], since = t - nt.t0;
    fcur += (nt.f - fcur) * .0025;                                     // portamento halus
    const vib = 1 + .006 * Math.sin(TAU * 5.2 * t) * Math.min(1, Math.max(0, since - .18) * 3);
    ph += TAU * fcur * vib / SR;
    const tail = t > notes[notes.length - 1].t1 ? Math.exp(-(t - notes[notes.length - 1].t1) * 3) : 1;
    const env = Math.min(1, since / .05 + .55) * tail;
    lp += (rnd() - lp) * .08;
    const v = .1 * env * (Math.sin(ph) + .18 * Math.sin(2 * ph) + .05 * Math.sin(3 * ph)) + .012 * env * lp;
    L[s] += v * .62; R[s] += v * .78;
  }
}

/* ---------- normalisasi, fade, WAV ---------- */
let peak = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const pcm = Buffer.alloc(L.length * 4);
for (let i = 0; i < L.length; i++) {
  const x = i / SR, fade = Math.min(1, x / .4, (LEN - x) / 2.5);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] / peak * .88 * fade)) * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] / peak * .88 * fade)) * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write('RIFF', 0); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVE', 8);
header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24); header.writeUInt32LE(SR * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
const wav = path.join(os.tmpdir(), 'gending-manten.wav');
fs.writeFileSync(wav, Buffer.concat([header, pcm]));

// ffmpeg: ruang kecil yang hangat (gema pendek), normalisasi, MP3
const ff = require('./ffmpeg-path')();
const outDir = path.join(ROOT, 'assets', 'music');
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, 'gending-manten.mp3');
execFileSync(ff, ['-y', '-loglevel', 'error', '-i', wav,
  '-af', 'aecho=0.85:0.45:38|71:0.16|0.09,highpass=f=80,equalizer=f=140:t=q:w=1:g=-3,lowpass=f=9500,loudnorm=I=-16:TP=-1.5',
  '-ar', '44100', '-b:a', '192k', out]);
fs.rmSync(wav);
console.log(`✓ ${path.relative(ROOT, out)}  (${LEN.toFixed(1)} dtk)`);
