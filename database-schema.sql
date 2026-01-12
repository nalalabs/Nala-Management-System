-- ============================================
-- NALA AIRCON DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. EMPLOYEES TABLE (Teknisi)
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    level VARCHAR(20) NOT NULL DEFAULT 'helper', -- teknisi, junior_teknisi, helper
    branch VARCHAR(20) NOT NULL DEFAULT 'makassar', -- makassar, denpasar, palu
    address TEXT,
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_employees_branch ON employees(branch);
CREATE INDEX idx_employees_level ON employees(level);
CREATE INDEX idx_employees_active ON employees(is_active);

-- ============================================
-- 2. CUSTOMERS TABLE (Pelanggan)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'perorangan', -- perusahaan, perorangan
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_type ON customers(type);
CREATE INDEX idx_customers_active ON customers(is_active);

-- ============================================
-- 3. PROJECTS TABLE (Proyek)
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    branch VARCHAR(20) NOT NULL,
    job_type VARCHAR(50) NOT NULL, -- pasang_ac, bongkar_pasang, service_berat, cuci_ac, maintenance
    unit_count INTEGER DEFAULT 1,
    value DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    deadline DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_branch ON projects(branch);
CREATE INDEX idx_projects_customer ON projects(customer_id);

-- ============================================
-- 4. PROJECT_EMPLOYEES (Relasi Proyek-Teknisi)
-- ============================================
CREATE TABLE IF NOT EXISTS project_employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id),
    role VARCHAR(50) DEFAULT 'teknisi', -- leader, teknisi, helper
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_employees_project ON project_employees(project_id);
CREATE INDEX idx_project_employees_employee ON project_employees(employee_id);

-- ============================================
-- 5. ATTENDANCE TABLE (Absensi)
-- ============================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    check_in_lat DECIMAL(10,8),
    check_in_lng DECIMAL(11,8),
    check_out_lat DECIMAL(10,8),
    check_out_lng DECIMAL(11,8),
    late_minutes INTEGER DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'present', -- present, late, absent, leave
    notes TEXT,
    branch VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_attendance_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_branch ON attendance(branch);

-- ============================================
-- 6. LEAVE_REQUESTS TABLE (Pengajuan Izin)
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    leave_type VARCHAR(30) NOT NULL, -- sakit, izin_pribadi, pelatihan
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    proof_url TEXT, -- URL bukti/surat
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);

-- ============================================
-- 7. EXPENSES TABLE (Pengeluaran)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL, -- uang_makan, servis_kendaraan, toko, material, unit_ac, kasbon, bbm_transport, parkir_tol, gaji_upah, bonus_insentif
    sub_category VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    branch VARCHAR(20),
    employee_id UUID REFERENCES employees(id), -- for kasbon or specific employee expense
    employee_count INTEGER, -- for uang makan
    -- Material specific fields
    material_type VARCHAR(50),
    material_brand VARCHAR(50),
    material_size VARCHAR(50),
    quantity DECIMAL(10,2),
    unit VARCHAR(20),
    -- AC Unit specific fields
    ac_brand VARCHAR(50),
    ac_type VARCHAR(50),
    ac_capacity VARCHAR(20),
    -- Sync tracking
    synced_to VARCHAR(50), -- inventory, kpi
    synced_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_branch ON expenses(branch);

-- ============================================
-- 8. KASBON TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS kasbon (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    period VARCHAR(7) NOT NULL, -- YYYY-MM
    status VARCHAR(20) DEFAULT 'active', -- active, paid
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kasbon_employee ON kasbon(employee_id);
CREATE INDEX idx_kasbon_status ON kasbon(status);
CREATE INDEX idx_kasbon_period ON kasbon(period);

-- ============================================
-- 9. INVENTORY TABLE (Stok Material & AC)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(30) NOT NULL, -- material, ac_unit
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50), -- pipa, kabel, freon, bracket, ducktape, isolasi
    brand VARCHAR(50),
    size VARCHAR(50),
    capacity VARCHAR(20), -- for AC: 0.5PK, 1PK, etc
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    min_stock DECIMAL(10,2) DEFAULT 0,
    unit_price DECIMAL(15,2) DEFAULT 0,
    location VARCHAR(50) DEFAULT 'makassar', -- gudang pusat
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_type ON inventory(type);

