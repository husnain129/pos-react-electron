import express, { Request, Response, Router } from "express";
import db from "../db/config";
import { decrementInventory } from "./inventory";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Transactions API");
});

router.get("/all", async (_req: Request, res: Response) => {
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
      ORDER BY t.id DESC`
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get("/on-hold", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date 
            FROM transactions WHERE ref_number IS NOT NULL AND ref_number != '' AND status = 0`
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get("/customer-orders", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date 
            FROM transactions WHERE customer_id IS NOT NULL AND customer_id != '0' AND status = 0 AND (ref_number IS NULL OR ref_number = '')`
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get("/by-date", async (req: Request, res: Response) => {
  try {
    const startDate = new Date(req.query.start as string);
    const endDate = new Date(req.query.end as string);
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
    const params: any[] = [
      startDate,
      endDate,
      parseInt(req.query.status as string),
    ];

    if (req.query.user && req.query.user != "0") {
      query += " AND t.user_id = $" + (params.length + 1);
      params.push(parseInt(req.query.user as string));
    }

    query += " ORDER BY t.id DESC";

    const result = await db.query(query, params);
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/new", async (req: Request, res: Response) => {
  const newTransaction = req.body;
  try {
    const result = await db.query(
      `INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [
        newTransaction.ref_number,
        newTransaction.customer || null,
        newTransaction.customer_name || "",
        newTransaction.total || 0,
        newTransaction.discount || 0,
        newTransaction.tax || 0,
        newTransaction.payment_method || "",
        newTransaction.payment_status || "",
        newTransaction.status || 1,
        JSON.stringify(newTransaction.items || []),
        newTransaction.user_id || null,
      ]
    );

    const transactionId = result.rows[0].id;

    // Decrement inventory if payment is successful
    if (
      newTransaction.payment_status === "Paid" ||
      (newTransaction.paid && newTransaction.paid >= newTransaction.total)
    ) {
      await decrementInventory(newTransaction.items);
    }

    res.json({ id: transactionId });
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.put("/new", async (req: Request, res: Response) => {
  const orderId = req.body._id;
  try {
    await db.query(
      `UPDATE transactions SET ref_number = $1, customer_id = $2, customer_name = $3, total_amount = $4, discount = $5, 
      tax = $6, payment_method = $7, payment_status = $8, status = $9, items = $10, user_id = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12`,
      [
        req.body.ref_number,
        req.body.customer || null,
        req.body.customer_name || "",
        req.body.total || 0,
        req.body.discount || 0,
        req.body.tax || 0,
        req.body.payment_method || "",
        req.body.payment_status || "",
        req.body.status || 1,
        JSON.stringify(req.body.items || []),
        req.body.user_id || null,
        orderId,
      ]
    );
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/delete", async (req: Request, res: Response) => {
  const transaction = req.body;
  try {
    await db.query("DELETE FROM transactions WHERE id = $1", [
      transaction.orderId,
    ]);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.get("/:transactionId", async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date FROM transactions WHERE id = $1",
      [req.params.transactionId]
    );
    res.send(result.rows[0] || null);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
