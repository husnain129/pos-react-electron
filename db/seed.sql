-- Seed Data for Creative Hands POS System
-- Comprehensive product catalog from TEVTA institutes
-- CORRECTED VERSION - Exactly 197 products

-- =====================================================
-- CLEAR EXISTING DATA (in correct order for foreign keys)
-- =====================================================
DELETE FROM transactions WHERE id > 0;
DELETE FROM products WHERE id > 0;
DELETE FROM inventory WHERE id > 0;
DELETE FROM categories WHERE id > 0;
DELETE FROM institutes WHERE id > 0;
DELETE FROM customers WHERE id > 0;
DELETE FROM users WHERE username != 'admin';

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 2;
ALTER SEQUENCE institutes_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE inventory_id_seq RESTART WITH 1;
ALTER SEQUENCE customers_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

-- =====================================================
-- USERS
-- =====================================================
INSERT INTO users (username, password, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings)
VALUES 
    ('manager1', 'manager123', 'Manager', 'Store Manager', 'manager@creativehands.pk', 'manager', 'active', 1, 1, 1, 0, 1),
    ('cashier1', 'cashier123', 'Cashier', 'Ali Ahmed', 'ali@creativehands.pk', 'cashier', 'active', 1, 0, 1, 0, 0),
    ('cashier2', 'cashier123', 'Cashier', 'Fatima Khan', 'fatima@creativehands.pk', 'cashier', 'active', 1, 0, 1, 0, 0),
    ('inventory1', 'inv123', 'Inventory', 'Hassan Raza', 'hassan@creativehands.pk', 'staff', 'active', 1, 1, 0, 0, 0);

-- =====================================================
-- INSTITUTES (21 total)
-- =====================================================
INSERT INTO institutes (name, district, zone) VALUES
    ('GCTW Sahiwal', 'Sahiwal', 'Center'),                            -- 1
    ('GSTC Dev Samaj', 'Lahore', 'Center'),                          -- 2
    ('GVTIW Dev Samaj', 'Lahore', 'Center'),                         -- 3
    ('GVTI (W) Dev Samaj Road', 'Lahore', 'Center'),                 -- 4
    ('GTTI Gujjarpura', 'Lahore', 'Center'),                         -- 5
    ('GCTW Multan', 'Multan', 'South'),                              -- 6
    ('GCTW Bahwalpur', 'Bahawalpur', 'South'),                       -- 7
    ('GCTW Faisalabad', 'Faisalabad', 'North'),                      -- 8
    ('GCTW Sargodha', 'Sargodha', 'North'),                          -- 9
    ('GVTI (W) Jia Musa Shahdra', 'Lahore', 'Center'),              -- 10
    ('GVTI (W) Pattoki', 'Lahore', 'Center'),                        -- 11
    ('GVTI (W) RSLN', 'Lahore', 'Center'),                           -- 12
    ('GVTI (W) Depalpur', 'Okara', 'Center'),                        -- 13
    ('GTTI Kamal Gunj', 'Lahore', 'Center'),                         -- 14
    ('GVTI (W) Samundri', 'Faisalabad', 'North'),                    -- 15
    ('Quaid-e-Azam Business Park Sheikhupura', 'Lahore', 'Center'),  -- 16
    ('COE Mughalpura', 'Lahore', 'Center'),                          -- 17
    ('GCT For GC&PD Shahdara', 'Lahore', 'Center'),                  -- 18
    ('Wood Working Service Centre Gujrat', 'Gujrat', 'Center'),      -- 19
    ('GILT Kasur', 'Kasur', 'Center'),                               -- 20
    ('GSTC Bahawalpur', 'Bahawalpur', 'South');                      -- 21

-- =====================================================
-- CATEGORIES (mapped to institutes)
-- =====================================================
INSERT INTO categories (name, description, institute_id) VALUES
    -- Institute 1: GCTW Sahiwal
    ('Garments & Fashion Design', 'Fashion and clothing items', 1),                     -- 1
    
    -- Institute 2: GSTC Dev Samaj
    ('Handi Craft', 'Traditional handicraft items', 2),                                 -- 2
    ('Home Textile', 'Textile items for home decoration', 2),                           -- 3
    
    -- Institute 3: GVTIW Dev Samaj
    ('Handi Craft', 'Traditional handicraft items', 3),                                 -- 4
    ('Home Textile', 'Textile items for home use', 3),                                  -- 5
    
    -- Institute 4: GVTI (W) Dev Samaj Road
    ('Handi Craft', 'Islamic calligraphy and art pieces', 4),                           -- 6
    ('Home Textile', 'Home textile items', 4),                                          -- 7
    
    -- Institute 5: GTTI Gujjarpura
    ('Handi Craft', 'Paintings and art', 5),                                            -- 8
    
    -- Institute 6: GCTW Multan
    ('Handi Craft', 'Traditional crafts', 6),                                           -- 9
    ('Garments & Fashion Design', 'Fashion items', 6),                                  -- 10
    
    -- Institute 7: GCTW Bahwalpur
    ('Fashion Design', 'Fashion design items', 7),                                      -- 11
    ('Garments & Fashion Design', 'Garments and fashion', 7),                           -- 12
    ('Handi Craft', 'Handicraft items', 7),                                             -- 13
    
    -- Institute 8: GCTW Faisalabad
    ('Garments & Fashion Design', 'Fashion items', 8),                                  -- 14
    
    -- Institute 9: GCTW Sargodha
    ('Home Textile', 'Home textile items', 9),                                          -- 15
    ('Handi Craft', 'Handicraft items', 9),                                             -- 16
    
    -- Institute 10: GVTI (W) Jia Musa Shahdra
    ('Handi Craft', 'Islamic art', 10),                                                 -- 17
    
    -- Institute 11: GVTI (W) Pattoki
    ('Handi Craft', 'Islamic art', 11),                                                 -- 18
    ('Home Textile', 'Home textiles', 11),                                              -- 19
    
    -- Institute 12: GVTI (W) RSLN
    ('Handi Craft', 'Wall hangings and art', 12),                                       -- 20
    
    -- Institute 13: GVTI (W) Depalpur
    ('Handi Craft', 'Embroidered items', 13),                                           -- 21
    
    -- Institute 14: GTTI Kamal Gunj
    ('Handi Craft', 'Art pieces', 14),                                                  -- 22
    ('Home Textile', 'Home textiles', 14),                                              -- 23
    
    -- Institute 15: GVTI (W) Samundri
    ('Home Textile', 'Table mats and home items', 15),                                  -- 24
    
    -- Institute 16: Quaid-e-Azam Business Park Sheikhupura
    ('Handi Craft', 'Denim products', 16),                                              -- 25
    
    -- Institute 17: COE Mughalpura
    ('Handi Craft', 'Various handicrafts', 17),                                         -- 26
    
    -- Institute 18: GCT For GC&PD Shahdara
    ('Blue Pottery / Ceramic', 'Ceramic and pottery items', 18),                        -- 27
    
    -- Institute 19: Wood Working Service Centre Gujrat
    ('Wood Work & Furniture', 'Wooden furniture', 19),                                  -- 28
    
    -- Institute 20: GILT Kasur
    ('Leather', 'Leather handicrafts', 20),                                             -- 29
    
    -- Institute 21: GSTC Bahawalpur
    ('Handi Craft', 'Various handicrafts', 21);                                         -- 30

