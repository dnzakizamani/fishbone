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
   - **6 Tema Warna Diagram**:
     1. 🎨 **Modern Amber**: Oranye keemasan hangat & modern (default).
     2. 🏛️ **Classic Ishikawa**: Biru klasik standar industri Ishikawa / QC 7 Tools.
     3. 💼 **Corporate Blue**: Biru laut profesional & elegan.
     4. 🌲 **Forest Emerald**: Hijau zamrud segar & ramah lingkungan.
     5. ⚡ **Cyberpunk Neon**: Gradien ungu-magenta futuristik & berenergi.
     6. 🖋️ **Minimalist Mono**: Monokrom hitam-putih publikasi ilmiah & laporan formal.

5. **Navigasi & Ekspor**:
   - Pan (geser kanvas dengan drag mouse) & Zoom (scroll wheel atau tombol +/-).
   - Simpan & Buka file format JSON.
   - Export ke file vektor SVG tajam dan gambar PNG resolusi tinggi sesuai tema aktif.

## Cara Menjalankan

Karena proyek ini menggunakan **Web Native murni (Zero-dependency)**, Anda dapat menjalankannya dengan:

### Opsi 1: Menggunakan Web Server Lokal (Direkomendasikan untuk ES Modules)
Jalankan salah satu perintah berikut di terminal pada folder `fishhh`:
```bash
cd /home/zaki/dev/fishhh
python3 -m http.server 8000
```
atau jika memiliki Node.js / npx:
```bash
npx serve .
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
