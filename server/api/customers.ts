import express, { Request, Response, Router } from "express";
import db from "../db/config";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Customer API");
});

router.get("/customer/:customerId", async (req: Request, res: Response) => {
  if (!req.params.customerId) {
    res.status(500).send("ID field is required.");
  } else {
    try {
      const result = await db.query(
        "SELECT id as _id, name, phone, email, address FROM customers WHERE id = $1",
        [req.params.customerId]
      );
      res.send(result.rows[0] || null);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }
});

router.get("/all", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      "SELECT id as _id, name, phone, email, address FROM customers ORDER BY id"
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/customer", async (req: Request, res: Response) => {
  const newCustomer = req.body;
  try {
    const result = await db.query(
      "INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING id as _id, name, phone",
      [
        newCustomer.name,
        newCustomer.phone,
        newCustomer.email || null,
        newCustomer.address || null,
      ]
    );
    res.send(result.rows[0]);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.delete("/customer/:customerId", async (req: Request, res: Response) => {
  try {
    await db.query("DELETE FROM customers WHERE id = $1", [
      req.params.customerId,
    ]);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.put("/customer", async (req: Request, res: Response) => {
  const customerId = req.body._id;
  try {
    await db.query(
      "UPDATE customers SET name = $1, phone = $2, email = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5",
      [
        req.body.name,
        req.body.phone,
        req.body.email || null,
        req.body.address || null,
        customerId,
      ]
    );
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

export default router;
