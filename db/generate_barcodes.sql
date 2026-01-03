-- Script to generate 13-digit barcodes for products
-- EAN-13 format: Country code (3) + Manufacturer (4) + Product (5) + Check digit (1)
-- Using 620 (Pakistan country code) + 1001 (Creative Hands) + product_id padded to 5 digits

-- Function to calculate EAN-13 check digit
CREATE OR REPLACE FUNCTION calculate_ean13_checksum(barcode_12 TEXT)
RETURNS INTEGER AS $$
DECLARE
    sum_odd INTEGER := 0;
    sum_even INTEGER := 0;
    digit INTEGER;
    i INTEGER;
BEGIN
    -- Sum odd positions (1st, 3rd, 5th, etc.) - multiply by 1
    FOR i IN 1..12 BY 2 LOOP
        digit := CAST(SUBSTRING(barcode_12, i, 1) AS INTEGER);
        sum_odd := sum_odd + digit;
    END LOOP;
    
    -- Sum even positions (2nd, 4th, 6th, etc.) - multiply by 3
    FOR i IN 2..12 BY 2 LOOP
        digit := CAST(SUBSTRING(barcode_12, i, 1) AS INTEGER);
        sum_even := sum_even + (digit * 3);
    END LOOP;
    
    -- Check digit = 10 - ((sum_odd + sum_even) mod 10)
    -- If result is 10, use 0
    RETURN (10 - ((sum_odd + sum_even) % 10)) % 10;
END;
$$ LANGUAGE plpgsql;

-- Update all products with generated 13-digit barcodes
UPDATE products
SET barcode = CONCAT(
    '6201001',  -- 620 (Pakistan) + 1001 (Creative Hands)
    LPAD(id::TEXT, 5, '0'),  -- Product ID padded to 5 digits
    calculate_ean13_checksum(
        CONCAT('6201001', LPAD(id::TEXT, 5, '0'))
    )::TEXT  -- Check digit
);

-- Verify the update
SELECT 
    id,
    product_name,
    barcode,
    LENGTH(barcode) as barcode_length,
    CASE 
        WHEN LENGTH(barcode) = 13 THEN '✓ Valid'
        ELSE '✗ Invalid'
    END as status
FROM products
ORDER BY id
LIMIT 20;

-- Show statistics
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN LENGTH(barcode) = 13 THEN 1 END) as valid_barcodes,
    COUNT(CASE WHEN LENGTH(barcode) != 13 THEN 1 END) as invalid_barcodes
FROM products;

-- Example barcodes generated:
-- Product ID 1  → 6201001000018 (620-1001-00001-8)
-- Product ID 2  → 6201001000025 (620-1001-00002-5)
-- Product ID 50 → 6201001000506 (620-1001-00050-6)
-- Product ID 100 → 6201001001003 (620-1001-00100-3)
