"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../db/config"));
const router = express_1.default.Router();
// Simple encoding function (matching Store-POS btoa)
function encode(str) {
    return Buffer.from(str).toString("base64");
}
router.get("/", (_req, res) => {
    res.send("Users API");
});
router.get("/user/:userId", async (req, res) => {
    if (!req.params.userId) {
        res.status(500).send("ID field is required.");
    }
    else {
        try {
            const result = await config_1.default.query("SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users WHERE id = $1", [parseInt(req.params.userId)]);
            res.send(result.rows[0] || null);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
});
router.get("/logout/:userId", async (req, res) => {
    if (!req.params.userId) {
        res.status(500).send("ID field is required.");
    }
    else {
        try {
            await config_1.default.query("UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", ["Logged Out_" + new Date(), parseInt(req.params.userId)]);
            res.sendStatus(200);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
});
router.post("/login", async (req, res) => {
    try {
        // Try with encoded password first
        let result = await config_1.default.query("SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users WHERE username = $1 AND password = $2", [req.body.username, encode(req.body.password)]);
        // If no result with encoded password, try plain text
        if (!result.rows[0]) {
            result = await config_1.default.query("SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users WHERE username = $1 AND password = $2", [req.body.username, req.body.password]);
        }
        if (result.rows[0]) {
            await config_1.default.query("UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", ["Logged In_" + new Date(), result.rows[0]._id]);
        }
        res.send(result.rows[0] || null);
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).send(err.message);
    }
});
router.get("/all", async (_req, res) => {
    try {
        const result = await config_1.default.query("SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users ORDER BY id");
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.delete("/user/:userId", async (req, res) => {
    try {
        await config_1.default.query("DELETE FROM users WHERE id = $1", [
            parseInt(req.params.userId),
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.post("/post", async (req, res) => {
    try {
        if (req.body.id === "" || !req.body.id) {
            const result = await config_1.default.query(`INSERT INTO users (username, password, fullname, perm_products, perm_categories, perm_transactions, perm_users, perm_settings, status, role) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING id as _id, username, fullname, perm_products, perm_categories, perm_transactions, perm_users, perm_settings, status, role`, [
                req.body.username,
                encode(req.body.password),
                req.body.fullname,
                req.body.perm_products === "on" ? 1 : 0,
                req.body.perm_categories === "on" ? 1 : 0,
                req.body.perm_transactions === "on" ? 1 : 0,
                req.body.perm_users === "on" ? 1 : 0,
                req.body.perm_settings === "on" ? 1 : 0,
                "",
                req.body.role || "cashier",
            ]);
            res.send(result.rows[0]);
        }
        else {
            await config_1.default.query(`UPDATE users SET username = $1, password = $2, fullname = $3, perm_products = $4, perm_categories = $5, 
                perm_transactions = $6, perm_users = $7, perm_settings = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9`, [
                req.body.username,
                encode(req.body.password),
                req.body.fullname,
                req.body.perm_products === "on" ? 1 : 0,
                req.body.perm_categories === "on" ? 1 : 0,
                req.body.perm_transactions === "on" ? 1 : 0,
                req.body.perm_users === "on" ? 1 : 0,
                req.body.perm_settings === "on" ? 1 : 0,
                parseInt(req.body.id),
            ]);
            res.sendStatus(200);
        }
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
exports.default = router;