-- =====================================================
-- PRODUCTS (Exactly 197 products)
-- =====================================================

INSERT INTO products (zone, district, institute_name, institute_id, product_category, product_name, product_specifications, product_code, category_id, price, cost_price, quantity, description, barcode, alert_quantity) VALUES
    -- Products 1-3: GCTW Sahiwal (institute_id: 1, category_id: 1)
    ('Center', 'Sahiwal', 'GCTW Sahiwal', 1, 'Garments & Fashion Design', 'Crochet Cardigan', '1', 'GCTW-SAH-001', 1, 4000.00, 2800.00, 3, 'Beautiful handmade crochet cardigan', '6201001000011', 1),
    ('Center', 'Sahiwal', 'GCTW Sahiwal', 1, 'Garments & Fashion Design', 'Crochet Cardigan', '1', 'GCTW-SAH-002', 1, 4000.00, 2800.00, 1, 'Beautiful handmade crochet cardigan', '6201001000028', 1),
    ('Center', 'Sahiwal', 'GCTW Sahiwal', 1, 'Garments & Fashion Design', 'Crochet Cardigan', '1', 'GCTW-SAH-003', 1, 4000.00, 2800.00, 1, 'Beautiful handmade crochet cardigan', '6201001000035', 1),
    
    -- Products 4-6: GSTC Dev Samaj (institute_id: 2, category_id: 2-3)
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Hand painted lawn dupatta', '', 'GSTC-LHR-001', 2, 1800.00, 1260.00, 5, 'Hand painted lawn dupatta', '6201001000042', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'pots(Different size)', '', 'GSTC-LHR-002', 2, 3000.00, 2100.00, 7, 'Different sized pots', '6201001000059', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Home Textile', 'Dupatta Embroidery painting', '', 'GSTC-LHR-003', 3, 800.00, 560.00, 8, 'Dupatta with embroidery painting', '6201001000066', 1),
    
    -- Products 7-14: GVTIW Dev Samaj (institute_id: 3, category_id: 4-5)
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Home Textile', 'Bed Set', '', 'GVTIW-LHR-001', 5, 38000.00, 26600.00, 1, 'Complete bed set', '6201001000073', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Home Textile', 'Cushions', '', 'GVTIW-LHR-002', 5, 7000.00, 4900.00, 1, 'Decorative cushions', '6201001000080', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Handi craft', 'Painting Frame', '', 'GVTIW-LHR-003', 4, 32000.00, 22400.00, 1, 'Decorative painting frame', '6201001000097', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Handi craft', 'Calligraphy Canvas', '', 'GVTIW-LHR-004', 4, 22000.00, 15400.00, 1, 'Calligraphy on canvas', '6201001000103', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Handi craft', 'Calligraphy Canvas', '', 'GVTIW-LHR-005', 4, 30000.00, 21000.00, 1, 'Calligraphy on canvas', '6201001000110', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Handi craft', 'Embellished Dupatta', '', 'GVTIW-LHR-006', 4, 4000.00, 2800.00, 1, 'Embellished dupatta', '6201001000127', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Handi craft', 'Embellished Dupatta', '', 'GVTIW-LHR-007', 4, 4000.00, 2800.00, 1, 'Embellished dupatta', '6201001000134', 1),
    ('Center', 'Lahore', 'GVTIW Dev Samaj', 3, 'Handi craft', 'Embellished Dupatta', '', 'GVTIW-LHR-008', 4, 4000.00, 2800.00, 1, 'Embellished dupatta', '6201001000141', 1),
    
    -- Products 15-17: GTTI Gujjarpura (institute_id: 5, category_id: 8)
    ('Center', 'Lahore', 'GTTI Gujjarpura', 5, 'Handi craft', 'Paintings', '', 'GTTI-LHR-001', 8, 8500.00, 5950.00, 7, 'Handmade paintings', '6201001000158', 1),
    ('Center', 'Lahore', 'GTTI Gujjarpura', 5, 'Handi craft', 'Hand Made Painting', '', 'GTTI-LHR-002', 8, 20000.00, 14000.00, 1, 'Hand made painting', '6201001000165', 1),
    ('Center', 'Lahore', 'GTTI Gujjarpura', 5, 'Handi craft', 'Hand Made Painting', '', 'GTTI-LHR-003', 8, 20000.00, 14000.00, 1, 'Hand made painting', '6201001000172', 1),
    
    -- Products 18-19: GCTW Multan (institute_id: 6, category_id: 9)
    ('South', 'Multan', 'GCTW Multan', 6, 'Handi craft', 'Crouchet Products', '', 'GCTW-MUL-001', 9, 350.00, 245.00, 25, 'Crochet products', '6201001000189', 1),
    ('South', 'Multan', 'GCTW Multan', 6, 'Handi craft', 'Beaded Purse', '', 'GCTW-MUL-002', 9, 4000.00, 2800.00, 10, 'Beaded purse', '6201001000196', 1),
    
    -- Products 20-28: GCTW Bahwalpur (institute_id: 7, category_id: 11-12)
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Fashion design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-001', 11, 1800.00, 1260.00, 2, 'Hand painted embellished dupattas', '6201001000202', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Fashion design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-002', 11, 1800.00, 1260.00, 2, 'Hand painted embellished dupattas', '6201001000219', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Fashion design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-003', 11, 1800.00, 1260.00, 10, 'Hand painted embellished dupattas', '6201001000226', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Fashion design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-004', 11, 2200.00, 1540.00, 2, 'Hand painted embellished dupattas', '6201001000233', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-005', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000240', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-006', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000257', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-007', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000264', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-008', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000271', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-009', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000288', 1),
    
    -- Products 29-30: GCTW Faisalabad (institute_id: 8, category_id: 14)
    ('North', 'Faisalabad', 'GCTW Faisalabad', 8, 'Garments & Fashion Design', 'Crochet Bag', '', 'GCTW-FSD-001', 14, 1000.00, 700.00, 4, 'Crochet bag', '6201001000295', 1),
    ('North', 'Faisalabad', 'GCTW Faisalabad', 8, 'Garments & Fashion Design', 'Crochet Frock', '', 'GCTW-FSD-002', 14, 1800.00, 1260.00, 4, 'Crochet frock', '6201001000301', 1),
    
    -- Product 31: GCTW Sargodha (institute_id: 9, category_id: 15)
    ('North', 'Sargodha', 'GCTW Sargodha', 9, 'Home Textile', 'Screen Print / Hand Embellished Bedsheet', '', 'GCTW-SGD-001', 15, 20000.00, 14000.00, 1, 'Screen print/hand embellished bedsheet', '6201001000318', 1),
    
    -- Products 32-36: GVTI (W) Dev Samaj Road (institute_id: 4, category_id: 6)
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-DSR-001', 6, 15000.00, 10500.00, 1, 'Islamic calligraphy with oil paint', '6201001000325', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-DSR-002', 6, 15000.00, 10500.00, 1, 'Islamic calligraphy with oil paint', '6201001000332', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-DSR-003', 6, 10000.00, 7000.00, 1, 'Islamic calligraphy with oil paint', '6201001000349', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-DSR-004', 6, 25000.00, 17500.00, 1, 'Wall hanging with oil paint', '6201001000356', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-DSR-005', 6, 20000.00, 14000.00, 1, 'Wall hanging with oil paint', '6201001000363', 1),
    
    -- Products 37-38: GVTI (W) Jia Musa Shahdra (institute_id: 10, category_id: 17)
    ('Center', 'Lahore', 'GVTI (W) Jia Musa Shahdra', 10, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-JMS-001', 17, 900.00, 630.00, 1, 'Islamic calligraphy with oil paint', '6201001000370', 1),
    ('Center', 'Lahore', 'GVTI (W) Jia Musa Shahdra', 10, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-JMS-002', 17, 900.00, 630.00, 1, 'Islamic calligraphy with oil paint', '6201001000387', 1),
    
    -- Product 39: GVTI (W) Pattoki (institute_id: 11, category_id: 18)
    ('Center', 'Lahore', 'GVTI (W) Pattoki', 11, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-PTK-001', 18, 10000.00, 7000.00, 1, 'Islamic calligraphy with oil paint', '6201001000394', 1),
    
    -- Products 40-46: GVTI (W) RSLN (institute_id: 12, category_id: 20)
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Islamic Calligraphy with Oil Paint', '', 'GVTI-RSLN-001', 20, 40000.00, 28000.00, 1, 'Islamic calligraphy with oil paint', '6201001000400', 1),
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-RSLN-002', 20, 20000.00, 14000.00, 1, 'Wall hanging with oil paint', '6201001000417', 1),
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-RSLN-003', 20, 30000.00, 21000.00, 1, 'Wall hanging with oil paint', '6201001000424', 1),
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-RSLN-004', 20, 40000.00, 28000.00, 1, 'Wall hanging with oil paint', '6201001000431', 1),
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-RSLN-005', 20, 0.00, 0.00, 1, 'Wall hanging with oil paint', '6201001000448', 1),
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-RSLN-006', 20, 5000.00, 3500.00, 1, 'Wall hanging with oil paint', '6201001000455', 1),
    ('Center', 'Lahore', 'GVTI (W) RSLN', 12, 'Handi craft', 'Wall hanging with Oil Paint', '', 'GVTI-RSLN-007', 20, 8500.00, 5950.00, 1, 'Wall hanging with oil paint', '6201001000462', 1),
    
    -- Product 47: GVTI (W) Depalpur (institute_id: 13, category_id: 21)
    ('Center', 'Okara', 'GVTI (W) Depalpur', 13, 'Handi craft', 'Wall Hanging embellished with Hand Embroidery', '', 'GVTI-DPL-001', 21, 8000.00, 5600.00, 1, 'Wall hanging with hand embroidery', '6201001000479', 1),
    
    -- Products 48-51: GVTI (W) Dev Samaj Road (institute_id: 4, category_id: 6-7)
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'SILK PAINTED LAMPS', '', 'GVTI-DSR-006', 6, 8000.00, 5600.00, 1, 'Silk painted lamps', '6201001000486', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Home Textile', 'SILK PAINTED LAMPS', '', 'GVTI-DSR-007', 7, 8000.00, 5600.00, 1, 'Silk painted lamps', '6201001000493', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'WOODEN SCREEN', '', 'GVTI-DSR-008', 6, 20000.00, 14000.00, 1, 'Wooden screen', '6201001000509', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'Hand-embellished Pots', '', 'GVTI-DSR-009', 6, 3000.00, 2100.00, 1, 'Hand-embellished pots', '6201001000516', 1),
    
    -- Product 52: GTTI Kamal Gunj (institute_id: 14, category_id: 22)
    ('Center', 'Lahore', 'GTTI Kamal Gunj', 14, 'Handi craft', 'Oil painted vase', '', 'GTTI-KG-001', 22, 5000.00, 3500.00, 1, 'Oil painted vase', '6201001000523', 1),
    
    -- Product 53: GVTI (W) Pattoki (institute_id: 11, category_id: 19)
    ('Center', 'Lahore', 'GVTI (W) Pattoki', 11, 'Home Textile', 'SILK BED SPREAD SET', '', 'GVTI-PTK-002', 19, 35000.00, 24500.00, 1, 'Silk bed spread set', '6201001000530', 1),
    
    -- Product 54: GVTI (W) Dev Samaj Road (institute_id: 4, category_id: 7)
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Home Textile', 'BED SPREAD SET', '', 'GVTI-DSR-010', 7, 30000.00, 21000.00, 1, 'Bed spread set', '6201001000547', 1),
    
    -- Products 55-56: GVTI (W) Samundri (institute_id: 15, category_id: 24)
    ('North', 'Faisalabad', 'GVTI (W) Samundri', 15, 'Home Textile', 'DINNING TABLE MATS', '', 'GVTI-SMD-001', 24, 8000.00, 5600.00, 1, 'Dining table mats', '6201001000554', 1),
    ('North', 'Faisalabad', 'GVTI (W) Samundri', 15, 'Home Textile', 'DRAWING ROOM SET', '', 'GVTI-SMD-002', 24, 9000.00, 6300.00, 1, 'Drawing room set', '6201001000561', 1),
    
    -- Product 57: GTTI Kamal Gunj (institute_id: 14, category_id: 23)
    ('Center', 'Lahore', 'GTTI Kamal Gunj', 14, 'Home Textile', 'Cushions set', '', 'GTTI-KG-002', 23, 2500.00, 1750.00, 1, 'Cushions set', '6201001000578', 1),
    
    -- Product 58: GVTI (W) Pattoki (institute_id: 11, category_id: 19)
    ('Center', 'Lahore', 'GVTI (W) Pattoki', 11, 'Home Textile', 'Rug', '', 'GVTI-PTK-003', 19, 5000.00, 3500.00, 1, 'Rug', '6201001000585', 1),
    
    -- Products 59-63: GVTI (W) Dev Samaj Road (institute_id: 4, category_id: 6)
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'ORGANZA DUPATTA', '', 'GVTI-DSR-011', 6, 2500.00, 1750.00, 1, 'Organza dupatta', '6201001000592', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'ORGANZA DUPATTA', '', 'GVTI-DSR-012', 6, 2500.00, 1750.00, 1, 'Organza dupatta', '6201001000608', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'ORGANZA DUPATTA', '', 'GVTI-DSR-013', 6, 4000.00, 2800.00, 1, 'Organza dupatta', '6201001000615', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'ORGANZA DUPATTA', '', 'GVTI-DSR-014', 6, 4000.00, 2800.00, 1, 'Organza dupatta', '6201001000622', 1),
    ('Center', 'Lahore', 'GVTI (W) Dev Samaj Road', 4, 'Handi craft', 'ORGANZA DUPATTA', '', 'GVTI-DSR-015', 6, 4000.00, 2800.00, 1, 'Organza dupatta', '6201001000639', 1),
    
    -- Product 64: Quaid-e-Azam Business Park Sheikhupura - Denim pant & jacket (institute_id: 16, category_id: 25)
    -- NOTE: Row 64 in source has 2 products but same Sr No, creating as single composite product
    ('Center', 'Lahore', 'Quaid-e-Azam Business Park Sheikhupura', 16, 'Handi craft', 'Denim pant', '', 'QABP-SKP-001', 25, 1200.00, 840.00, 200, 'Denim pant', '6201001000646', 1),
    ('Center', 'Lahore', 'Quaid-e-Azam Business Park Sheikhupura', 16, 'Handi craft', 'Denim jacket', '', 'QABP-SKP-002', 25, 1400.00, 980.00, 200, 'Denim jacket', '6201001000653', 1),
    
    -- Products 65-67: GTTI Gujjarpura (institute_id: 5, category_id: 8)
    ('Center', 'Lahore', 'GTTI Gujjarpura', 5, 'Handi craft', 'Paintings', '', 'GTTI-LHR-004', 8, 8500.00, 5950.00, 7, 'Handmade paintings', '6201001000660', 1),
    ('Center', 'Lahore', 'GTTI Gujjarpura', 5, 'Handi craft', 'Hand Made Painting', '', 'GTTI-LHR-005', 8, 20000.00, 14000.00, 1, 'Hand made painting', '6201001000677', 1),
    ('Center', 'Lahore', 'GTTI Gujjarpura', 5, 'Handi craft', 'Hand Made Painting', '', 'GTTI-LHR-006', 8, 20000.00, 14000.00, 1, 'Hand made painting', '6201001000684', 1),
    
    -- Products 68-73: GCTW Multan (institute_id: 6, category_id: 9-10)
    ('South', 'Multan', 'GCTW Multan', 6, 'Handi craft', 'Hand Made Painting', '', 'GCTW-MUL-003', 9, 8000.00, 5600.00, 1, 'Hand made painting', '6201001000691', 1),
    ('South', 'Multan', 'GCTW Multan', 6, 'Handi craft', 'Hand Made Painting', '', 'GCTW-MUL-004', 9, 8000.00, 5600.00, 1, 'Hand made painting', '6201001000707', 1),
    ('South', 'Multan', 'GCTW Multan', 6, 'Handi craft', 'Crouchet Products', '', 'GCTW-MUL-005', 9, 350.00, 245.00, 25, 'Crochet products', '6201001000714', 1),
    ('South', 'Multan', 'GCTW Multan', 6, 'Garments & Fashion Design', 'Crouchet Sweater', '', 'GCTW-MUL-006', 10, 2600.00, 1820.00, 1, 'Crochet sweater', '6201001000721', 1),
    ('South', 'Multan', 'GCTW Multan', 6, 'Garments & Fashion Design', 'Crouchet Bag', '', 'GCTW-MUL-007', 10, 1500.00, 1050.00, 1, 'Crochet bag', '6201001000738', 1),
    ('South', 'Multan', 'GCTW Multan', 6, 'Garments & Fashion Design', 'Beaded Purse', '', 'GCTW-MUL-008', 10, 4000.00, 2800.00, 10, 'Beaded purse', '6201001000745', 1),
    
    -- Products 74-82: GCTW Bahwalpur (institute_id: 7, category_id: 12)
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-010', 12, 1800.00, 1260.00, 2, 'Hand painted embellished dupattas', '6201001000752', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-011', 12, 1800.00, 1260.00, 2, 'Hand painted embellished dupattas', '6201001000769', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-012', 12, 1800.00, 1260.00, 10, 'Hand painted embellished dupattas', '6201001000776', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-013', 12, 2200.00, 1540.00, 2, 'Hand painted embellished dupattas', '6201001000783', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-014', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000790', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-015', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000806', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-016', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000813', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-017', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000820', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Garments & Fashion Design', 'Ladies Jeans', '', 'GCTW-BWP-018', 12, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001000837', 1),
    
    -- Products 83-84: GCTW Faisalabad (institute_id: 8, category_id: 14)
    ('North', 'Faisalabad', 'GCTW Faisalabad', 8, 'Garments & Fashion Design', 'Crochet Bag', '', 'GCTW-FSD-003', 14, 1000.00, 700.00, 4, 'Crochet bag', '6201001000844', 1),
    ('North', 'Faisalabad', 'GCTW Faisalabad', 8, 'Garments & Fashion Design', 'Crochet Frock', '', 'GCTW-FSD-004', 14, 1800.00, 1260.00, 4, 'Crochet frock', '6201001000851', 1),
    
    -- Product 85: GCTW Sargodha (institute_id: 9, category_id: 16)
    ('North', 'Sargodha', 'GCTW Sargodha', 9, 'Handi craft', 'Screen Print / Hand Embellished Bedsheet', '', 'GCTW-SGD-002', 16, 20000.00, 14000.00, 1, 'Screen print/hand embellished bedsheet', '6201001000868', 1),
    
    -- Products 86-96: GSTC Dev Samaj (institute_id: 2, category_id: 2)
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Bags', '', 'GSTC-LHR-004', 2, 700.00, 490.00, 30, 'Bags', '6201001000875', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Bedsheets', '', 'GSTC-LHR-005', 2, 9000.00, 6300.00, 2, 'Bedsheets', '6201001000882', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'TableMats(04 pcs)', '', 'GSTC-LHR-006', 2, 2000.00, 1400.00, 4, 'Table mats (4 pieces)', '6201001000899', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Cupcover', '', 'GSTC-LHR-007', 2, 800.00, 560.00, 12, 'Cup cover', '6201001000905', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Kurta''s', '', 'GSTC-LHR-008', 2, 1700.00, 1190.00, 9, 'Kurtas', '6201001000912', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Stoller', '', 'GSTC-LHR-009', 2, 1000.00, 700.00, 6, 'Stoller', '6201001000929', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Gloves', '', 'GSTC-LHR-010', 2, 700.00, 490.00, 2, 'Gloves', '6201001000936', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Frames', '', 'GSTC-LHR-011', 2, 2000.00, 1400.00, 7, 'Frames', '6201001000943', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Hand painted lawn dupatta', '', 'GSTC-LHR-012', 2, 1800.00, 1260.00, 5, 'Hand painted lawn dupatta', '6201001000950', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'pots(Different size)', '', 'GSTC-LHR-013', 2, 3000.00, 2100.00, 7, 'Different sized pots', '6201001000967', 1),
    ('Center', 'Lahore', 'GSTC Dev Samaj', 2, 'Handi craft', 'Dupatta Embroidery painting', '', 'GSTC-LHR-014', 2, 800.00, 560.00, 8, 'Dupatta with embroidery painting', '6201001000974', 1),
    
    -- Products 97-108: GCTW Bahwalpur (institute_id: 7, category_id: 13)
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-019', 13, 2200.00, 1540.00, 2, 'Hand painted embellished dupattas', '6201001000981', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Hand Painted Embellished Dupattas', '', 'GCTW-BWP-020', 13, 2500.00, 1750.00, 3, 'Hand painted embellished dupattas', '6201001000998', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Tie & Dye Dupata', '', 'GCTW-BWP-021', 13, 1800.00, 1260.00, 2, 'Tie & dye dupatta', '6201001001001', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Tie & Dye Dupata', '', 'GCTW-BWP-022', 13, 2500.00, 1750.00, 2, 'Tie & dye dupatta', '6201001001018', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Tie & Dye Dupata', '', 'GCTW-BWP-023', 13, 1800.00, 1260.00, 3, 'Tie & dye dupatta', '6201001001025', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Embellished Dupattas', '', 'GCTW-BWP-024', 13, 2400.00, 1680.00, 2, 'Embellished dupattas', '6201001001032', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Ladies Jeans', '', 'GCTW-BWP-025', 13, 2200.00, 1540.00, 1, 'Ladies jeans', '6201001001049', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Ladies Jeans', '', 'GCTW-BWP-026', 13, 2600.00, 1820.00, 2, 'Ladies jeans', '6201001001056', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Ladies Jeans', '', 'GCTW-BWP-027', 13, 2500.00, 1750.00, 2, 'Ladies jeans', '6201001001063', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Ladies Jeans', '', 'GCTW-BWP-028', 13, 2500.00, 1750.00, 1, 'Ladies jeans', '6201001001070', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Ladies Jeans', '', 'GCTW-BWP-029', 13, 2200.00, 1540.00, 2, 'Ladies jeans', '6201001001087', 1),
    ('South', 'Bahawalpur', 'GCTW Bahwalpur', 7, 'Handi craft', 'Ladies kurta', '', 'GCTW-BWP-030', 13, 3000.00, 2100.00, 8, 'Ladies kurta', '6201001001094', 1),
    
    -- Products 109-117: GSTC Bahawalpur (institute_id: 21, category_id: 30)
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Dinning Table Runner and Placement Set', '', 'GSTC-BWP-001', 30, 2200.00, 1540.00, 20, 'Dining table runner and placement set', '6201001001100', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Coffee Table Runners', '', 'GSTC-BWP-002', 30, 1800.00, 1260.00, 20, 'Coffee table runners', '6201001001117', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Bed Sheets', '', 'GSTC-BWP-003', 30, 4000.00, 2800.00, 2, 'Bed sheets', '6201001001124', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Sofa Cushions', '', 'GSTC-BWP-004', 30, 1000.00, 700.00, 20, 'Sofa cushions', '6201001001131', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Lamp Shades', '', 'GSTC-BWP-005', 30, 1500.00, 1050.00, 8, 'Lamp shades', '6201001001148', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Wooden trays', '', 'GSTC-BWP-006', 30, 1500.00, 1050.00, 25, 'Wooden trays', '6201001001155', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Shawls', '', 'GSTC-BWP-007', 30, 2500.00, 1750.00, 10, 'Shawls', '6201001001162', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Semi Formal Dresses', '', 'GSTC-BWP-008', 30, 6000.00, 4200.00, 4, 'Semi formal dresses', '6201001001179', 1),
    ('South', 'Bahawalpur', 'GSTC Bahawalpur', 21, 'Handi craft', 'Hand Embroidered Kurty', '', 'GSTC-BWP-009', 30, 2500.00, 1750.00, 5, 'Hand embroidered kurta', '6201001001186', 1),
    
    -- Products 118-135: COE Mughalpura (institute_id: 17, category_id: 26)
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'TOTE Bag', '', 'COE-MGP-001', 26, 1500.00, 1050.00, 12, 'Tote bag', '6201001001193', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Calligraphy Painting', '', 'COE-MGP-002', 26, 2500.00, 1750.00, 2, 'Calligraphy painting', '6201001001209', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Bottels', '', 'COE-MGP-003', 26, 600.00, 420.00, 6, 'Bottles', '6201001001216', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Small Painting', '', 'COE-MGP-004', 26, 1000.00, 700.00, 4, 'Small painting', '6201001001223', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Table runner', '', 'COE-MGP-005', 26, 1000.00, 700.00, 1, 'Table runner', '6201001001230', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Hand made bags wool bag', '', 'COE-MGP-006', 26, 3500.00, 2450.00, 1, 'Hand made wool bag', '6201001001247', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Jeans Bag', '', 'COE-MGP-007', 26, 800.00, 560.00, 1, 'Jeans bag', '6201001001254', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Fabric bag', '', 'COE-MGP-008', 26, 800.00, 560.00, 1, 'Fabric bag', '6201001001261', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Fabric Paint Diaries', '', 'COE-MGP-009', 26, 500.00, 350.00, 8, 'Fabric paint diaries', '6201001001278', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Painted Kurta', '', 'COE-MGP-010', 26, 2000.00, 1400.00, 2, 'Painted kurta', '6201001001285', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Glass Painting Frames', '', 'COE-MGP-011', 26, 2000.00, 1400.00, 2, 'Glass painting frames', '6201001001292', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Febric Paint table runner', '', 'COE-MGP-012', 26, 1000.00, 700.00, 1, 'Fabric paint table runner', '6201001001308', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Block print table runner', '', 'COE-MGP-013', 26, 1000.00, 700.00, 2, 'Block print table runner', '6201001001315', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Block printing Bed sheet', '', 'COE-MGP-014', 26, 4500.00, 3150.00, 1, 'Block printing bed sheet', '6201001001322', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Thermapol Calligraphy frame', '', 'COE-MGP-015', 26, 3000.00, 2100.00, 1, 'Thermapol calligraphy frame', '6201001001339', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Embroidery Coushions', '', 'COE-MGP-016', 26, 600.00, 420.00, 4, 'Embroidery cushions', '6201001001346', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Fabric Paint coushions', '', 'COE-MGP-017', 26, 600.00, 420.00, 2, 'Fabric paint cushions', '6201001001353', 1),
    ('Center', 'Lahore', 'COE Mughalpura', 17, 'Handi craft', 'Painted Duppaty', '', 'COE-MGP-018', 26, 3500.00, 2450.00, 5, 'Painted dupatta', '6201001001360', 1),
    
    -- Products 136-164: GCT For GC&PD Shahdara (institute_id: 18, category_id: 27)
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Oil Burner', '', 'GCT-SHD-001', 27, 880.00, 616.00, 6, 'Ceramic oil burner', '6201001001377', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Tiny Vase', '', 'GCT-SHD-002', 27, 450.00, 315.00, 5, 'Ceramic floral tiny vase', '6201001001384', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Square Ashtray', '', 'GCT-SHD-003', 27, 350.00, 245.00, 5, 'Ceramic square ashtray', '6201001001391', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Mug', '', 'GCT-SHD-004', 27, 650.00, 455.00, 5, 'Ceramic floral mug', '6201001001407', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Bread Dish', '', 'GCT-SHD-005', 27, 2250.00, 1575.00, 3, 'Ceramic floral bread dish', '6201001001414', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Triangle Dish', '', 'GCT-SHD-006', 27, 1850.00, 1295.00, 2, 'Ceramic triangle dish', '6201001001421', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Pizza Plate (Large)', '', 'GCT-SHD-007', 27, 1850.00, 1295.00, 2, 'Ceramic pizza plate (large)', '6201001001438', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Cut Work Table Lamp Base', '', 'GCT-SHD-008', 27, 8000.00, 5600.00, 2, 'Ceramic cut work table lamp base', '6201001001445', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Midnight Blossoms Table Lamp Base', '', 'GCT-SHD-009', 27, 5000.00, 3500.00, 2, 'Midnight blossoms table lamp base', '6201001001452', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Blossom Apple Dish', '', 'GCT-SHD-010', 27, 1500.00, 1050.00, 3, 'Blossom apple dish', '6201001001469', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Rice Plate (Large)', '', 'GCT-SHD-011', 27, 2000.00, 1400.00, 3, 'Ceramic rice plate (large)', '6201001001476', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Small Vase', '', 'GCT-SHD-012', 27, 750.00, 525.00, 5, 'Ceramic floral small vase', '6201001001483', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Dish', '', 'GCT-SHD-013', 27, 2000.00, 1400.00, 3, 'Ceramic dish', '6201001001490', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Apple Dish', '', 'GCT-SHD-014', 27, 1400.00, 980.00, 3, 'Ceramic apple dish', '6201001001506', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Dinner Plate', '', 'GCT-SHD-015', 27, 1200.00, 840.00, 6, 'Ceramic floral dinner plate', '6201001001513', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Floral Round Table Lamp Base', '', 'GCT-SHD-016', 27, 7000.00, 4900.00, 2, 'Floral round table lamp base', '6201001001520', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral MLV Vase', '', 'GCT-SHD-017', 27, 9000.00, 6300.00, 2, 'Ceramic floral MLV vase', '6201001001537', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Large Planter', '', 'GCT-SHD-018', 27, 6000.00, 4200.00, 3, 'Ceramic floral large planter', '6201001001544', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Mughal Vase', '', 'GCT-SHD-019', 27, 3500.00, 2450.00, 3, 'Ceramic floral Mughal vase', '6201001001551', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Planter', '', 'GCT-SHD-020', 27, 6000.00, 4200.00, 2, 'Ceramic floral planter', '6201001001568', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Handmade Planter Small', '', 'GCT-SHD-021', 27, 1150.00, 805.00, 2, 'Handmade small planter', '6201001001575', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Ashtray With Lid', '', 'GCT-SHD-022', 27, 550.00, 385.00, 5, 'Ceramic ashtray with lid', '6201001001582', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Quarter Plates Set', '', 'GCT-SHD-023', 27, 4300.00, 3010.00, 2, 'Ceramic floral quarter plates set', '6201001001599', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Floral Table Lamp Base', '', 'GCT-SHD-024', 27, 3000.00, 2100.00, 2, 'Floral table lamp base', '6201001001605', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Handcrafted Sweet Bowls Set', '', 'GCT-SHD-026', 27, 4100.00, 2870.00, 2, 'Handcrafted sweet bowls set', '6201001001629', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramics Floral Pomegranate Vase', '', 'GCT-SHD-027', 27, 650.00, 455.00, 3, 'Ceramics floral pomegranate vase', '6201001001636', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramics Dish Small', '', 'GCT-SHD-028', 27, 450.00, 315.00, 6, 'Ceramics small dish', '6201001001643', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramic Floral Surahi Vase', '', 'GCT-SHD-029', 27, 3500.00, 2450.00, 2, 'Ceramic floral Surahi vase', '6201001001650', 1),
    ('Center', 'Lahore', 'GCT For GC&PD Shahdara', 18, 'Blue Pottery / Ceramic', 'Ceramics Floral Tea Set', '', 'GCT-SHD-030', 27, 9500.00, 6650.00, 2, 'Ceramics floral tea set', '6201001001667', 1),
    
    -- Products 165-180: Wood Working Service Centre Gujrat (institute_id: 19, category_id: 28)
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Double Bed Set', '', 'WWSC-GJR-001', 28, 396000.00, 277200.00, 1, 'Double bed set', '6201001001674', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'DOUBLE BED SET', '', 'WWSC-GJR-002', 28, 390840.00, 273588.00, 1, 'Double bed set', '6201001001681', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'DOUBLE BED SET', '', 'WWSC-GJR-003', 28, 398035.00, 278624.50, 1, 'Double bed set', '6201001001698', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Tea Trolley', '', 'WWSC-GJR-004', 28, 46787.00, 32750.90, 1, 'Tea trolley', '6201001001704', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Tea Trolley', '', 'WWSC-GJR-005', 28, 62127.00, 43488.90, 1, 'Tea trolley', '6201001001711', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Tea Trolley', '', 'WWSC-GJR-006', 28, 56758.00, 39730.60, 1, 'Tea trolley', '6201001001728', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Nest of Table Set', '', 'WWSC-GJR-007', 28, 55224.00, 38656.80, 1, 'Nest of table set', '6201001001735', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Nest of Table Set', '', 'WWSC-GJR-008', 28, 56758.00, 39730.60, 1, 'Nest of table set', '6201001001742', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Nest of Table Set', '', 'WWSC-GJR-009', 28, 55224.00, 38656.80, 1, 'Nest of table set', '6201001001759', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Tissue Box', '', 'WWSC-GJR-010', 28, 3068.00, 2147.60, 4, 'Tissue box', '6201001001766', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Dinning Table Set With 8 Chairs', '', 'WWSC-GJR-011', 28, 538000.00, 376600.00, 1, 'Dining table set with 8 chairs', '6201001001780', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Coffee Table (Round)', '', 'WWSC-GJR-012', 28, 98113.46, 68679.42, 1, 'Round coffee table', '6201001001797', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Coffee Table (Square)', '', 'WWSC-GJR-013', 28, 127699.60, 89389.72, 1, 'Square coffee table', '6201001001803', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Round Table', '', 'WWSC-GJR-014', 28, 161912.52, 113338.76, 1, 'Round table', '6201001001810', 1),
    ('Center', 'Gujrat', 'Wood Working Service Centre Gujrat', 19, 'Wood Work & Furniture', 'Nest of Table Set', '', 'WWSC-GJR-015', 28, 48321.00, 33824.70, 1, 'Nest of table set', '6201001001827', 1),
    
    -- Product 181: GCTW Sargodha (institute_id: 9, category_id: 15)
    ('North', 'Sargodha', 'GCTW Sargodha', 9, 'Home Textile', 'Hand Craft', '', 'GCTW-SGD-003', 15, 20000.00, 14000.00, 1, 'Hand craft', '6201001001834', 1),
    
    -- Products 182-197: GILT Kasur (institute_id: 20, category_id: 29)
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-001', 29, 2000.00, 1400.00, 1, 'Hand craft', '6201001001841', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-002', 29, 2500.00, 1750.00, 1, 'Hand craft', '6201001001858', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-003', 29, 2000.00, 1400.00, 1, 'Hand craft', '6201001001865', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-004', 29, 5500.00, 3850.00, 1, 'Hand craft', '6201001001872', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-005', 29, 6000.00, 4200.00, 1, 'Hand craft', '6201001001889', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-006', 29, 4500.00, 3150.00, 1, 'Hand craft', '6201001001896', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-007', 29, 4000.00, 2800.00, 1, 'Hand craft', '6201001001902', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-008', 29, 6000.00, 4200.00, 1, 'Hand craft', '6201001001919', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-009', 29, 4000.00, 2800.00, 1, 'Hand craft', '6201001001926', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-010', 29, 5000.00, 3500.00, 1, 'Hand craft', '6201001001933', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-011', 29, 3500.00, 2450.00, 1, 'Hand craft', '6201001001940', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-012', 29, 6000.00, 4200.00, 1, 'Hand craft', '6201001001957', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-013', 29, 6000.00, 4200.00, 1, 'Hand craft', '6201001001964', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-014', 29, 6500.00, 4550.00, 1, 'Hand craft', '6201001001971', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-015', 29, 6000.00, 4200.00, 1, 'Hand craft', '6201001001988', 1),
    ('Center', 'Kasur', 'GILT Kasur', 20, 'Leather', 'Hand Craft', '', 'GILT-KSR-016', 29, 6000.00, 4200.00, 1, 'Hand craft', '6201001001995', 1);

