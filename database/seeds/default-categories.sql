-- =========================================
-- FINAL DEFAULT CATEGORIES & SUBCATEGORIES
-- =========================================

DO $$
DECLARE
    food_dining_id UUID;
    transportation_id UUID;
    housing_id UUID;
    shopping_id UUID;
    health_medical_id UUID;
    entertainment_id UUID;

    salary_id UUID;
    freelance_id UUID;
    business_id UUID;
    investments_id UUID;
    other_income_id UUID;
BEGIN

    -- =========================================
    -- EXPENSE CATEGORIES
    -- =========================================

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Food & Dining', 'EXPENSE', '🍔', NULL, true)
    RETURNING id INTO food_dining_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Transportation', 'EXPENSE', '🚗', NULL, true)
    RETURNING id INTO transportation_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Housing', 'EXPENSE', '🏠', NULL, true)
    RETURNING id INTO housing_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Shopping', 'EXPENSE', '🛍️', NULL, true)
    RETURNING id INTO shopping_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Health & Medical', 'EXPENSE', '🏥', NULL, true)
    RETURNING id INTO health_medical_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Entertainment', 'EXPENSE', '🎬', NULL, true)
    RETURNING id INTO entertainment_id;


    -- =========================================
    -- FOOD & DINING
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), food_dining_id, NULL, 'Restaurants', '🍽️', NULL, true),
        (gen_random_uuid(), food_dining_id, NULL, 'Fast Food', '🍔', NULL, true),
        (gen_random_uuid(), food_dining_id, NULL, 'Coffee & Tea', '☕', NULL, true),
        (gen_random_uuid(), food_dining_id, NULL, 'Food Delivery', '🛵', NULL, true);


    -- =========================================
    -- TRANSPORTATION
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), transportation_id, NULL, 'Fuel', '⛽', NULL, true),
        (gen_random_uuid(), transportation_id, NULL, 'Public Transport', '🚌', NULL, true),
        (gen_random_uuid(), transportation_id, NULL, 'Taxi & Ride Share', '🚕', NULL, true),
        (gen_random_uuid(), transportation_id, NULL, 'Parking', '🅿️', NULL, true);


    -- =========================================
    -- HOUSING
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), housing_id, NULL, 'Rent', '🏠', NULL, true),
        (gen_random_uuid(), housing_id, NULL, 'Maintenance', '🔧', NULL, true),
        (gen_random_uuid(), housing_id, NULL, 'Repairs', '🛠️', NULL, true),
        (gen_random_uuid(), housing_id, NULL, 'Home Supplies', '🧹', NULL, true);


    -- =========================================
    -- SHOPPING
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), shopping_id, NULL, 'Clothing', '👕', NULL, true),
        (gen_random_uuid(), shopping_id, NULL, 'Electronics', '💻', NULL, true),
        (gen_random_uuid(), shopping_id, NULL, 'Accessories', '👜', NULL, true);


    -- =========================================
    -- HEALTH & MEDICAL
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), health_medical_id, NULL, 'Doctor', '👨‍⚕️', NULL, true),
        (gen_random_uuid(), health_medical_id, NULL, 'Medicines', '💊', NULL, true),
        (gen_random_uuid(), health_medical_id, NULL, 'Pharmacy', '🏪', NULL, true);


    -- =========================================
    -- ENTERTAINMENT
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), entertainment_id, NULL, 'Movies', '🎬', NULL, true),
        (gen_random_uuid(), entertainment_id, NULL, 'Games', '🎮', NULL, true),
        (gen_random_uuid(), entertainment_id, NULL, 'Hobbies', '🎨', NULL, true);


    -- =========================================
    -- INCOME CATEGORIES
    -- =========================================

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Salary', 'INCOME', '💰', NULL, true)
    RETURNING id INTO salary_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Freelance', 'INCOME', '💻', NULL, true)
    RETURNING id INTO freelance_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Business', 'INCOME', '💼', NULL, true)
    RETURNING id INTO business_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Investments', 'INCOME', '📈', NULL, true)
    RETURNING id INTO investments_id;

    INSERT INTO categories
        (id, user_id, name, type, icon, color, is_default)
    VALUES
        (gen_random_uuid(), NULL, 'Other Income', 'INCOME', '💵', NULL, true)
    RETURNING id INTO other_income_id;


    -- =========================================
    -- SALARY
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), salary_id, NULL, 'Basic Salary', '💵', NULL, true),
        (gen_random_uuid(), salary_id, NULL, 'Bonus', '🎁', NULL, true),
        (gen_random_uuid(), salary_id, NULL, 'Overtime', '⏰', NULL, true);


    -- =========================================
    -- FREELANCE
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), freelance_id, NULL, 'Freelance Work', '💻', NULL, true),
        (gen_random_uuid(), freelance_id, NULL, 'Consulting', '🧑‍💼', NULL, true);


    -- =========================================
    -- BUSINESS
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), business_id, NULL, 'Sales', '🛒', NULL, true),
        (gen_random_uuid(), business_id, NULL, 'Services', '🛠️', NULL, true);


    -- =========================================
    -- INVESTMENTS
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), investments_id, NULL, 'Dividends', '💰', NULL, true),
        (gen_random_uuid(), investments_id, NULL, 'Capital Gains', '📊', NULL, true);


    -- =========================================
    -- OTHER INCOME
    -- =========================================

    INSERT INTO subcategories
        (id, category_id, user_id, name, icon, color, is_default)
    VALUES
        (gen_random_uuid(), other_income_id, NULL, 'Miscellaneous', '💵', NULL, true);

END $$;