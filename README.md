# SUARA — Audius Music Player

Website pemutar musik responsif dengan katalog Audius API.

## Fitur
- Cari lagu dari Audius (`GET /tracks/search`).
- Putar lagu melalui endpoint streaming Audius (`GET /tracks/{track_id}/stream`).
- Koleksi lagu disukai dan playlist tersimpan di localStorage.
- Pemutar audio, antrian sederhana, seek, dan kontrol volume.
- Putar file audio lokal dari perangkat.

## Menjalankan
Buka `index.html` melalui browser atau deploy seluruh file ke GitHub Pages. Tidak diperlukan build step.

## API
Menggunakan endpoint `https://api.audius.co/v1` dengan API Key Audius yang diberikan pengguna melalui parameter `api_key`. Menurut dokumentasi Audius, API Key aman digunakan di frontend dan meningkatkan kuota/rate limit. Bearer Token pribadi pengguna ditambahkan sebagai header `Authorization: Bearer ...` pada permintaan pencarian API. Lihat https://docs.audius.co/api/.

## Catatan hak cipta
Katalog yang tersedia di Audius tidak otomatis berarti semua lagu bebas digunakan ulang atau diunduh. Hormati ketentuan Audius dan lisensi/izin kreator untuk setiap track. SUARA hanya menyediakan pencarian dan streaming sesuai endpoint yang disediakan Audius.

Dokumentasi: https://docs.audius.co/api/


## Keamanan kredensial
API Key publik digunakan pada browser. PENTING: atas permintaan pengguna, Bearer Token pribadi ditanam di `app.js`. Ini membuat token dapat dilihat siapa pun yang membuka Developer Tools atau mengunduh source website, terutama jika di-host di repository publik GitHub Pages. Gunakan hanya untuk pengujian pribadi; untuk deployment publik, cabut token ini dan pindahkan ke backend/proxy server-side. Karena token pernah dibagikan di percakapan, disarankan membuat token baru setelah pengujian.


### Audio intro
Intro kini memiliki sonic logo ambient elektronik orisinal yang disintesis langsung memakai Web Audio API. Tekan tombol **Aktifkan suara** pada layar pembuka. Browser biasanya mensyaratkan interaksi pengguna sebelum audio boleh diputar; suara tidak dipaksakan otomatis.