-- =====================================================
-- CUSTOMERS
-- =====================================================
INSERT INTO customers (name, email, phone, address) VALUES
    ('Ahmed Khan', 'ahmed.khan@email.com', '+92-300-1234567', 'House 123, Street 5, F-8/3, Islamabad'),
    ('Fatima Malik', 'fatima.malik@email.com', '+92-321-9876543', 'Flat 45, DHA Phase 6, Lahore'),
    ('Hassan Ali', 'hassan.ali@email.com', '+92-333-5555555', 'House 67, Gulberg III, Lahore'),
    ('Ayesha Siddique', 'ayesha.s@email.com', '+92-345-7777777', 'Apartment 12, Bahria Town, Rawalpindi'),
    ('Usman Tariq', 'usman.tariq@email.com', '+92-301-8888888', 'House 234, Model Town, Faisalabad'),
    ('Zainab Ahmed', 'zainab.a@email.com', '+92-322-4444444', 'Villa 56, Canal Road, Multan'),
    ('Bilal Hussain', 'bilal.h@email.com', '+92-334-6666666', 'House 89, Cavalry Ground, Lahore'),
    ('Sara Iqbal', 'sara.iqbal@email.com', '+92-312-9999999', 'Flat 23, Clifton, Karachi'),
    ('Walk-in Customer', NULL, NULL, NULL),
    ('Corporate Order', 'corporate@company.com', '+92-300-1111111', 'Office 301, Blue Area, Islamabad');

