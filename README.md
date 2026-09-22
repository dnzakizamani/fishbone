# Fishbone Causality Studio (`fishhh`)

Website interaktif untuk membuat dan menganalisis **Nested Fishbone Diagram (Diagram Ishikawa Bersarang)** dengan visualisasi relasi kausalitas dua arah.

## Fitur Utama

1. **Desain Visual Presisi (Sesuai Referensi GoJS)**:
   - Node badge rounded berwarna oranye/emas (`#f59e0b`) dengan teks putih tebal.
   - Spine (tulang punggung utama) horizontal menuju *Head Parameter* di sebelah kanan.
   - Percabangan bersarang bergantian (Spine horizontal -> Ribs diagonal -> Sub-ribs horizontal -> Sub-sub-ribs diagonal) sehingga rapi tanpa tumpang tindih.

2. **Analisis Kausalitas Dua Arah**:
   - Klik node mana saja di diagram: jalur dari penyebab ke akibat utama akan otomatis menyala (*glow highlight*).
   - **Mode Maju ("Karena ... maka ...")**:
     Menyusun pasangan sebab-akibat bertingkat dari akar terdalam menuju masalah utama:
     *Contoh*:
     - Karena **Parameter 61** 👉 maka **Parameter 6**.
     - Karena **Parameter 6** 👉 maka **Material**.
     - Karena **Material** 👉 maka **Head Parameter**.
   - **Mode Mundur / 5 Whys ("Kenapa ...? Karena ...")**:
     Menyusun penalaran analisis 5 Whys dari masalah utama ke akar masalah:
     *Contoh*:
     - Kenapa **Head Parameter**? 👉 Karena **Material**.
     - Kenapa **Material**? 👉 Karena **Parameter 6**.
     - Kenapa **Parameter 6**? 👉 Karena **Parameter 61**.

3. **Editor Dua Arah (Visual + Teks Outline)**:
   - **Teks Outline**: Menggunakan indentasi 2 spasi yang simpel untuk mengedit hierarki diagram secara real-time.
   - **Aksi Visual**: Klik node mana saja untuk menambah sub-cabang (+), mengedit teks (✏️), atau menghapus cabang (🗑️).

4. **Koleksi Tema Visual & Mode Gelap/Terang**:
   - **Mode Antarmuka**: Default Light Mode bersih dan kontras tinggi, dengan toggle instan ke Dark Mode.
   - **7 Tema Warna Diagram**:
     1. 📰 **Klasik Asli (Garis Hitam)**: Hitam-putih orisinil standar buku teks / QC (default).
     2. 🎨 **Modern Amber**: Oranye keemasan hangat & modern.
     3. 🏛️ **Classic Ishikawa**: Biru klasik standar industri Ishikawa.
     4. 💼 **Corporate Blue**: Biru laut profesional & elegan.
     5. 🌲 **Forest Emerald**: Hijau zamrud segar & ramah lingkungan.
     6. ⚡ **Cyberpunk Neon**: Gradien ungu-magenta futuristik & berenergi.
     7. 🖋️ **Minimalist Mono**: Monokrom hitam-putih publikasi ilmiah.

5. **Template Cepat Industri (1-Click Presets)**:
   - **Sample Referensi (GoJS)**: Diagram hierarki bersarang sesuai contoh awal.
   - **6M Manufaktur**: Standar Lean & Six Sigma (*Manpower, Machine, Method, Material, Measurement, Milieu*).
   - **4P Software & Produk**: Standar evaluasi insiden teknologi (*People, Platform, Process, Product*).

6. **Panel Kausalitas Interaktif & Salin Laporan (5 Whys Inspector)**:
   - Breadcrumb visual berurutan dari akar penyebab hingga akibat utama.
   - Tombol **📋 Salin** untuk mengekspor rantai analisis langsung ke Clipboard dalam format Markdown rapi untuk laporan meeting atau post-mortem insiden.

7. **Responsif Mobile & Touch Gestures**:
   - Touch pan 1 jari dan pinch-to-zoom 2 jari pada layar sentuh.
   - Drawer slide-out sidebar dengan backdrop tap-to-close di layar HP.
   - Header dan panel kausalitas yang adaptif pada layar kecil.

8. **Shortcut Keyboard**:
   - `Space + Drag`: Geser kanvas
   - `Ctrl + Scroll`: Zoom kanvas
   - `Escape`: Batal pilih node / tutup modal
   - `Enter`: Edit teks node terpilih
   - `Tab` / `Insert`: Tambah sub-cabang baru
   - `Delete` / `Backspace`: Hapus cabang terpilih

9. **Navigasi & Ekspor Terpadu**:
   - Menu dropdown terpadu untuk export gambar PNG resolusi tinggi, vektor SVG tajam, dan file JSON.
   - Background meja kerja grid titik-titik presisi (*engineering dot matrix*).
   - Siluet sirip ekor ikan (*tail fin*) di pangkal kiri spine.

## Cara Menjalankan

### Opsi 1: Menjalankan dengan Docker (Port 8034)
```bash
cd /home/zaki/dev/fishhh
docker compose up -d --build
```
Akses di browser: `http://localhost:8034`

### Opsi 2: Menggunakan Python Server
```bash
cd /home/zaki/dev/fishhh
python3 -m http.server 8034
```
Lalu buka browser di `http://localhost:8000`.

## Struktur File
- `index.html`: Struktur antarmuka (Header, Sidebar Outline, Canvas SVG, Panel Kausalitas).
- `style.css`: Desain antarmuka modern gelap, badge styling, dan animasi highlight.
- `model.js`: Data awal (sesuai gambar referensi) dan parser outline 2 arah.
- `fishbone-layout.js`: Algoritma geometri fishbone bersarang (alternating orthogonal/diagonal).
- `causality.js`: Engine penalaran "Karena... maka..." & "Kenapa...? Karena...".
- `app.js`: Pengendali interaksi, event canvas, pan-zoom, dan ekspor.
- `test.js`: Suite pengujian otomatis mandiri (assert-based).
