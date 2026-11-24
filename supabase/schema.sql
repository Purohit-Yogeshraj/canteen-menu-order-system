-- ==============================================================================
-- CANTEEN MENU & ORDER QUEUE SYSTEM - DATABASE SCHEMA
-- Compatible with Supabase PostgreSQL & Realtime CDC
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean teardown (for fresh installs / migrations)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS daily_sequences CASCADE;

-- ==============================================================================
-- 3. TABLES DEFINITION
-- ==============================================================================

-- 3.1 Menu Items Catalog
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Snacks', 'Meals', 'Beverages', 'Desserts')),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_veg BOOLEAN NOT NULL DEFAULT true,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.2 Concurrency-Safe Daily Sequence Table
CREATE TABLE daily_sequences (
    sequence_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
    last_token INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.3 Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_number INTEGER NOT NULL,
    token_display TEXT NOT NULL, -- Formatted as #001, #002, etc.
    student_name TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'preparing', 'ready', 'collected')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3.4 Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1 AND quantity <= 10),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Indexes for performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_menu_category ON menu_items(category);
CREATE INDEX idx_menu_available ON menu_items(is_available);

-- ==============================================================================
-- 4. ATOMIC ORDER CREATION & TOKEN FUNCTION
-- Guarantees atomic sequential tokens (#001, #002) even under concurrent load
-- ==============================================================================

CREATE OR REPLACE FUNCTION create_canteen_order(
    p_student_name TEXT,
    p_roll_number TEXT,
    p_total_amount NUMERIC,
    p_items JSONB -- Array of { menu_item_id, item_name, quantity, unit_price, subtotal }
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token_num INTEGER;
    v_token_disp TEXT;
    v_order_id UUID;
    v_item RECORD;
BEGIN
    -- 1. Atomic Sequence Increment using row-level locking
    INSERT INTO daily_sequences (sequence_date, last_token, updated_at)
    VALUES (CURRENT_DATE, 1, now())
    ON CONFLICT (sequence_date)
    DO UPDATE SET 
        last_token = daily_sequences.last_token + 1,
        updated_at = now()
    RETURNING last_token INTO v_token_num;

    -- 2. Format Token as #001, #002, etc.
    v_token_disp := '#' || LPAD(v_token_num::TEXT, 3, '0');

    -- 3. Insert Order Record
    INSERT INTO orders (
        token_number,
        token_display,
        student_name,
        roll_number,
        status,
        total_amount,
        created_at,
        updated_at
    )
    VALUES (
        v_token_num,
        v_token_disp,
        p_student_name,
        p_roll_number,
        'placed',
        p_total_amount,
        now(),
        now()
    )
    RETURNING id INTO v_order_id;

    -- 4. Insert Line Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        menu_item_id UUID,
        item_name TEXT,
        quantity INTEGER,
        unit_price NUMERIC,
        subtotal NUMERIC
    )
    LOOP
        INSERT INTO order_items (
            order_id,
            menu_item_id,
            item_name,
            quantity,
            unit_price,
            subtotal
        )
        VALUES (
            v_order_id,
            v_item.menu_item_id,
            v_item.item_name,
            v_item.quantity,
            v_item.unit_price,
            v_item.subtotal
        );
    END LOOP;

    -- 5. Return created order summary
    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'token_number', v_token_num,
        'token_display', v_token_disp,
        'status', 'placed',
        'total_amount', p_total_amount,
        'created_at', now()
    );
END;
$$;

-- ==============================================================================
-- 5. SEED DATA: 16 REALISTIC INDIAN CANTEEN FOOD ITEMS
-- ==============================================================================

INSERT INTO menu_items (name, category, price, is_veg, description, image_url, is_available) VALUES
('Crispy Samosa (2 pcs)', 'Snacks', 30.00, true, 'Golden fried flaky pastry stuffed with spiced potatoes and green peas, served with mint chutney.', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', true),
('Masala Dosa', 'Meals', 60.00, true, 'Thin crispy fermented crepe with spiced potato masala, served with coconut chutney and piping hot sambar.', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80', true),
('Pav Bhaji', 'Meals', 70.00, true, 'Buttery spiced vegetable mash topped with fresh coriander and diced onions, served with two toasted pav rolls.', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80', true),
('Chole Bhature', 'Meals', 80.00, true, 'Spicy chickpea curry garnished with pickled ginger and onions, served with two large fluffy bhaturas.', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80', true),
('Paneer Kathi Roll', 'Snacks', 65.00, true, 'Marinated cottage cheese tossed with bell peppers and tangy onions, wrapped in a whole wheat paratha.', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', true),
('Special Veg Thali', 'Meals', 100.00, true, 'Wholesome student meal: Dal fry, Paneer butter masala, seasonal sabzi, 3 rotis, steamed rice, and papad.', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80', true),
('Chicken Dum Biryani', 'Meals', 120.00, false, 'Aromatic basmati rice layered with spiced chicken and caramelised onions, served with cooling cucumber raita.', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', true),
('Egg Fried Rice', 'Meals', 75.00, false, 'Wok-tossed basmati rice with scrambled eggs, fresh spring onions, carrots, and dark soy seasoning.', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', true),
('Vada Pav (2 pcs)', 'Snacks', 35.00, true, 'Mumbai street staple: Spiced potato fritter stuffed in pav with dry garlic chutney and fried green chillies.', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80', true),
('Veg Grilled Sandwich', 'Snacks', 45.00, true, 'Toasted multi-grain bread layered with cucumbers, tomatoes, spiced potatoes, and mint chutney.', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80', true),
('Masala Chai', 'Beverages', 15.00, true, 'Freshly brewed aromatic tea infused with crushed ginger, cardamom, and clove, served piping hot.', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', true),
('South Indian Filter Coffee', 'Beverages', 25.00, true, 'Traditional chicory blend decoction frothed with boiling whole milk, served in a brass davarah tumbler.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', true),
('Iced Cold Coffee', 'Beverages', 40.00, true, 'Creamy chilled espresso blended with chocolate syrup and thick milk, topped with cocoa powder.', 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', true),
('Fresh Nimbu Soda', 'Beverages', 25.00, true, 'Chilled club soda with fresh lime juice, black salt, cumin powder, and fresh mint leaves.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', true),
('Gulab Jamun (2 pcs)', 'Desserts', 35.00, true, 'Warm, melt-in-mouth milk-solid dumplings soaked in rose and cardamom-scented sugar syrup.', 'https://images.unsplash.com/photo-1589119908995-c6837fa14d48?auto=format&fit=crop&w=600&q=80', true),
('Chocolate Walnut Brownie', 'Desserts', 50.00, true, 'Fudgy dark chocolate brownie studded with toasted walnuts and drizzled with warm chocolate ganache.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', true);

-- Enable Supabase Realtime Change Data Capture on relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
