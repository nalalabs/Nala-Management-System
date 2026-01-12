-- =============================================
-- INVENTORY MOVEMENTS TABLE
-- Tracks all stock in/out movements
-- Run this in Supabase SQL Editor
-- =============================================

-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('in', 'out')),
    quantity DECIMAL(10,2) NOT NULL,
    reference_type VARCHAR(50), -- 'purchase', 'kpi', 'freshmo', 'adjustment'
    reference_id TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference ON inventory_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created ON inventory_movements(created_at DESC);

-- Enable RLS
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated" ON inventory_movements
    FOR ALL USING (true) WITH CHECK (true);

-- Allow read for anonymous (for reporting)
CREATE POLICY "Allow read for anonymous" ON inventory_movements
    FOR SELECT USING (true);

-- Grant permissions
GRANT ALL ON inventory_movements TO authenticated;
GRANT SELECT ON inventory_movements TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'inventory_movements table created successfully!';
END $$;
