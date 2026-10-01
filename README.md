# simpan.tiktok

Website kecil untuk mengunduh video TikTok tanpa watermark. Mendukung video (HD dan biasa), foto slide, dan audio saja.

Backend-nya Node + Express, frontend-nya HTML, CSS, dan JavaScript biasa tanpa framework. Data video diambil lewat API [TikWM](https://www.tikwm.com).

## Fitur

- Unduh video tanpa watermark, termasuk versi HD kalau tersedia
- Unduh foto slide satu per satu atau sekaligus
- Ambil audionya saja (mp3)
- Link otomatis terisi dari clipboard kalau berisi link TikTok
- Pembatasan 20 permintaan per menit per IP

## Menjalankan

Butuh Node.js 18 atau lebih baru.

```bash
git clone https://github.com/RhastaKroco/simpan-tiktok.git
cd <nama-repo>
npm install
npm start
```

Lalu buka `http://localhost:3000`. Port bisa diganti lewat variabel `PORT`:

```bash
PORT=8080 npm start
```

## Struktur

```
.
├── server.js        API dan penyaji file statis
├── package.json
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```

## Endpoint

| Method | Path | Fungsi |
| --- | --- | --- |
| POST | `/api/cari` | Menerima `{ "url": "..." }`, mengembalikan info video atau foto |
| GET | `/api/unduh` | Meneruskan file dari sumber agar terunduh, bukan hanya diputar |

Proxy unduhan hanya menerima domain `tikwm.com`, `tiktokcdn`, dan `tiktokv`, jadi tidak bisa dipakai sebagai proxy bebas.

## Deploy

Karena butuh backend Node, situs ini tidak bisa jalan di hosting statis seperti GitHub Pages. Pilihan yang cocok adalah Railway, Render, Fly.io, atau VPS sendiri. Perintah start-nya `npm start`.

Kalau di belakang reverse proxy seperti Nginx atau Cloudflare, tambahkan `app.set('trust proxy', 1)` di `server.js` supaya pembatasan per IP membaca alamat pengunjung yang asli.

## Catatan

- TikWM adalah layanan pihak ketiga. Kalau tiba-tiba error, cek dulu apakah APInya masih hidup atau berubah. Bagian yang perlu diganti hanya blok di `/api/cari`.
- Unduh hanya konten milikmu sendiri atau yang sudah diizinkan pembuatnya. Penggunaan di luar itu bisa melanggar ketentuan layanan TikTok dan hak cipta.
- Proyek ini tidak berafiliasi dengan TikTok.
