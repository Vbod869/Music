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
Menggunakan endpoint `your_apikey` dengan API Key Audius yang diberikan pengguna melalui parameter `api_key`. Menurut dokumentasi Audius, API Key aman digunakan di frontend dan meningkatkan kuota/rate limit. Bearer Token pribadi pengguna ditambahkan sebagai header `Authorization: Bearer ...` pada permintaan pencarian API.

## Catatan hak cipta
Katalog yang tersedia di Audius tidak otomatis berarti semua lagu bebas digunakan ulang atau diunduh. Hormati ketentuan Audius dan lisensi/izin kreator untuk setiap track. SUARA hanya menyediakan pencarian dan streaming sesuai endpoint yang disediakan Audius.





### Audio intro
Intro kini memiliki sonic logo ambient elektronik orisinal yang disintesis langsung memakai Web Audio API. Tekan tombol **Aktifkan suara** pada layar pembuka. Browser biasanya mensyaratkan interaksi pengguna sebelum audio boleh diputar; suara tidak dipaksakan otomatis.
