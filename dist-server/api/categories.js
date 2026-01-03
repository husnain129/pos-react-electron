"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../db/config"));
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    res.send("Category API");
});
router.get("/all", async (_req, res) => {
    try {
        const result = await config_1.default.query("SELECT id as _id, name, description, institute_id FROM categories ORDER BY id DESC");
        res.send(result.rows);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.post("/category", async (req, res) => {
    const newCategory = req.body;
    try {
        const result = await config_1.default.query("INSERT INTO categories (name, description, institute_id) VALUES ($1, $2, $3) RETURNING id as _id, name, description, institute_id", [
            newCategory.name,
            newCategory.description,
            newCategory.institute_id || null,
        ]);
        res.send(result.rows[0]);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.delete("/category/:categoryId", async (req, res) => {
    try {
        await config_1.default.query("DELETE FROM categories WHERE id = $1", [
            parseInt(req.params.categoryId),
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.put("/category", async (req, res) => {
    try {
        await config_1.default.query("UPDATE categories SET name = $1, description = $2, institute_id = $3 WHERE id = $4", [
            req.body.name,
            req.body.description,
            req.body.institute_id || null,
            parseInt(req.body.id),
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
exports.default = router;
