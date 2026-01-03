"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../db/config"));
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    res.send("Institutes API");
});
router.get("/all", async (_req, res) => {
    try {
        const result = await config_1.default.query("SELECT * FROM institutes ORDER BY id DESC");
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching institutes:", err);
        res.status(500).json({ error: "Failed to fetch institutes" });
    }
});
router.get("/institute/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const result = await config_1.default.query("SELECT * FROM institutes WHERE id = $1", [
            id,
        ]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error("Error fetching institute:", err);
        res.status(500).json({ error: "Failed to fetch institute" });
    }
});
router.post("/institute", async (req, res) => {
    const { id, name, district, zone } = req.body;
    try {
        if (id) {
            const result = await config_1.default.query("UPDATE institutes SET name = $1, district = $2, zone = $3 WHERE id = $4 RETURNING *", [name, district, zone, id]);
            res.json(result.rows[0]);
        }
        else {
            const result = await config_1.default.query("INSERT INTO institutes (name, district, zone) VALUES ($1, $2, $3) RETURNING *", [name, district, zone]);
            res.json(result.rows[0]);
        }
    }
    catch (err) {
        console.error("Error saving institute:", err);
        res.status(500).json({ error: "Failed to save institute" });
    }
});
router.delete("/institute/:id", async (req, res) => {
    const id = req.params.id;
    try {
        await config_1.default.query("DELETE FROM institutes WHERE id = $1", [id]);
        res.json({ success: true, message: "Institute deleted" });
    }
    catch (err) {
        console.error("Error deleting institute:", err);
        res.status(500).json({ error: "Failed to delete institute" });
    }
});
exports.default = router;
