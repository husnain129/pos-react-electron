-- Delete All Transactions
-- WARNING: This will permanently delete all transaction records from the database
-- Make sure to backup your database before running this script

-- Delete all transactions
DELETE FROM transactions;

-- Reset the auto-increment sequence to start from 1
-- This ensures the next transaction will have ID = 1
SELECT setval('transactions_id_seq', 1, false);

-- Display confirmation
SELECT 'All transactions have been deleted and ID sequence has been reset to 1' AS status;
