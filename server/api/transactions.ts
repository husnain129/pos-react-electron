import express, { Request, Response, Router } from 'express';
import db from '../db/config';
import { decrementInventory } from './inventory';

const router: Router = express.Router();

// Helper function to enrich transaction items with product category and institute data
async function enrichTransactionItems(items: any[]): Promise<any[]> {
  if (!items || items.length === 0) {
    return items;
  }

  // Get all product IDs from items (handle both 'id' and 'product_id' fields)
  const productIds = items
    .map((item) => {
      // Try id first, then product_id
      const productId = item.id || item.product_id;
      return productId != null ? Number(productId) : null;
    })
    .filter((id) => id != null && !isNaN(id));

  if (productIds.length === 0) {
    return items;
  }

  try {
    // Fetch product data with category and institute information
    const productResult = await db.query(
      `SELECT 
        p.id,
        p.category_id,
        p.institute_id,
        p.product_category,
        p.institute_name,
        c.name as category_name,
        i.name as institute_name_from_table
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN institutes i ON p.institute_id = i.id
      WHERE p.id = ANY($1)`,
      [productIds],
    );

    // Create a map of product_id -> product data
    const productMap = new Map();
    productResult.rows.forEach((row) => {
      productMap.set(row.id, {
        category_id: row.category_id,
        category_name: row.category_name || row.product_category || 'Uncategorized',
        institute_id: row.institute_id,
        institute_name: row.institute_name_from_table || row.institute_name || 'General',
        product_category: row.product_category,
      });
    });

    // Enrich items with product data
    const enrichedItems = items.map((item) => {
      const productId = Number(item.id || item.product_id);
      const productData = productMap.get(productId);

      if (productData) {
        return {
          ...item,
          category_id: productData.category_id,
          category_name: productData.category_name,
          institute_id: productData.institute_id,
          institute_name: productData.institute_name,
          product_category: productData.product_category,
        };
      }

      // If product not found, return item as-is (for backward compatibility)
      return {
        ...item,
        category_name: 'Uncategorized',
        institute_name: 'General',
      };
    });

    return enrichedItems;
  } catch (error) {
    console.error('Error enriching transaction items:', error);
    // Return items as-is if enrichment fails
    return items;
  }
}

// Helper function to process transactions and enrich their items
async function processTransactions(transactions: any[]): Promise<any[]> {
  console.log('Processing transactions, count:', transactions.length);
  const processedTransactions = await Promise.all(
    transactions.map(async (transaction) => {
      if (transaction.items) {
        // Parse JSONB items if it's a string
        let items = transaction.items;
        if (typeof items === 'string') {
          try {
            items = JSON.parse(items);
          } catch (e) {
            console.error('Error parsing items JSON:', e);
            items = [];
          }
        }

        console.log('Transaction', transaction._id, 'has items:', items);

        // Enrich items with product data
        const enrichedItems = await enrichTransactionItems(items);
        const enrichedTransaction = {
          ...transaction,
          items: enrichedItems,
        };
        console.log('Transaction', transaction._id, 'enriched items:', enrichedItems);
        return enrichedTransaction;
      }
      return transaction;
    }),
  );

  console.log('Processed transactions count:', processedTransactions.length);
  return processedTransactions;
}

router.get('/', (_req: Request, res: Response) => {
  res.send('Transactions API');
});

