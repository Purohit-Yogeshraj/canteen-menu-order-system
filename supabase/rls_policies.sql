-- ==============================================================================
-- CANTEEN MENU & ORDER QUEUE SYSTEM - ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 1. Enable RLS on all operational tables
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sequences ENABLE ROW LEVEL SECURITY;

-- 2. menu_items Policies
-- Anyone (anon public key) can read menu items to browse the canteen catalog
CREATE POLICY "Public can view menu items"
ON menu_items FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can insert/update/delete menu items in this demo lab context
CREATE POLICY "Public can manage menu items"
ON menu_items FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. orders Policies
-- Anyone can view orders (needed for Order Status, Kitchen Board, and TV Display)
CREATE POLICY "Public can view orders"
ON orders FOR SELECT
TO anon, authenticated
USING (true);

-- Anyone can insert orders (student cart checkout)
CREATE POLICY "Public can insert orders"
ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can update orders (kitchen advancing status: placed -> preparing -> ready -> collected)
CREATE POLICY "Public can update orders"
ON orders FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. order_items Policies
CREATE POLICY "Public can view order items"
ON order_items FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert order items"
ON order_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 5. daily_sequences Policies
CREATE POLICY "Public can view daily sequences"
ON daily_sequences FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Public can modify daily sequences"
ON daily_sequences FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
