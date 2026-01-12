# 🚀 PANDUAN SETUP SUPABASE - NALA AIRCON

## ✅ STEP 1: Jalankan SQL Schema

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project **nala-aircon** (atau nama project Yuzar)
3. Di sidebar kiri, klik **SQL Editor**
4. Klik **+ New query**
5. Copy SEMUA isi file `database-schema.sql`
6. Paste ke SQL Editor
7. Klik tombol **Run** (atau Ctrl+Enter)
8. Tunggu sampai muncul pesan "Database schema created successfully!"

## ✅ STEP 2: Verifikasi Tabel

Setelah menjalankan SQL, cek di **Table Editor** (sidebar kiri).
Harus ada 13 tabel:

| No | Tabel | Deskripsi |
|----|-------|-----------|
| 1 | employees | Data teknisi |
| 2 | customers | Data pelanggan |
| 3 | projects | Data proyek |
| 4 | project_employees | Relasi proyek-teknisi |
| 5 | attendance | Absensi harian |
| 6 | leave_requests | Pengajuan izin |
| 7 | expenses | Pengeluaran |
| 8 | kasbon | Kasbon pegawai |
| 9 | inventory | Stok material & AC |
| 10 | inventory_movements | Riwayat stok |
| 11 | kpi_records | Pencapaian KPI |
| 12 | salary_slips | Slip gaji |
| 13 | settings | Pengaturan |

## ✅ STEP 3: Cek Sample Data

SQL sudah include sample data. Cek di Table Editor:
- **employees**: 8 teknisi sample
- **customers**: 5 pelanggan sample  
- **inventory**: 14 item material & AC sample
- **settings**: 6 pengaturan default

## ✅ STEP 4: Test Aplikasi

1. Buka `index.html` di browser
2. Buka Developer Console (F12)
3. Harus muncul: `✅ Supabase connected: https://kmgobitaptkyufepsovo.supabase.co`
4. Coba buka halaman **Database** → data teknisi harus muncul dari Supabase

## ⚠️ TROUBLESHOOTING

### Error: "relation does not exist"
- SQL schema belum dijalankan
- Jalankan ulang `database-schema.sql` di SQL Editor

### Error: "permission denied"
- RLS (Row Level Security) aktif
- Sementara disable dulu: buka Table Editor → pilih tabel → Policies → Disable RLS

### Data tidak muncul
- Cek Console browser untuk error
- Pastikan Supabase URL dan Key benar di `supabase.js`

### CORS Error
- Tambahkan domain di Supabase: Settings → API → Additional Redirect URLs

---

## 📁 FILE STRUCTURE

```
nala-dashboard/
├── js/
│   ├── config.js          ← Konfigurasi aplikasi
│   ├── supabase.js        ← Koneksi database (NEW)
│   └── components/
├── pages/
│   ├── financing.html     ← Updated dengan Supabase
│   ├── database.html      ← TODO: Update
│   ├── inventory.html     ← TODO: Update
│   ├── absensi.html       ← TODO: Update
│   ├── kpi.html           ← TODO: Update
│   └── slip-gaji.html     ← TODO: Update
├── database-schema.sql    ← SQL untuk buat tabel (NEW)
└── SETUP-GUIDE.md         ← File ini
```

---

## 🔧 CREDENTIALS YUZAR

```
SUPABASE_URL: https://kmgobitaptkyufepsovo.supabase.co
SUPABASE_ANON_KEY: sb_publishable_AsU20RPtLj9UCMTxtegbxg_yFzKUAru
```

**JANGAN share credentials ini ke orang lain!**

---

## 📞 NEXT STEPS

Setelah setup berhasil, beritahu Claude untuk:
1. Update semua halaman lain dengan integrasi Supabase
2. Implementasi CRUD lengkap
3. Real-time data sync
4. Authentication (login admin/teknisi)
