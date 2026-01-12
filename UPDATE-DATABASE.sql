-- =====================================================
-- ADD MISSING COLUMNS TO EXPENSES TABLE
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add AC-related columns to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ac_brand VARCHAR(100);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ac_type VARCHAR(100);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ac_capacity VARCHAR(50);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS ac_quantity INTEGER;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS serial_number VARCHAR(200);

-- Add branch column (for uang makan)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS branch VARCHAR(50);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS employee_count INTEGER;

-- =====================================================
-- CREATE INCOME TABLE (for revenue from completed jobs)
-- =====================================================

CREATE TABLE IF NOT EXISTS income (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(15,2) NOT NULL,
    service_type VARCHAR(100),
    customer_name VARCHAR(200),
    customer_phone VARCHAR(50),
    technician_id UUID,
    technician_name VARCHAR(200),
    helper_id UUID,
    helper_name VARCHAR(200),
    description TEXT,
    date DATE DEFAULT CURRENT_DATE,
    branch VARCHAR(50) DEFAULT 'makassar',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Create policy for income
CREATE POLICY "Enable all for income" ON income FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- ADD COLUMNS TO BOOKINGS TABLE
-- =====================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_amount DECIMAL(15,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_service_type VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- =====================================================
-- VERIFY ALL TABLES
-- =====================================================

-- Check expenses columns
SELECT 'expenses' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expenses'
ORDER BY ordinal_position;

-- Check income table exists
SELECT 'income' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'income'
ORDER BY ordinal_position;

-- Check bookings new columns
SELECT 'bookings' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name IN ('final_amount', 'final_service_type', 'completion_notes');

