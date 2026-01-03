"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const config_1 = __importDefault(require("../db/config"));
const router = express_1.default.Router();
router.get("/", (_req, res) => {
    res.send("Settings API");
});
router.get("/get", async (_req, res) => {
    try {
        const result = await config_1.default.query("SELECT id as _id, store_name, store_address, store_phone, store_email, currency, tax_rate, receipt_header, receipt_footer, logo, symbol, charge_tax FROM settings WHERE id = 1");
        if (result.rows.length > 0) {
            const settings = result.rows[0];
            res.send({
                _id: 1,
                ...settings,
                settings: {
                    app: settings.store_name,
                    store: settings.store_name,
                    address_one: settings.store_address,
                    address_two: settings.store_address,
                    contact: settings.store_phone,
                    tax: settings.tax_rate,
                    symbol: settings.symbol || settings.currency,
                    percentage: settings.tax_rate,
                    charge_tax: settings.charge_tax ? 1 : 0,
                    footer: settings.receipt_footer,
                    img: settings.logo,
                },
            });
        }
        else {
            res.send(null);
        }
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
router.post("/post", async (req, res) => {
    try {
        await config_1.default.query(`UPDATE settings SET 
        store_name = $1, 
        store_address = $2, 
        store_phone = $3, 
        currency = $4, 
        tax_rate = $5, 
        charge_tax = $6,
        receipt_footer = $7,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = 1`, [
            req.body.app || req.body.store,
            req.body.address_one,
            req.body.contact,
            req.body.symbol,
            req.body.percentage || 0,
            req.body.charge_tax === 1 || req.body.charge_tax === "1",
            req.body.footer,
        ]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send(err.message);
    }
});
exports.default = router;
