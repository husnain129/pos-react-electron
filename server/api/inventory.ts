import express, { Request, Response, Router } from "express";
import db from "../db/config";

const router: Router = express.Router();

// EAN-13 barcode generation function
function calculateEAN13Checksum(barcode12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode12[i]);
    if (i % 2 === 0) {
      sum += digit * 1; // Odd positions (1st, 3rd, 5th, etc.)
    } else {
      sum += digit * 3; // Even positions (2nd, 4th, 6th, etc.)
    }
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

function generateBarcode(productId: number): string {
  const countryCode = "620"; // Pakistan
  const manufacturerCode = "1001"; // Creative Hands
  const productCode = productId.toString().padStart(5, "0");
  const barcode12 = countryCode + manufacturerCode + productCode;
  const checkDigit = calculateEAN13Checksum(barcode12);
  return barcode12 + checkDigit;
}

router.get("/", (_req: Request, res: Response) => {
  res.send("Inventory API");
});

router.get("/product/:productId", async (req: Request, res: Response) => {
  if (!req.params.productId) {
    res.status(500).send("ID field is required.");
  } else {
    try {
      const result = await db.query(
        `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
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
      `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
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
    let categoryName = null;

    // Only query category if category ID is provided and valid
    if (
      req.body.category &&
      req.body.category !== "" &&
      req.body.category !== "0"
    ) {
      const categoryResult = await db.query(
        "SELECT name FROM categories WHERE id = $1",
        [parseInt(req.body.category)]
      );
      categoryName =
        categoryResult.rows.length > 0 ? categoryResult.rows[0].name : null;
    }

    if (req.body.id === "" || !req.body.id) {
      // Fetch institute details if institute_id is provided
      let instituteData = {
        zone: "",
        district: "",
        institute_name: "",
      };

      if (req.body.institute_id) {
        console.log("Fetching institute with ID:", req.body.institute_id);
        const instituteResult = await db.query(
          "SELECT name, zone, district FROM institutes WHERE id = $1",
          [parseInt(req.body.institute_id)]
        );
        if (instituteResult.rows.length > 0) {
          instituteData = {
            zone: instituteResult.rows[0].zone || "",
            district: instituteResult.rows[0].district || "",
            institute_name: instituteResult.rows[0].name || "",
          };
          console.log("Institute data found:", instituteData);
        } else {
          console.log("No institute found with ID:", req.body.institute_id);
        }
      }

      console.log("Creating product with institute data:", instituteData);
      const result = await db.query(
        `INSERT INTO products (product_name, price, cost_price, product_category, category_id, quantity, product_specifications, institute_id, zone, district, institute_name) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          req.body.name,
          req.body.price,
          req.body.cost_price || 0,
          categoryName,
          req.body.category || null,
          req.body.quantity === "" ? 0 : req.body.quantity,
          req.body.stock === "on" ? 0 : 1,
          req.body.institute_id ? parseInt(req.body.institute_id) : null,
          instituteData.zone,
          instituteData.district,
          instituteData.institute_name,
        ]
      );

      const newProductId = result.rows[0].id;
      const barcode = generateBarcode(newProductId);
      console.log(
        "Generated barcode:",
        barcode,
        "for product ID:",
        newProductId
      );

      // Update the product with generated barcode
      await db.query(`UPDATE products SET barcode = $1 WHERE id = $2`, [
        barcode,
        newProductId,
      ]);

      // Fetch and return complete product data
      const productResult = await db.query(
        `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
        COALESCE(p.category_id, 0) as category, p.quantity, p.product_specifications as stock, 
        p.zone, p.district, p.institute_name, p.institute_id, p.product_category,
        p.created_at, p.updated_at
        FROM products p WHERE p.id = $1`,
        [newProductId]
      );

      res.send(productResult.rows[0]);
    } else {
      // Fetch institute details if institute_id is provided
      let instituteData = {
        zone: req.body.zone || "",
        district: req.body.district || "",
        institute_name: req.body.institute_name || "",
      };

      if (req.body.institute_id) {
        const instituteResult = await db.query(
          "SELECT name, zone, district FROM institutes WHERE id = $1",
          [parseInt(req.body.institute_id)]
        );
        if (instituteResult.rows.length > 0) {
          instituteData = {
            zone: instituteResult.rows[0].zone || "",
            district: instituteResult.rows[0].district || "",
            institute_name: instituteResult.rows[0].name || "",
          };
        }
      }

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
          instituteData.zone,
          instituteData.district,
          instituteData.institute_name,
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
      `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
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
