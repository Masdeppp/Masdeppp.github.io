/**
 * MEADOW — pemandangan hero.
 *
 * Langit bergradasi, awan yang hanyut pelan dengan tiga kecepatan
 * berbeda, dan tiga lapis bukit yang larut ke warna kertas halaman.
 *
 * Semuanya digambar dari nol dengan SVG dan CSS: tidak ada foto, tidak
 * ada aset, tidak ada karakter, dan tidak menyalin karya studio mana pun.
 * Yang ditiru cuma bahasa visualnya — cat air, warna hangat, bentuk
 * membulat — dan itu memang milik siapa saja.
 *
 * Ini komponen server (tanpa "use client"): tidak ada JavaScript yang
 * dikirim ke browser sama sekali. Awannya bergerak lewat CSS animation,
 * jadi gratis untuk performa dan tetap jalan kalau JS mati.
 */

/** Satu awan: empat elips tumpang tindih, dipusatkan di (0,0). */
function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="88" ry="33" />
      <ellipse cx="-60" cy="11" rx="52" ry="23" />
      <ellipse cx="64" cy="13" rx="45" ry="21" />
      <ellipse cx="-16" cy="-21" rx="47" ry="27" />
      <ellipse cx="38" cy="-13" rx="34" ry="21" />
    </g>
  );
}

/** Pohon bulat kecil di punggung bukit — memberi skala pada pemandangan. */
function Tree({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <rect x="-2.5" y="-6" width="5" height="16" rx="2" />
      <ellipse cx="0" cy="-16" rx="16" ry="14" />
      <ellipse cx="-10" cy="-8" rx="11" ry="9" />
      <ellipse cx="10" cy="-7" rx="10" ry="8" />
    </g>
  );
}

export function Meadow() {
  return (
    <div className="meadow" aria-hidden="true">
      {/* Matahari: cuma cahaya, tanpa piringan. Lebih lembut, dan tidak
          pernah bentrok dengan teks yang lewat di atasnya. */}
      <div className="meadow__sun" />

      <svg
        className="meadow__svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Bukit terdepan luruh jadi warna kertas halaman, jadi hero
              menyatu ke section berikutnya tanpa garis potong. */}
          <linearGradient id="meadow-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--hill-near)" />
            <stop offset="86%" stopColor="var(--hill-near)" />
            <stop offset="100%" stopColor="var(--bg-alt)" />
          </linearGradient>
        </defs>

        {/* ---------- AWAN ----------
            Tiap lapis digambar dua kali, digeser selebar viewBox, lalu
            digeser -1440 sepanjang animasi. Begitu satu putaran selesai
            salinan kedua persis menempati posisi awal — jadi
            perulangannya tidak pernah terlihat. */}
        <g className="meadow__clouds meadow__clouds--far" fill="var(--cloud)" opacity="0.55">
          {[0, 1440].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={210} y={128} s={0.66} />
              <Cloud x={880} y={96} s={0.52} />
              <Cloud x={1270} y={150} s={0.6} />
            </g>
          ))}
        </g>

        <g className="meadow__clouds meadow__clouds--mid" fill="var(--cloud)" opacity="0.78">
          {[0, 1440].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={430} y={210} s={0.92} />
              <Cloud x={1120} y={252} s={0.78} />
            </g>
          ))}
        </g>

        <g className="meadow__clouds meadow__clouds--near" fill="var(--cloud)" opacity="0.92">
          {[0, 1440].map((o) => (
            <g key={o} transform={`translate(${o} 0)`}>
              <Cloud x={140} y={330} s={1.15} />
              <Cloud x={1010} y={378} s={1} />
            </g>
          ))}
        </g>

        {/* ---------- BUKIT ---------- */}
        <path
          fill="var(--hill-far)"
          d="M0 624 C 190 548, 352 566, 528 604 C 706 642, 866 566, 1064 576
             C 1244 585, 1362 624, 1440 604 L1440 900 L0 900 Z"
        />
        {[
          [318, 592, 1],
          [372, 600, 0.72],
          [1136, 578, 0.86],
        ].map(([x, y, s], i) => (
          <Tree key={i} x={x} y={y} s={s} fill="var(--hill-mid)" />
        ))}

        <path
          fill="var(--hill-mid)"
          d="M0 736 C 226 664, 386 706, 568 736 C 768 770, 908 694, 1128 710
             C 1286 722, 1384 754, 1440 740 L1440 900 L0 900 Z"
        />
        {[
          [812, 718, 1.15],
          [880, 726, 0.8],
          [128, 700, 0.95],
        ].map(([x, y, s], i) => (
          <Tree key={i} x={x} y={y} s={s} fill="var(--hill-near)" />
        ))}

        <path
          fill="url(#meadow-fade)"
          d="M0 844 C 204 800, 424 830, 646 846 C 886 864, 1084 816, 1284 830
             C 1364 836, 1412 850, 1440 844 L1440 900 L0 900 Z"
        />
      </svg>
    </div>
  );
}
