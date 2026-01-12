-- =====================================================
-- HAPUS SEMUA DATA KECUALI EMPLOYEES (TEKNISI)
-- Run this in Supabase SQL Editor
-- =====================================================

-- HATI-HATI: Ini akan menghapus SEMUA data dari tabel-tabel berikut!
-- Tabel employees (teknisi) TIDAK akan dihapus

-- 1. Hapus income (pemasukan)
TRUNCATE TABLE income CASCADE;

-- 2. Hapus expenses (pengeluaran)
TRUNCATE TABLE expenses CASCADE;

-- 3. Hapus kasbon
TRUNCATE TABLE kasbon CASCADE;

-- 4. Hapus bookings
TRUNCATE TABLE bookings CASCADE;

-- 5. Hapus customers (pelanggan)
TRUNCATE TABLE customers CASCADE;

-- 6. Hapus inventory
TRUNCATE TABLE inventory CASCADE;

-- 7. Hapus attendance (absensi)
TRUNCATE TABLE attendance CASCADE;

-- 8. Hapus leave_requests (izin)
TRUNCATE TABLE leave_requests CASCADE;

-- 9. Hapus projects
TRUNCATE TABLE projects CASCADE;

-- =====================================================
-- VERIFIKASI
-- =====================================================

-- Cek employees masih ada
SELECT 'employees' as tabel, COUNT(*) as jumlah FROM employees;

-- Cek tabel lain kosong
SELECT 'income' as tabel, COUNT(*) as jumlah FROM income
UNION ALL SELECT 'expenses', COUNT(*) FROM expenses
UNION ALL SELECT 'kasbon', COUNT(*) FROM kasbon
UNION ALL SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL SELECT 'customers', COUNT(*) FROM customers
UNION ALL SELECT 'inventory', COUNT(*) FROM inventory;
