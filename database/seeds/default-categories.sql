-- =========================================
-- DEFAULT CATEGORIES
-- =========================================

DO $$
DECLARE
    food_id UUID;
    shopping_id UUID;
    transport_id UUID;
    bills_id UUID;
    entertainment_id UUID;

    salary_id UUID;
    business_id UUID;
    other_income_id UUID;
BEGIN

    -- =========================
    -- EXPENSE CATEGORIES
    -- =========================

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Food', 'EXPENSE', '🍔', NULL, true)
    RETURNING id INTO food_id;

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Shopping', 'EXPENSE', '🛍️', NULL, true)
    RETURNING id INTO shopping_id;

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Transport', 'EXPENSE', '🚗', NULL, true)
    RETURNING id INTO transport_id;

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Bills', 'EXPENSE', '🏠', NULL, true)
    RETURNING id INTO bills_id;

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Entertainment', 'EXPENSE', '🎬', NULL, true)
    RETURNING id INTO entertainment_id;


    -- =========================
    -- EXPENSE SUBCATEGORIES
    -- =========================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), food_id, NULL, 'Groceries', '🛒', NULL, true),
        (gen_random_uuid(), food_id, NULL, 'Restaurant', '🍽️', NULL, true);

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), shopping_id, NULL, 'Clothing', '👕', NULL, true),
        (gen_random_uuid(), shopping_id, NULL, 'Electronics', '💻', NULL, true);

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), transport_id, NULL, 'Fuel', '⛽', NULL, true),
        (gen_random_uuid(), transport_id, NULL, 'Bus', '🚌', NULL, true);

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), bills_id, NULL, 'Electricity', '💡', NULL, true);

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), entertainment_id, NULL, 'Cinema', '🎥', NULL, true);


    -- =========================
    -- INCOME CATEGORIES
    -- =========================

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Salary', 'INCOME', '💰', NULL, true)
    RETURNING id INTO salary_id;

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Business', 'INCOME', '💼', NULL, true)
    RETURNING id INTO business_id;

    INSERT INTO categories (id, user_id, name, type, icon, color, is_default)
    VALUES (gen_random_uuid(), NULL, 'Other Income', 'INCOME', '💵', NULL, true)
    RETURNING id INTO other_income_id;


    -- =========================
    -- INCOME SUBCATEGORIES
    -- =========================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), salary_id, NULL, 'Monthly Salary', '💵', NULL, true);

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), business_id, NULL, 'Business Income', '📈', NULL, true);

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), other_income_id, NULL, 'Other', '💸', NULL, true);

END $$;