-- ============================================
-- 10. INVENTORY_MOVEMENTS TABLE (Riwayat Stok)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id),
    type VARCHAR(10) NOT NULL, -- in, out
    quantity DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50), -- purchase, project, adjustment
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_inventory ON inventory_movements(inventory_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);

-- ============================================
-- 11. KPI_RECORDS TABLE (Pencapaian KPI)
-- ============================================
CREATE TABLE IF NOT EXISTS kpi_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    period VARCHAR(7) NOT NULL, -- YYYY-MM
    cuci_ac INTEGER DEFAULT 0,
    pasang_ac INTEGER DEFAULT 0,
    bongkar_pasang INTEGER DEFAULT 0,
    service_berat INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, period)
);

CREATE INDEX idx_kpi_records_employee ON kpi_records(employee_id);
CREATE INDEX idx_kpi_records_period ON kpi_records(period);

-- ============================================
-- 12. SALARY_SLIPS TABLE (Slip Gaji)
-- ============================================
CREATE TABLE IF NOT EXISTS salary_slips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id),
    period VARCHAR(7) NOT NULL, -- YYYY-MM
    work_days INTEGER DEFAULT 0,
    late_minutes INTEGER DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    base_salary DECIMAL(15,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    uang_makan DECIMAL(15,2) DEFAULT 0,
    kasbon_amount DECIMAL(15,2) DEFAULT 0,
    late_penalty DECIMAL(15,2) DEFAULT 0,
    kpi_deduction DECIMAL(15,2) DEFAULT 0,
    kpi_data JSONB,
    gross_salary DECIMAL(15,2) DEFAULT 0,
    total_deductions DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, generated, paid
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, period)
);

CREATE INDEX idx_salary_slips_employee ON salary_slips(employee_id);
CREATE INDEX idx_salary_slips_period ON salary_slips(period);

-- ============================================
-- 13. SETTINGS TABLE (Pengaturan)
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. BOOKINGS TABLE (Freshmo Orders)
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(200) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    service_date DATE NOT NULL,
    service_time VARCHAR(10) NOT NULL,
    unit_count INTEGER DEFAULT 1,
    service_type VARCHAR(100) NOT NULL,
    ac_type VARCHAR(50),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, assigned, in_progress, completed, cancelled
    technician_id UUID REFERENCES employees(id),
    helper_id UUID REFERENCES employees(id),
    price DECIMAL(15,2) DEFAULT 0,
    assigned_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_service_date ON bookings(service_date);
CREATE INDEX idx_bookings_technician ON bookings(technician_id);

-- Enable anonymous insert for public booking form
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anonymous insert" ON bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow authenticated read" ON bookings FOR SELECT USING (true);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default Settings
INSERT INTO settings (key, value) VALUES
('work_hours', '{"start": "08:30", "end": "17:30"}'),
('late_tolerance', '15'),
('late_penalty_per_hour', '10000'),
('payroll_date', '1'),
('kpi_targets', '{"cuci_ac": 7, "pasang_ac": 3, "bongkar_pasang": 2, "service_berat": 2}'),
('employee_levels', '{"teknisi": {"dailyRate": 150000, "overtimeRate": 20000}, "junior_teknisi": {"dailyRate": 125000, "overtimeRate": 15000}, "helper": {"dailyRate": 100000, "overtimeRate": 15000}}')
ON CONFLICT (key) DO NOTHING;

