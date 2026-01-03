import express, { Request, Response, Router } from "express";
import db from "../db/config";

const router: Router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  res.send("Inventory API");
});

router.get("/product/:productId", async (req: Request, res: Response) => {
  if (!req.params.productId) {
    res.status(500).send("ID field is required.");
  } else {
    try {
      const result = await db.query(
        `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price,
        COALESCE(p.category_id, 0) as category, p.quantity, p.product_specifications as stock, 
        p.zone, p.district, p.institute_name, p.institute_id 
        FROM products p 
        WHERE p.id = $1`,
        [parseInt(req.params.productId)]
      );
      res.send(result.rows[0] || null);
    } catch (err: any) {
      res.status(500).send(err.message);
    }
  }
});

router.get("/products", async (_req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price,
      COALESCE(p.category_id, 0) as category, p.quantity, p.product_specifications as stock, 
      p.zone, p.district, p.institute_name, p.institute_id, p.product_category,
      p.created_at, p.updated_at
      FROM products p 
      ORDER BY p.id DESC`
    );
    res.send(result.rows);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/product", async (req: Request, res: Response) => {
  try {
    const categoryResult = await db.query(
      "SELECT name FROM categories WHERE id = $1",
      [parseInt(req.body.category)]
    );
    const categoryName =
      categoryResult.rows.length > 0 ? categoryResult.rows[0].name : null;

    if (req.body.id === "" || !req.body.id) {
      const result = await db.query(
        `INSERT INTO products (product_name, price, cost_price, product_category, category_id, quantity, product_specifications, institute_id, zone, district, institute_name) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id as _id, product_name as name, price, cost_price, product_category as category, quantity, product_specifications as stock`,
        [
          req.body.name,
          req.body.price,
          req.body.cost_price || 0,
          categoryName,
          req.body.category || null,
          req.body.quantity === "" ? 0 : req.body.quantity,
          req.body.stock === "on" ? 0 : 1,
          req.body.institute_id ? parseInt(req.body.institute_id) : null,
          req.body.zone || "",
          req.body.district || "",
          req.body.institute_name || "",
        ]
      );
      res.send(result.rows[0]);
    } else {
      await db.query(
        `UPDATE products SET product_name = $1, price = $2, cost_price = $3, product_category = $4, category_id = $5, quantity = $6, product_specifications = $7, institute_id = $8, zone = $9, district = $10, institute_name = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12`,
        [
          req.body.name,
          req.body.price,
          req.body.cost_price || 0,
          categoryName,
          req.body.category || null,
          req.body.quantity === "" ? 0 : req.body.quantity,
          req.body.stock === "on" ? 0 : 1,
          req.body.institute_id ? parseInt(req.body.institute_id) : null,
          req.body.zone || "",
          req.body.district || "",
          req.body.institute_name || "",
          parseInt(req.body.id),
        ]
      );
      res.sendStatus(200);
    }
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.delete("/product/:productId", async (req: Request, res: Response) => {
  try {
    await db.query("DELETE FROM products WHERE id = $1", [
      parseInt(req.params.productId),
    ]);
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).send(err.message);
  }
});

router.post("/product/sku", async (req: Request, res: Response) => {
  try {
    if (!req.body.skuCode || req.body.skuCode === "") {
      return res.status(400).send("SKU code is required");
    }

    const skuCode = parseInt(req.body.skuCode);
    if (isNaN(skuCode)) {
      return res.status(400).send("Invalid SKU code format");
    }

    const result = await db.query(
      `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price,
      COALESCE(c.id, 0) as category, p.quantity, p.product_specifications as stock 
      FROM products p 
      LEFT JOIN categories c ON c.name = p.product_category 
      WHERE p.id = $1`,
      [skuCode]
    );
    res.send(result.rows[0] || null);
  } catch (err: any) {
    console.error("Error in /product/sku:", err);
    res.status(500).send(err.message);
  }
});

export async function decrementInventory(products: any[]) {
  for (const transactionProduct of products) {
    try {
      const result = await db.query(
        "SELECT id, quantity FROM products WHERE id = $1",
        [parseInt(transactionProduct.id)]
      );

      const product = result.rows[0];
      if (product && product.quantity) {
        let updatedQuantity =
          parseInt(product.quantity) - parseInt(transactionProduct.quantity);
        await db.query(
          "UPDATE products SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
          [updatedQuantity, parseInt(product.id)]
        );
      }
    } catch (err) {
      console.error("Error decrementing inventory:", err);
    }
  }
}

export default router;