-- =====================================================
-- SAMPLE TRANSACTIONS
-- =====================================================

-- Transaction 1
INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at) VALUES
(
    'TXN-2025-0001',
    1,
    'Ahmed Khan',
    8000.00,
    0,
    0,
    'Cash',
    'Paid',
    1,
    '[
        {"product_id": 1, "product_name": "Crochet Cardigan", "quantity": 2, "price": 4000.00, "total": 8000.00}
    ]'::jsonb,
    2,
    NOW() - INTERVAL '5 days'
);

-- Transaction 2
INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at) VALUES
(
    'TXN-2025-0002',
    2,
    'Fatima Malik',
    45000.00,
    3000.00,
    0,
    'Cash',
    'Paid',
    1,
    '[
        {"product_id": 7, "product_name": "Bed Set", "quantity": 1, "price": 38000.00, "total": 38000.00},
        {"product_id": 8, "product_name": "Cushions", "quantity": 1, "price": 7000.00, "total": 7000.00}
    ]'::jsonb,
    3,
    NOW() - INTERVAL '4 days'
);

-- Transaction 3
INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at) VALUES
(
    'TXN-2025-0003',
    3,
    'Hassan Ali',
    25000.00,
    0,
    0,
    'Cash',
    'Paid',
    1,
    '[
        {"product_id": 32, "product_name": "Islamic Calligraphy with Oil Paint", "quantity": 1, "price": 15000.00, "total": 15000.00},
        {"product_id": 34, "product_name": "Islamic Calligraphy with Oil Paint", "quantity": 1, "price": 10000.00, "total": 10000.00}
    ]'::jsonb,
    2,
    NOW() - INTERVAL '3 days'
);

