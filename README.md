# ISM Generator Nomor Dokumen (BAUT / BAPP / BAST)

Aplikasi web generator nomor dokumen resmi (*BAUT, BAPP, BAST*) untuk proyek ISM dengan dukungan bulk generation hingga 50 ACT ID sekaligus, sistem pengunci nomor urut (*LockService* anti-dobel), dan riwayat terintegrasi dengan Google Sheets.

---

## 🛠️ Panduan Penggunaan & Deploy

### Opsi A: Dipakai Langsung di Google Apps Script (Web App)
1. Buat Spreadsheet Google Sheets baru (boleh kosong).
2. Buka menu **Extensions (Ekstensi)** > **Apps Script**.
3. Paste isi file `Code.gs` ke file `Code.gs` di Apps Script editor.
4. Di Apps Script editor, klik tombol **"+"** di sebelah Files > pilih **HTML**, beri nama `index` (tanpa `.html`), lalu paste isi file `index.html`.
5. Klik **Deploy** > **New deployment** > tipe **Web app**:
   * Execute as: **Me**
   * Who has access: **Anyone**
6. Buka URL Web App hasil deploy — web langsung siap digunakan!

### Opsi B: Dipakai di GitHub Pages
1. Push repository ini ke GitHub.
2. Aktifkan **GitHub Pages** di settings repository.
3. Buka web GitHub Pages Anda, klik tombol **⚙️ Config** di pojok kanan atas, lalu paste URL Web App Apps Script Anda.

---

## 📄 Lisensi
Hak Cipta © 2026 ISM Document Numbering System.
