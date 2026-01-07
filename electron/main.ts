import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbOperations } from "./database";
import { printerService } from "./printerService";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

// Setup IPC handlers for database operations
function setupIPCHandlers() {
  // Users
  ipcMain.handle(
    "users:login",
    async (_event, username: string, password: string) => {
      return await dbOperations.users.login(username, password);
    }
  );

  ipcMain.handle("users:logout", async (_event, userId: number) => {
    return await dbOperations.users.logout(userId);
  });

  ipcMain.handle("users:getAll", async () => {
    return await dbOperations.users.getAll();
  });

  ipcMain.handle("users:getById", async (_event, userId: number) => {
    return await dbOperations.users.getById(userId);
  });

  ipcMain.handle("users:create", async (_event, userData: any) => {
    return await dbOperations.users.create(userData);
  });

  ipcMain.handle("users:update", async (_event, userData: any) => {
    return await dbOperations.users.update(userData);
  });

  ipcMain.handle("users:delete", async (_event, userId: number) => {
    return await dbOperations.users.delete(userId);
  });

  // Inventory
  ipcMain.handle("inventory:getAll", async () => {
    return await dbOperations.inventory.getAll();
  });

  ipcMain.handle("inventory:getById", async (_event, productId: number) => {
    return await dbOperations.inventory.getById(productId);
  });

  ipcMain.handle("inventory:getBySKU", async (_event, skuCode: string) => {
    return await dbOperations.inventory.getBySKU(skuCode);
  });

  ipcMain.handle("inventory:create", async (_event, productData: any) => {
    return await dbOperations.inventory.create(productData);
  });

  ipcMain.handle("inventory:update", async (_event, productData: any) => {
    return await dbOperations.inventory.update(productData);
  });

  ipcMain.handle("inventory:delete", async (_event, productId: number) => {
    return await dbOperations.inventory.delete(productId);
  });

  // Categories
  ipcMain.handle("categories:getAll", async () => {
    return await dbOperations.categories.getAll();
  });

  ipcMain.handle("categories:create", async (_event, categoryData: any) => {
    return await dbOperations.categories.create(categoryData);
  });

  ipcMain.handle("categories:update", async (_event, categoryData: any) => {
    return await dbOperations.categories.update(categoryData);
  });

  ipcMain.handle("categories:delete", async (_event, categoryId: number) => {
    return await dbOperations.categories.delete(categoryId);
  });

  // Institutes
  ipcMain.handle("institutes:getAll", async () => {
    return await dbOperations.institutes.getAll();
  });

  ipcMain.handle("institutes:getById", async (_event, id: number) => {
    return await dbOperations.institutes.getById(id);
  });

  ipcMain.handle("institutes:create", async (_event, data: any) => {
    return await dbOperations.institutes.create(data);
  });

  ipcMain.handle("institutes:update", async (_event, data: any) => {
    return await dbOperations.institutes.update(data);
  });

  ipcMain.handle("institutes:delete", async (_event, id: number) => {
    return await dbOperations.institutes.delete(id);
  });

  // Customers
  ipcMain.handle("customers:getAll", async () => {
    return await dbOperations.customers.getAll();
  });

  ipcMain.handle("customers:getById", async (_event, customerId: number) => {
    return await dbOperations.customers.getById(customerId);
  });

  ipcMain.handle("customers:create", async (_event, customerData: any) => {
    return await dbOperations.customers.create(customerData);
  });

  ipcMain.handle("customers:update", async (_event, customerData: any) => {
    return await dbOperations.customers.update(customerData);
  });

  ipcMain.handle("customers:delete", async (_event, customerId: number) => {
    return await dbOperations.customers.delete(customerId);
  });

  // Transactions
  ipcMain.handle("transactions:getAll", async () => {
    return await dbOperations.transactions.getAll();
  });

  ipcMain.handle(
    "transactions:getById",
    async (_event, transactionId: number) => {
      return await dbOperations.transactions.getById(transactionId);
    }
  );

  ipcMain.handle(
    "transactions:getByDate",
    async (
      _event,
      start: string,
      end: string,
      status: number,
      user?: number
    ) => {
      return await dbOperations.transactions.getByDate(
        start,
        end,
        status,
        user
      );
    }
  );

  ipcMain.handle("transactions:getOnHold", async () => {
    return await dbOperations.transactions.getOnHold();
  });

  ipcMain.handle("transactions:getCustomerOrders", async () => {
    return await dbOperations.transactions.getCustomerOrders();
  });

  ipcMain.handle(
    "transactions:create",
    async (_event, transactionData: any) => {
      return await dbOperations.transactions.create(transactionData);
    }
  );

  ipcMain.handle(
    "transactions:update",
    async (_event, transactionData: any) => {
      return await dbOperations.transactions.update(transactionData);
    }
  );

  ipcMain.handle("transactions:delete", async (_event, orderId: number) => {
    return await dbOperations.transactions.delete(orderId);
  });

  // Settings
  ipcMain.handle("settings:get", async () => {
    return await dbOperations.settings.get();
  });

  ipcMain.handle("settings:update", async (_event, settingsData: any) => {
    return await dbOperations.settings.update(settingsData);
  });

  // Get list of available printers
  ipcMain.handle("print:listPrinters", async () => {
    try {
      if (!win) return { success: false, printers: [] };
      const printers = await win.webContents.getPrintersAsync();
      console.log("Available printers:", printers);
      return {
        success: true,
        printers: printers.map((p) => ({
          name: p.name,
          displayName: p.displayName,
          description: p.description,
          status: p.status,
          isDefault: p.isDefault,
        })),
      };
    } catch (error) {
      console.error("Error listing printers:", error);
      return { success: false, printers: [], error: String(error) };
    }
  });

  // ===== PRINTER HANDLERS =====
  // Printer initialize handler
  ipcMain.handle("printer:initialize", async () => {
    try {
      return printerService.initialize();
    } catch (error: any) {
      console.error("Printer initialization error:", error);
      return false;
    }
  });

  // Printer test handler
  ipcMain.handle("printer:test", async () => {
    try {
      await printerService.testPrint();
      return { success: true };
    } catch (error: any) {
      console.error("Printer test error:", error);
      return { success: false, error: error.message };
    }
  });

  // Print receipt using ESC/POS
  ipcMain.handle("printer:print-receipt", async (_event, receiptData: any) => {
    try {
      await printerService.printReceipt(receiptData);
      return { success: true };
    } catch (error: any) {
      console.error("Print receipt error:", error);
      return { success: false, error: error.message };
    }
  });

  // List all system printers
  ipcMain.handle("printer:list", async () => {
    try {
      const printers = printerService.listPrinters();
      return { success: true, printers };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  // Main thermal printing handler using ESC/POS
  ipcMain.handle("print:thermal", async (_event, receiptData: any) => {
    try {
      await printerService.printReceipt(receiptData);
      return { success: true };
    } catch (error: any) {
      console.error("Thermal print error:", error);
      return { success: false, error: error.message };
    }
  });

  // Fallback HTML-based thermal printing
  ipcMain.handle("print:thermal-html", async (_event, receiptData: any) => {
    if (!win) {
      return { success: false, error: "No window available" };
    }

    try {
      const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 80mm;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
      padding: 3mm;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .large { font-size: 16px; }
    .line { border-top: 1px dashed #000; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .mb { margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="center">
    <div class="large bold">Creative Hands</div>
    <div>By TEVTA</div>
    <div>Point of Sale System</div>
    <div class="mb"></div>
    <div class="bold">SALES RECEIPT</div>
    <div>Invoice: ${receiptData.invoiceNo}</div>
    <div>${receiptData.date}</div>
  </div>
  <div class="line"></div>
  <div>Customer: ${receiptData.customer_name}</div>
  <div>Payment: ${receiptData.payment_method}</div>
  <div class="line"></div>
  ${receiptData.items
    .map(
      (item: any) => `
    <div class="row">
      <span>${item.name.substring(0, 20)}</span>
      <span>${item.quantity} x Rs${Number(item.price).toFixed(2)}</span>
    </div>
    <div class="row">
      <span></span>
      <span class="bold">Rs ${Number(item.total).toFixed(2)}</span>
    </div>
  `
    )
    .join("")}
  <div class="line"></div>
  <div class="row"><span>Subtotal:</span><span>Rs ${Number(
    receiptData.subtotal
  ).toFixed(2)}</span></div>
  ${
    receiptData.taxPercentage > 0
      ? `
    <div class="row"><span>Tax (${
      receiptData.taxPercentage
    }%):</span><span>Rs ${Number(receiptData.tax).toFixed(2)}</span></div>
  `
      : ""
  }
  ${
    receiptData.discountAmount > 0
      ? `
    <div class="row"><span>Discount:</span><span>-Rs ${Number(
      receiptData.discountAmount
    ).toFixed(2)}</span></div>
  `
      : ""
  }
  <div class="line"></div>
  <div class="row bold large"><span>TOTAL:</span><span>Rs ${Number(
    receiptData.total
  ).toFixed(2)}</span></div>
  <div class="row"><span>Paid:</span><span>Rs ${Number(
    receiptData.paid
  ).toFixed(2)}</span></div>
  ${
    receiptData.change > 0
      ? `
    <div class="row bold"><span>Change:</span><span>Rs ${Number(
      receiptData.change
    ).toFixed(2)}</span></div>
  `
      : ""
  }
  <div class="line"></div>
  <div class="center mb">
    <div>Thank you for your business!</div>
    <div>Served by: ${receiptData.user}</div>
    <div class="mb"></div>
    <div>TEVTA - Creative Hands</div>
  </div>
</body>
</html>`;

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`
      );

      await new Promise((resolve) => setTimeout(resolve, 500));

      return new Promise((resolve) => {
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: "POS-80",
            margins: { marginType: "none" },
          },
          (success, errorType) => {
            printWindow.close();
            if (success) {
              resolve({ success: true });
            } else {
              resolve({
                success: false,
                error: `Print failed: ${errorType}`,
              });
            }
          }
        );
      });
    } catch (error) {
      console.error("HTML thermal print error:", error);
      return { success: false, error: String(error) };
    }
  });

  // Silent printing
  ipcMain.handle("print:silent", async () => {
    if (!win) return { success: false, error: "No window available" };

    try {
      await win.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: "",
      });
      return { success: true };
    } catch (error) {
      console.error("Print error:", error);
      return { success: false, error: String(error) };
    }
  });
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
    width: 1024,
    height: 728,
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  // Setup all IPC handlers (includes printer handlers now)
  setupIPCHandlers();

  // Initialize printer service
  printerService.initialize();

  createWindow();
});
