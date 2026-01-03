import express, { Request, Response, Router } from "express";
import db from "../db/config";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Settings API");
});

router.get("/get", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT id as _id, store_name, store_address, store_phone, store_email, currency, tax_rate, receipt_header, receipt_footer, logo, symbol, charge_tax FROM settings WHERE id = 1"
    );
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
    } else {
      res.send(null);
    }
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/post", async (req: Request, res: Response) => {
  try {
    await db.query(
      `UPDATE settings SET 
        store_name = $1, 
        store_address = $2, 
        store_phone = $3, 
        currency = $4, 
        tax_rate = $5, 
        charge_tax = $6,
        receipt_footer = $7,
        updated_at = CURRENT_TIMESTAMP 
      WHERE id = 1`,
      [
        req.body.app || req.body.store,
        req.body.address_one,
        req.body.contact,
        req.body.symbol,
        req.body.percentage || 0,
        req.body.charge_tax === 1 || req.body.charge_tax === "1",
        req.body.footer,
      ]
    );
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
