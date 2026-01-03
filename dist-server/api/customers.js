"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../db/config"));
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    res.send("Customer API");
});
router.get("/customer/:customerId", async (req, res) => {
    if (!req.params.customerId) {
        res.status(500).send("ID field is required.");
    }
    else {
        try {
            const result = await config_1.default.query("SELECT id as _id, name, phone, email, address FROM customers WHERE id = $1", [req.params.customerId]);
            res.send(result.rows[0] || null);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
});
router.get("/all", async (_req, res) => {
    try {
        const result = await config_1.default.query("SELECT id as _id, name, phone, email, address FROM customers ORDER BY id");
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.post("/customer", async (req, res) => {
    const newCustomer = req.body;
    try {
        const result = await config_1.default.query("INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING id as _id, name, phone", [
            newCustomer.name,
            newCustomer.phone,
            newCustomer.email || null,
            newCustomer.address || null,
        ]);
        res.send(result.rows[0]);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.delete("/customer/:customerId", async (req, res) => {
    try {
        await config_1.default.query("DELETE FROM customers WHERE id = $1", [
            req.params.customerId,
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.put("/customer", async (req, res) => {
    const customerId = req.body._id;
    try {
        await config_1.default.query("UPDATE customers SET name = $1, phone = $2, email = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5", [
            req.body.name,
            req.body.phone,
            req.body.email || null,
            req.body.address || null,
            customerId,
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
exports.default = router;
