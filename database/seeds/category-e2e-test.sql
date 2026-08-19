-- =========================================================
-- CATEGORY / SUBCATEGORY E2E TEST SCRIPT
-- =========================================================

-- 1. Verify required categories
SELECT
    id,
    name,
    type,
    is_default
FROM categories
WHERE name IN (
    'Food & Dining',
    'Transport',
    'Entertainment',
    'Salary',
    'Shopping',
    'Income'
)
ORDER BY name;


-- 2. Verify required subcategories
SELECT
    c.name AS category,
    s.name AS subcategory,
    s.is_default,
    s.aliases
FROM subcategories s
JOIN categories c
    ON c.id = s.category_id
WHERE s.name IN (
    'Fast Food',
    'Fuel',
    'Basic Salary',
    'Groceries',
    'Electronics'
)
ORDER BY c.name, s.name;


-- 3. Verify category aliases
SELECT
    name AS category,
    aliases
FROM categories
WHERE name IN (
    'Food & Dining',
    'Transport',
    'Entertainment',
    'Salary',
    'Shopping'
)
ORDER BY name;


-- 4. Verify subcategory aliases
SELECT
    c.name AS category,
    s.name AS subcategory,
    s.aliases
FROM subcategories s
JOIN categories c
    ON c.id = s.category_id
WHERE s.name IN (
    'Fast Food',
    'Fuel',
    'Basic Salary',
    'Groceries',
    'Electronics'
)
ORDER BY c.name, s.name;


-- 5. Verify Food & Dining → Fast Food
SELECT
    c.name AS category,
    s.name AS subcategory
FROM categories c
JOIN subcategories s
    ON s.category_id = c.id
WHERE c.name = 'Food & Dining'
  AND s.name = 'Fast Food';


-- 6. Verify Transport → Fuel
SELECT
    c.name AS category,
    s.name AS subcategory
FROM categories c
JOIN subcategories s
    ON s.category_id = c.id
WHERE c.name = 'Transport'
  AND s.name = 'Fuel';


-- 7. Verify Salary → Basic Salary
SELECT
    c.name AS category,
    s.name AS subcategory
FROM categories c
JOIN subcategories s
    ON s.category_id = c.id
WHERE c.name = 'Salary'
  AND s.name = 'Basic Salary';


-- 8. Verify Shopping → Electronics
SELECT
    c.name AS category,
    s.name AS subcategory
FROM categories c
JOIN subcategories s
    ON s.category_id = c.id
WHERE c.name = 'Shopping'
  AND s.name = 'Electronics';


-- 9. Final category/subcategory count
SELECT
    (SELECT COUNT(*) FROM categories) AS total_categories,
    (SELECT COUNT(*) FROM subcategories) AS total_subcategories;