-- Sample Employees
INSERT INTO employees (name, phone, level, branch, email) VALUES
('Ahmad Hidayat', '081234567890', 'teknisi', 'makassar', 'ahmad@nalaaircon.com'),
('Budi Santoso', '081234567891', 'junior_teknisi', 'makassar', 'budi@nalaaircon.com'),
('Cahyo Riyadi', '081234567892', 'teknisi', 'denpasar', 'cahyo@nalaaircon.com'),
('Deni Pratama', '081234567893', 'helper', 'makassar', 'deni@nalaaircon.com'),
('Eko Firmansyah', '081234567894', 'helper', 'palu', 'eko@nalaaircon.com'),
('Fajar Gunawan', '081234567895', 'teknisi', 'makassar', 'fajar@nalaaircon.com'),
('Gilang Herlambang', '081234567896', 'teknisi', 'denpasar', 'gilang@nalaaircon.com'),
('Hendra Wijaya', '081234567897', 'junior_teknisi', 'palu', 'hendra@nalaaircon.com')
ON CONFLICT DO NOTHING;

-- Sample Customers
INSERT INTO customers (name, type, phone, address) VALUES
('Hotel Empress Makassar', 'perusahaan', '0411123456', 'Jl. Somba Opu No. 123, Makassar'),
('UPG Dental Care', 'perusahaan', '0411234567', 'Jl. AP Pettarani No. 45, Makassar'),
('RS Siloam Makassar', 'perusahaan', '0411345678', 'Jl. Metro Tanjung Bunga, Makassar'),
('Pak Rahmat', 'perorangan', '081298765432', 'Jl. Veteran Selatan No. 88, Makassar'),
('Bu Siti', 'perorangan', '081387654321', 'Jl. Urip Sumoharjo No. 55, Makassar')
ON CONFLICT DO NOTHING;

-- Sample Inventory (Materials)
INSERT INTO inventory (category, name, type, brand, size, quantity, unit, min_stock, unit_price) VALUES
('material', 'Pipa AC 1/4 x 3/8', 'pipa', 'Daikin', '1/4 x 3/8', 150, 'meter', 50, 25000),
('material', 'Pipa AC 1/4 x 1/2', 'pipa', 'Daikin', '1/4 x 1/2', 80, 'meter', 30, 30000),
('material', 'Kabel NYMHY 3x1.5', 'kabel', 'Eterna', '3x1.5mm', 200, 'meter', 50, 8000),
('material', 'Freon R32', 'freon', 'Daikin', '10kg', 15, 'tabung', 5, 350000),
('material', 'Freon R410A', 'freon', 'Chemours', '11.3kg', 10, 'tabung', 5, 450000),
('material', 'Bracket AC 1PK', 'bracket', 'Standard', '1-1.5PK', 25, 'pasang', 10, 75000),
('material', 'Bracket AC 2PK', 'bracket', 'Standard', '2PK', 15, 'pasang', 5, 100000),
('material', 'Ducktape Abu-abu', 'ducktape', '3M', '48mm x 25m', 30, 'roll', 20, 30000),
('material', 'Isolasi Pipa AC', 'isolasi', 'Aeroflex', '3/8 inch', 50, 'batang', 20, 25000)
ON CONFLICT DO NOTHING;

-- Sample AC Units
INSERT INTO inventory (category, name, type, brand, capacity, quantity, unit, min_stock, unit_price) VALUES
('ac_unit', 'Daikin FTKQ25TVM 1PK Inverter', 'split', 'Daikin', '1 PK', 5, 'unit', 2, 5500000),
('ac_unit', 'Panasonic CS-PU9XKJ 1PK', 'split', 'Panasonic', '1 PK', 3, 'unit', 2, 4800000),
('ac_unit', 'LG S10EV4 1PK Dual Inverter', 'split', 'LG', '1 PK', 4, 'unit', 2, 5200000),
('ac_unit', 'Daikin FTKQ35TVM 1.5PK Inverter', 'split', 'Daikin', '1.5 PK', 3, 'unit', 2, 7500000),
('ac_unit', 'Samsung AR10TYHQ 1PK', 'split', 'Samsung', '1 PK', 2, 'unit', 2, 4500000)
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (Optional - Enable later)
-- ============================================
-- ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- etc...

-- ============================================
-- DONE! 
-- ============================================
SELECT 'Database schema created successfully!' as message;