-- Transaction 4
INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at) VALUES
(
    'TXN-2025-0004',
    9,
    'Walk-in Customer',
    3600.00,
    0,
    0,
    'Cash',
    'Paid',
    1,
    '[
        {"product_id": 4, "product_name": "Hand Painted Lawn Dupatta", "quantity": 2, "price": 1800.00, "total": 3600.00}
    ]'::jsonb,
    2,
    NOW() - INTERVAL '2 days'
);

-- Transaction 5
INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at) VALUES
(
    'TXN-2025-0005',
    5,
    'Usman Tariq',
    11400.00,
    0,
    0,
    'Cash',
    'Paid',
    1,
    '[
        {"product_id": 153, "product_name": "Ceramic Floral MLV Vase", "quantity": 1, "price": 9000.00, "total": 9000.00},
        {"product_id": 151, "product_name": "Ceramic Floral Dinner Plate", "quantity": 2, "price": 1200.00, "total": 2400.00}
    ]'::jsonb,
    3,
    NOW() - INTERVAL '1 day'
);

-- =====================================================
-- Update product quantities based on transactions
-- =====================================================

UPDATE products SET quantity = quantity - 2 WHERE id = 1;
UPDATE products SET quantity = quantity - 1 WHERE id = 7;
UPDATE products SET quantity = quantity - 1 WHERE id = 8;
UPDATE products SET quantity = quantity - 1 WHERE id = 32;
UPDATE products SET quantity = quantity - 1 WHERE id = 34;
UPDATE products SET quantity = quantity - 2 WHERE id = 4;
UPDATE products SET quantity = quantity - 1 WHERE id = 153;
UPDATE products SET quantity = quantity - 2 WHERE id = 151;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 'Comprehensive seed data inserted successfully - EXACTLY 197 PRODUCTS!' AS status;
SELECT '5 Users, 21 Institutes, 30 Categories, 197 Products, 10 Customers, 5 Transactions' AS summary;
SELECT 'All product institute_id and category_id relations are correctly aligned' AS note;