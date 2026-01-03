import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from the app root directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectionString = process.env.DATABASE_URL || "";
const requireSSL = connectionString.includes("sslmode=require");
const disableSSL = connectionString.includes("sslmode=disable");

const dbConfig: any = {
  connectionString,
};

if (requireSSL) {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
} else if (!disableSSL && connectionString.includes("aws.neon.tech")) {
  // Enable SSL for Neon and other cloud databases by default
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(dbConfig);

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Simple encoding function for passwords
function encode(str: string): string {
  return Buffer.from(str).toString("base64");
}

// EAN-13 barcode generation
function calculateEAN13Checksum(barcode12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(barcode12[i]);
    if (i % 2 === 0) {
      sum += digit * 1;
    } else {
      sum += digit * 3;
    }
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit;
}

function generateBarcode(productId: number): string {
  const countryCode = "620";
  const manufacturerCode = "1001";
  const productCode = productId.toString().padStart(5, "0");
  const barcode12 = countryCode + manufacturerCode + productCode;
  const checkDigit = calculateEAN13Checksum(barcode12);
  return barcode12 + checkDigit;
}

// Database operations
export const dbOperations = {
  // Users
  users: {
    login: async (username: string, password: string) => {
      try {
        let result = await query(
          "SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users WHERE username = $1 AND password = $2",
          [username, encode(password)]
        );

        if (!result.rows[0]) {
          result = await query(
            "SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users WHERE username = $1 AND password = $2",
            [username, password]
          );
        }

        if (result.rows[0]) {
          await query(
            "UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            ["Logged In_" + new Date(), result.rows[0]._id]
          );
        }
        return result.rows[0] || null;
      } catch (err: any) {
        console.error("Login error:", err);
        throw new Error(err.message);
      }
    },

    logout: async (userId: number) => {
      await query(
        "UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        ["Logged Out_" + new Date(), userId]
      );
    },

    getAll: async () => {
      const result = await query(
        "SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users ORDER BY id"
      );
      return result.rows;
    },

    getById: async (userId: number) => {
      const result = await query(
        "SELECT id as _id, username, name, fullname, email, role, status, perm_products, perm_categories, perm_transactions, perm_users, perm_settings FROM users WHERE id = $1",
        [userId]
      );
      return result.rows[0] || null;
    },

    create: async (userData: any) => {
      const result = await query(
        "INSERT INTO users (username, password, name, fullname, email, role, perm_products, perm_categories, perm_transactions, perm_users, perm_settings) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id as _id, username, name, fullname, email, role",
        [
          userData.username,
          encode(userData.password),
          userData.name,
          userData.fullname || "",
          userData.email || "",
          userData.role,
          userData.perm_products || false,
          userData.perm_categories || false,
          userData.perm_transactions || false,
          userData.perm_users || false,
          userData.perm_settings || false,
        ]
      );
      return result.rows[0];
    },

    update: async (userData: any) => {
      const result = await query(
        "UPDATE users SET username = $1, password = $2, name = $3, fullname = $4, email = $5, role = $6, perm_products = $7, perm_categories = $8, perm_transactions = $9, perm_users = $10, perm_settings = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING id as _id, username, name, fullname, email, role",
        [
          userData.username,
          userData.password.includes("=")
            ? userData.password
            : encode(userData.password),
          userData.name,
          userData.fullname || "",
          userData.email || "",
          userData.role,
          userData.perm_products || false,
          userData.perm_categories || false,
          userData.perm_transactions || false,
          userData.perm_users || false,
          userData.perm_settings || false,
          userData.id,
        ]
      );
      return result.rows[0];
    },

    delete: async (userId: number) => {
      await query("DELETE FROM users WHERE id = $1", [userId]);
    },
  },

  // Products/Inventory
  inventory: {
    getAll: async () => {
      const result = await query(
        `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
        COALESCE(p.category_id, 0) as category, p.quantity, p.product_specifications as stock, 
        p.zone, p.district, p.institute_name, p.institute_id, p.product_category,
        p.created_at, p.updated_at
        FROM products p 
        ORDER BY p.id DESC`
      );
      return result.rows;
    },

    getById: async (productId: number) => {
      const result = await query(
        `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
        COALESCE(p.category_id, 0) as category, p.quantity, p.product_specifications as stock, 
        p.zone, p.district, p.institute_name, p.institute_id 
        FROM products p 
        WHERE p.id = $1`,
        [productId]
      );
      return result.rows[0] || null;
    },

    getBySKU: async (skuCode: string) => {
      const result = await query(
        `SELECT p.id as _id, p.product_name as name, p.price, p.cost_price, p.barcode,
        COALESCE(p.category_id, 0) as category, p.quantity, p.product_specifications as stock, 
        p.zone, p.district, p.institute_name, p.institute_id 
        FROM products p 
        WHERE p.barcode = $1`,
        [skuCode]
      );
      return result.rows[0] || null;
    },

    create: async (productData: any) => {
      const categoryResult = await query(
        "SELECT name FROM categories WHERE id = $1",
        [parseInt(productData.category)]
      );
      const categoryName =
        categoryResult.rows.length > 0 ? categoryResult.rows[0].name : null;

      let instituteDetails = { zone: "", district: "", institute_name: "" };
      if (productData.institute_id) {
        const instituteResult = await query(
          "SELECT zone, district, name as institute_name FROM institutes WHERE id = $1",
          [parseInt(productData.institute_id)]
        );
        if (instituteResult.rows.length > 0) {
          instituteDetails = instituteResult.rows[0];
        }
      }

      const result = await query(
        `INSERT INTO products (product_name, price, cost_price, category_id, product_category, quantity, product_specifications, institute_id, zone, district, institute_name) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING id, product_name, price, cost_price, barcode, category_id, quantity, product_specifications, institute_id, zone, district, institute_name, created_at, updated_at`,
        [
          productData.name,
          parseFloat(productData.price),
          parseFloat(productData.cost_price || 0),
          parseInt(productData.category),
          categoryName,
          parseInt(productData.quantity || 0),
          productData.stock || "",
          productData.institute_id ? parseInt(productData.institute_id) : null,
          instituteDetails.zone,
          instituteDetails.district,
          instituteDetails.institute_name,
        ]
      );

      const newProduct = result.rows[0];
      const barcode = generateBarcode(newProduct.id);
      await query("UPDATE products SET barcode = $1 WHERE id = $2", [
        barcode,
        newProduct.id,
      ]);

      return { ...newProduct, barcode };
    },

    update: async (productData: any) => {
      const categoryResult = await query(
        "SELECT name FROM categories WHERE id = $1",
        [parseInt(productData.category)]
      );
      const categoryName =
        categoryResult.rows.length > 0 ? categoryResult.rows[0].name : null;

      let instituteDetails = { zone: "", district: "", institute_name: "" };
      if (productData.institute_id) {
        const instituteResult = await query(
          "SELECT zone, district, name as institute_name FROM institutes WHERE id = $1",
          [parseInt(productData.institute_id)]
        );
        if (instituteResult.rows.length > 0) {
          instituteDetails = instituteResult.rows[0];
        }
      }

      const result = await query(
        `UPDATE products 
         SET product_name = $1, price = $2, cost_price = $3, category_id = $4, product_category = $5, 
             quantity = $6, product_specifications = $7, institute_id = $8, zone = $9, district = $10, 
             institute_name = $11, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $12 
         RETURNING id, product_name, price, cost_price, barcode, category_id, quantity, product_specifications, 
                   institute_id, zone, district, institute_name, created_at, updated_at`,
        [
          productData.name,
          parseFloat(productData.price),
          parseFloat(productData.cost_price || 0),
          parseInt(productData.category),
          categoryName,
          parseInt(productData.quantity || 0),
          productData.stock || "",
          productData.institute_id ? parseInt(productData.institute_id) : null,
          instituteDetails.zone,
          instituteDetails.district,
          instituteDetails.institute_name,
          productData.id,
        ]
      );

      return result.rows[0];
    },

    delete: async (productId: number) => {
      await query("DELETE FROM products WHERE id = $1", [productId]);
    },

    decrementInventory: async (productId: number, quantity: number) => {
      await query(
        "UPDATE products SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [quantity, productId]
      );
    },
  },

  // Categories
  categories: {
    getAll: async () => {
      const result = await query(
        "SELECT id as _id, name, description, institute_id, created_at FROM categories ORDER BY id"
      );
      return result.rows;
    },

    create: async (categoryData: any) => {
      const result = await query(
        "INSERT INTO categories (name, description, institute_id) VALUES ($1, $2, $3) RETURNING id as _id, name, description, institute_id",
        [
          categoryData.name,
          categoryData.description || null,
          categoryData.institute_id
            ? parseInt(categoryData.institute_id)
            : null,
        ]
      );
      return result.rows[0];
    },

    update: async (categoryData: any) => {
      const result = await query(
        "UPDATE categories SET name = $1, description = $2, institute_id = $3 WHERE id = $4 RETURNING id as _id, name, description, institute_id",
        [
          categoryData.name,
          categoryData.description || null,
          categoryData.institute_id
            ? parseInt(categoryData.institute_id)
            : null,
          categoryData.id,
        ]
      );
      return result.rows[0];
    },

    delete: async (categoryId: number) => {
      await query("DELETE FROM categories WHERE id = $1", [categoryId]);
    },
  },

  // Institutes
  institutes: {
    getAll: async () => {
      const result = await query(
        "SELECT id as _id, name as institute_name, zone, district, created_at, updated_at FROM institutes ORDER BY id"
      );
      return result.rows;
    },

    getById: async (id: number) => {
      const result = await query(
        "SELECT id as _id, name as institute_name, zone, district, created_at, updated_at FROM institutes WHERE id = $1",
        [id]
      );
      return result.rows[0] || null;
    },

    create: async (data: any) => {
      const result = await query(
        "INSERT INTO institutes (name, zone, district) VALUES ($1, $2, $3) RETURNING id as _id, name as institute_name, zone, district",
        [data.institute_name, data.zone, data.district]
      );
      return result.rows[0];
    },

    update: async (data: any) => {
      const result = await query(
        "UPDATE institutes SET name = $1, zone = $2, district = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id as _id, name as institute_name, zone, district",
        [data.institute_name, data.zone, data.district, data.id]
      );
      return result.rows[0];
    },

    delete: async (id: number) => {
      await query("DELETE FROM institutes WHERE id = $1", [id]);
    },
  },

  // Customers
  customers: {
    getAll: async () => {
      const result = await query(
        "SELECT id as _id, name, phone, email, address, created_at, updated_at FROM customers ORDER BY id"
      );
      return result.rows;
    },

    getById: async (customerId: number) => {
      const result = await query(
        "SELECT id as _id, name, phone, email, address, created_at, updated_at FROM customers WHERE id = $1",
        [customerId]
      );
      return result.rows[0] || null;
    },

    create: async (customerData: any) => {
      const result = await query(
        "INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) RETURNING id as _id, name, phone, email, address",
        [
          customerData.name,
          customerData.phone || "",
          customerData.email || "",
          customerData.address || "",
        ]
      );
      return result.rows[0];
    },

    update: async (customerData: any) => {
      const result = await query(
        "UPDATE customers SET name = $1, phone = $2, email = $3, address = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id as _id, name, phone, email, address",
        [
          customerData.name,
          customerData.phone || "",
          customerData.email || "",
          customerData.address || "",
          customerData.id,
        ]
      );
      return result.rows[0];
    },

    delete: async (customerId: number) => {
      await query("DELETE FROM customers WHERE id = $1", [customerId]);
    },
  },

  // Transactions
  transactions: {
    getAll: async () => {
      const result = await query(
        `SELECT t.*, u.name as user_name 
         FROM transactions t 
         LEFT JOIN users u ON t.user_id = u.id 
         ORDER BY t.id DESC`
      );
      return result.rows;
    },

    getById: async (transactionId: number) => {
      const result = await query(
        `SELECT t.*, u.name as user_name 
         FROM transactions t 
         LEFT JOIN users u ON t.user_id = u.id 
         WHERE t.id = $1`,
        [transactionId]
      );
      return result.rows[0] || null;
    },

    getByDate: async (
      start: string,
      end: string,
      status: number,
      user?: number
    ) => {
      let queryText = `SELECT t.*, u.name as user_name 
                       FROM transactions t 
                       LEFT JOIN users u ON t.user_id = u.id 
                       WHERE t.created_at BETWEEN $1 AND $2 AND t.status = $3`;
      const params: any[] = [start, end, status];

      if (user && user > 0) {
        queryText += " AND t.user_id = $4";
        params.push(user);
      }

      queryText += " ORDER BY t.id DESC";
      const result = await query(queryText, params);
      return result.rows;
    },

    getOnHold: async () => {
      const result = await query(
        `SELECT t.*, u.name as user_name 
         FROM transactions t 
         LEFT JOIN users u ON t.user_id = u.id 
         WHERE t.status = 0 
         ORDER BY t.id DESC`
      );
      return result.rows;
    },

    getCustomerOrders: async () => {
      const result = await query(
        `SELECT t.*, u.name as user_name 
         FROM transactions t 
         LEFT JOIN users u ON t.user_id = u.id 
         WHERE t.status = 2 
         ORDER BY t.id DESC`
      );
      return result.rows;
    },

    create: async (transactionData: any) => {
      const result = await query(
        `INSERT INTO transactions (user_id, customer_id, items, total, payment_method, status, notes, discount, tax) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
         RETURNING *`,
        [
          transactionData.user_id,
          transactionData.customer_id || null,
          JSON.stringify(transactionData.items),
          transactionData.total,
          transactionData.payment_method,
          transactionData.status,
          transactionData.notes || "",
          transactionData.discount || 0,
          transactionData.tax || 0,
        ]
      );

      // Decrement inventory for completed transactions
      if (transactionData.status === 1) {
        for (const item of transactionData.items) {
          await dbOperations.inventory.decrementInventory(
            item.product_id,
            item.quantity
          );
        }
      }

      return result.rows[0];
    },

    update: async (transactionData: any) => {
      const result = await query(
        `UPDATE transactions 
         SET user_id = $1, customer_id = $2, items = $3, total = $4, payment_method = $5, 
             status = $6, notes = $7, discount = $8, tax = $9, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $10 
         RETURNING *`,
        [
          transactionData.user_id,
          transactionData.customer_id || null,
          JSON.stringify(transactionData.items),
          transactionData.total,
          transactionData.payment_method,
          transactionData.status,
          transactionData.notes || "",
          transactionData.discount || 0,
          transactionData.tax || 0,
          transactionData.id,
        ]
      );

      return result.rows[0];
    },

    delete: async (orderId: number) => {
      await query("DELETE FROM transactions WHERE id = $1", [orderId]);
    },
  },

  // Settings
  settings: {
    get: async () => {
      const result = await query("SELECT * FROM settings LIMIT 1");
      return result.rows[0] || null;
    },

    update: async (settingsData: any) => {
      const existing = await query("SELECT id FROM settings LIMIT 1");

      if (existing.rows.length > 0) {
        const result = await query(
          `UPDATE settings 
           SET store_name = $1, store_address = $2, store_phone = $3, store_email = $4, 
               currency = $5, tax_rate = $6, receipt_footer = $7, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $8 
           RETURNING *`,
          [
            settingsData.store_name,
            settingsData.store_address,
            settingsData.store_phone,
            settingsData.store_email,
            settingsData.currency,
            settingsData.tax_rate,
            settingsData.receipt_footer,
            existing.rows[0].id,
          ]
        );
        return result.rows[0];
      } else {
        const result = await query(
          `INSERT INTO settings (store_name, store_address, store_phone, store_email, currency, tax_rate, receipt_footer) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           RETURNING *`,
          [
            settingsData.store_name,
            settingsData.store_address,
            settingsData.store_phone,
            settingsData.store_email,
            settingsData.currency,
            settingsData.tax_rate,
            settingsData.receipt_footer,
          ]
        );
        return result.rows[0];
      }
    },
  },
};
