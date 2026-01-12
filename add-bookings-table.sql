-- ============================================
-- ADD BOOKINGS TABLE FOR FRESHMO
-- Run this in Supabase SQL Editor
-- ============================================

-- Create bookings table
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_service_date ON bookings(service_date);
CREATE INDEX IF NOT EXISTS idx_bookings_technician ON bookings(technician_id);

-- IMPORTANT: Enable RLS and allow anonymous inserts for public booking form
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for public order form)
CREATE POLICY "Allow anonymous insert" ON bookings 
    FOR INSERT 
    WITH CHECK (true);

-- Policy: Allow anyone to read (for admin dashboard)
CREATE POLICY "Allow authenticated read" ON bookings 
    FOR SELECT 
    USING (true);

-- Policy: Allow anyone to update (for admin dashboard)
CREATE POLICY "Allow authenticated update" ON bookings 
    FOR UPDATE 
    USING (true);

-- Policy: Allow anyone to delete (for admin dashboard)
CREATE POLICY "Allow authenticated delete" ON bookings 
    FOR DELETE 
    USING (true);

-- Verify table created
SELECT 'Bookings table created successfully!' as message;