router.get('/all', async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        t.id as _id, 
        t.id as order, 
        t.ref_number, 
        t.customer_id, 
        t.customer_name, 
        t.total_amount as total, 
        t.total_amount as paid,
        0 as change,
        t.discount, 
        t.tax, 
        t.payment_method, 
        t.payment_status, 
        t.status, 
        t.items, 
        t.user_id,
        1 as till,
        COALESCE(u.fullname, u.username, 'Administrator') as user,
        t.created_at as date 
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY t.id DESC`,
    );
    const processedTransactions = await processTransactions(result.rows);
    res.send(processedTransactions);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get('/on-hold', async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date 
            FROM transactions WHERE ref_number IS NOT NULL AND ref_number != '' AND status = 0`,
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get('/customer-orders', async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date 
            FROM transactions WHERE customer_id IS NOT NULL AND customer_id != '0' AND status = 0 AND (ref_number IS NULL OR ref_number = '')`,
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get('/by-date', async (req: Request, res: Response) => {
  try {
    const startDateStr = req.query.start as string;
    const endDateStr = req.query.end as string;

    if (!startDateStr || !endDateStr) {
      return res.status(400).send({ error: 'Start date and end date are required' });
    }

    // Parse and validate dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send({ error: 'Invalid date format' });
    }

    // Set time to start and end of day
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    let query = `
      SELECT 
        t.id as _id, 
        t.id as order, 
        t.ref_number, 
        t.customer_id, 
        t.customer_name, 
        t.total_amount as total, 
        t.total_amount as paid,
        0 as change,
        t.discount, 
        t.tax, 
        t.payment_method, 
        t.payment_status, 
        t.status, 
        t.items, 
        t.user_id,
        1 as till,
        COALESCE(u.fullname, u.username, 'Administrator') as user,
        t.created_at as date 
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.created_at >= $1 AND t.created_at <= $2 AND t.status = $3`;
    const params: any[] = [startDate.toISOString(), endDate.toISOString(), parseInt(req.query.status as string) || 1];

    if (req.query.user && req.query.user != '0') {
      query += ' AND t.user_id = $' + (params.length + 1);
      params.push(parseInt(req.query.user as string));
    }

    query += ' ORDER BY t.id DESC';

    const result = await db.query(query, params);
    const processedTransactions = await processTransactions(result.rows);
    res.send(processedTransactions);
  } catch (err: any) {
    console.error('Error in /by-date endpoint:', err);
    res.status(500).send(err.message);
  }
});

router.post('/new', async (req: Request, res: Response) => {
  const newTransaction = req.body;
  try {
    const result = await db.query(
      `INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        newTransaction.ref_number,
        newTransaction.customer || null,
        newTransaction.customer_name || '',
        newTransaction.total || 0,
        newTransaction.discount || 0,
        newTransaction.tax || 0,
        newTransaction.payment_method || '',
        newTransaction.payment_status || '',
        newTransaction.status || 1,
        JSON.stringify(newTransaction.items || []),
        newTransaction.user_id || null,
      ],
    );

    const transactionId = result.rows[0].id;

    // Decrement inventory if payment is successful
    if (
      newTransaction.payment_status === 'Paid' ||
      (newTransaction.paid && newTransaction.paid >= newTransaction.total)
    ) {
      await decrementInventory(newTransaction.items);
    }

    res.json({ id: transactionId });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.put('/new', async (req: Request, res: Response) => {
  const orderId = req.body._id;
  try {
    await db.query(
      `UPDATE transactions SET ref_number = $1, customer_id = $2, customer_name = $3, total_amount = $4, discount = $5, 
      tax = $6, payment_method = $7, payment_status = $8, status = $9, items = $10, user_id = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12`,
      [
        req.body.ref_number,
        req.body.customer || null,
        req.body.customer_name || '',
        req.body.total || 0,
        req.body.discount || 0,
        req.body.tax || 0,
        req.body.payment_method || '',
        req.body.payment_status || '',
        req.body.status || 1,
        JSON.stringify(req.body.items || []),
        req.body.user_id || null,
        orderId,
      ],
    );
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post('/delete', async (req: Request, res: Response) => {
  const transaction = req.body;
  try {
    await db.query('DELETE FROM transactions WHERE id = $1', [transaction.orderId]);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get('/:transactionId', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      'SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date FROM transactions WHERE id = $1',
      [req.params.transactionId],
    );
    res.send(result.rows[0] || null);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
