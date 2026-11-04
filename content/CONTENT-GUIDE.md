# Panduan Pengisian Konten

Ini satu-satunya tugas yang tidak bisa aku kerjakan untukmu — dan sekaligus
faktor yang paling menentukan hasil akhirnya. Desain sebagus apa pun tidak bisa
menyelamatkan konten yang kosong; sebaliknya, konten yang tajam akan terlihat
bagus bahkan dengan desain sederhana.

Estimasi waktu total: **3-5 jam**, dan sebaiknya tidak dikerjakan sekaligus.

---

## Urutan Pengerjaan yang Disarankan

Kerjakan dari yang paling mudah ke yang paling menuntut pemikiran. Momentum penting.

| Urutan | File | Waktu | Catatan |
|---|---|---|---|
| 1 | `skills.json` | 20 menit | Paling mekanis. Bagus untuk pemanasan. |
| 2 | `achievements.json` | 40 menit | Sebagian besar tinggal salin dari LinkedIn / folder sertifikat. |
| 3 | `timeline.json` | 45 menit | Butuh sedikit mengingat, tapi masih faktual. |
| 4 | `profile.json` | 45 menit | Menulis bio itu sulit. Lihat trik di bawah. |
| 5 | `now.json` | 15 menit | Cepat, karena kamu sedang menjalaninya. |
| 6 | `work/*.mdx` | 1-2 jam | Paling berat, paling bernilai. Satu proyek per sesi. |

---

## Aturan yang Berlaku untuk Semua File

**1. Angka mengalahkan kata sifat.**
"Meningkatkan performa secara signifikan" bernilai nol. "Memangkas waktu muat
dari 4.2s ke 900ms" bernilai segalanya. Kalau tidak punya angka, cari yang bisa
dihitung: jumlah pengguna, jumlah baris data, berapa jam kerja yang dihemat,
berapa orang yang memakainya.

**2. Masalah lebih dulu, teknologi belakangan.**
Tidak ada yang tergerak oleh "dibangun dengan React, Node.js, dan MongoDB".
Orang tergerak oleh "tim gudang kehilangan dua hari setiap bulan, sekarang
20 menit". Stack ditaruh sebagai metadata, bukan sebagai judul.

**3. Spesifik mengalahkan mengesankan.**
"Berpengalaman dalam machine learning" itu kabur dan karenanya lemah.
"Fine-tuning model vision untuk deteksi cacat di data 3.000 gambar dengan
label tidak seimbang" itu spesifik dan karenanya kuat — bahkan kalau ruang
lingkupnya lebih kecil.

**4. Jujur mengalahkan lengkap.**
Lebih baik 3 proyek yang bisa kamu pertahankan selama 20 menit interview
daripada 10 proyek yang setengah kamu pahami. Satu klaim yang runtuh saat
ditanya akan meruntuhkan kepercayaan pada semua klaim lainnya.

**5. Tulis untuk dua pembaca sekaligus.**
HR non-teknis akan memindai dalam 30 detik: nama, posisi, perusahaan, angka.
Engineer akan membaca dalam 10 menit: trade-off, alasan, refleksi.
Karena itu setiap bagian punya ringkasan pendek di atas dan kedalaman di bawah.

---

## Trik Menulis Bio (`profile.json` → `bio.long`)

Menulis tentang diri sendiri terasa canggung, dan hasilnya biasanya kaku. Cara
mengatasinya: **jangan menulis — jawab pertanyaan.** Rekam atau ketik jawaban
lisan untuk lima pertanyaan ini, lalu rapikan:

1. Kalau teman bertanya "sekarang lagi ngerjain apa?", apa jawabanmu?
2. Kapan pertama kali kamu merasa "oh, ini yang mau aku kerjakan"?
3. Masalah teknis apa yang paling kamu nikmati saat memecahkannya, dan kenapa?
4. Apa yang orang salah pahami tentang bidangmu?
5. Setahun dari sekarang, kamu ingin sedang mengerjakan apa?

Jawaban lisan hampir selalu lebih hidup daripada kalimat yang dikarang langsung.
Bio yang bagus terdengar seperti orang, bukan seperti surat lamaran.

Kalau macet, kirim saja jawaban mentahmu ke aku — aku bantu susun.

---

## Memilih Proyek untuk Case Study

Pilih **3-5**, bukan semuanya. Kriteria, berurut dari yang terpenting:

1. **Ada masalah nyata di baliknya.** Tutorial yang diikuti tidak masuk hitungan.
2. **Kamu bisa menjelaskan kenapa memilih pendekatan itu.** Kalau tidak ingat
   alasannya, proyek itu tidak akan bertahan di interview.
3. **Ada yang bisa dilihat.** Demo hidup, repo, screenshot, atau video pendek.
4. **Menunjukkan sisi berbeda darimu.** Idealnya campur: satu proyek web berat,
   satu ML berat, satu yang menggabungkan keduanya.

Proyek yang gagal **boleh dimasukkan** kalau kamu bisa menjelaskan kenapa gagal
dan apa yang kamu pelajari. Ini justru sering lebih berkesan daripada proyek
sukses yang biasa saja — karena hanya sedikit orang yang berani menampilkannya.

---

## Gambar

Yang dibutuhkan per proyek:

- **Cover** — 1600×900px. Screenshot bagian paling menarik, bukan halaman login.
- **Galeri** — 2-4 gambar. Boleh screenshot UI, diagram arsitektur, grafik hasil.
- Format PNG atau JPG. Jangan dikompres dulu — aku yang urus optimasinya.

Taruh sementara di `content/work/_images/<slug>/`. Nanti dipindahkan ke CDN
supaya repo tetap ringan.

Diagram arsitektur buatan tangan (bahkan yang dari Excalidraw) hampir selalu
lebih bernilai daripada satu screenshot tambahan.

---

## Kalau Macet

Kirim apa pun yang kamu punya — CV lama, catatan berantakan, jawaban lisan,
tautan repo. Aku bisa menyusunnya jadi bentuk yang benar, lalu kamu tinggal
mengoreksi. **Mengoreksi jauh lebih mudah daripada memulai dari halaman kosong.**

Yang tidak bisa aku lakukan adalah mengarang fakta tentangmu. Selain itu,
hampir semuanya bisa kubantu.

---

## Setelah Selesai

Bilang saja, lalu aku lanjut ke:

1. Scaffold project Next.js + design system
2. Validasi seluruh konten dengan skema Zod (kalau ada yang kurang, akan langsung ketahuan)
3. Bangun halaman inti dan deploy versi pertama

Tidak perlu semua file selesai sekaligus — begitu `profile.json` dan satu
case study terisi, aku sudah bisa mulai membangun.
