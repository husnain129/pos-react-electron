"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../db/config"));
const inventory_1 = require("./inventory");
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    res.send("Transactions API");
});
router.get("/all", async (_req, res) => {
    try {
        const result = await config_1.default.query(`SELECT 
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
      ORDER BY t.id DESC`);
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.get("/on-hold", async (_req, res) => {
    try {
        const result = await config_1.default.query(`SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date 
            FROM transactions WHERE ref_number IS NOT NULL AND ref_number != '' AND status = 0`);
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.get("/customer-orders", async (_req, res) => {
    try {
        const result = await config_1.default.query(`SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date 
            FROM transactions WHERE customer_id IS NOT NULL AND customer_id != '0' AND status = 0 AND (ref_number IS NULL OR ref_number = '')`);
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.get("/by-date", async (req, res) => {
    try {
        const startDate = new Date(req.query.start);
        const endDate = new Date(req.query.end);
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
        const params = [
            startDate,
            endDate,
            parseInt(req.query.status),
        ];
        if (req.query.user && req.query.user != "0") {
            query += " AND t.user_id = $" + (params.length + 1);
            params.push(parseInt(req.query.user));
        }
        query += " ORDER BY t.id DESC";
        const result = await config_1.default.query(query, params);
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.post("/new", async (req, res) => {
    const newTransaction = req.body;
    try {
        const result = await config_1.default.query(`INSERT INTO transactions (ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`, [
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
        ]);
        res.json({ id: result.rows[0].id });
        if (newTransaction.paid >= newTransaction.total) {
            await (0, inventory_1.decrementInventory)(newTransaction.items);
        }
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.put("/new", async (req, res) => {
    const orderId = req.body._id;
    try {
        await config_1.default.query(`UPDATE transactions SET ref_number = $1, customer_id = $2, customer_name = $3, total_amount = $4, discount = $5, 
      tax = $6, payment_method = $7, payment_status = $8, status = $9, items = $10, user_id = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12`, [
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
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.post("/delete", async (req, res) => {
    const transaction = req.body;
    try {
        await config_1.default.query("DELETE FROM transactions WHERE id = $1", [
            transaction.orderId,
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.get("/:transactionId", async (req, res) => {
    try {
        const result = await config_1.default.query("SELECT id as _id, ref_number, customer_id, customer_name, total_amount, discount, tax, payment_method, payment_status, status, items, user_id, created_at as date FROM transactions WHERE id = $1", [req.params.transactionId]);
        res.send(result.rows[0] || null);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
exports.default = router;
