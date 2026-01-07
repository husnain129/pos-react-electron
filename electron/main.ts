import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbOperations } from "./database";
import { printReceiptESCPOS, testPrintESCPOS } from "./escpos-printer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

// Helper function for HTML-based thermal printing
async function printThermalReceipt(receiptData: any): Promise<any> {
  if (!win) {
    return { success: false, error: "No window available" };
  }

  try {
    // Simplified HTML that works better with thermal printers
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: 80mm auto;
      margin: 0mm;
    }
    @media print {
      body { margin: 0; padding: 0; }
    }
    body {
      width: 72mm;
      font-family: 'Courier New', Courier, monospace;
      font-size: 11px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      margin: 0;
      padding: 2mm;
    }
    .center { text-align: center; }
    .left { text-align: left; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .large { font-size: 14px; }
    .line { 
      border-bottom: 1px dashed #000; 
      margin: 3px 0; 
      height: 1px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    td { padding: 1px 0; }
    .item-name { width: 60%; }
    .item-price { width: 40%; text-align: right; }
  </style>
</head>
<body>
  <div class="center">
    <div class="large bold">Creative Hands</div>
    <div>By TEVTA</div>
    <div>Point of Sale System</div>
  </div>
  <div class="line"></div>
  <div class="center bold">SALES RECEIPT</div>
  <div class="center">Invoice: ${receiptData.invoiceNo}</div>
  <div class="center">${receiptData.date}</div>
  <div class="line"></div>
  <div class="left">
    <div>Customer: ${receiptData.customer_name}</div>
    <div>Payment: ${receiptData.payment_method}</div>
  </div>
  <div class="line"></div>
  <table>
    ${receiptData.items
      .map(
        (item: any) => `
      <tr>
        <td class="item-name">${item.name.substring(0, 20)}</td>
        <td class="item-price">${item.quantity} x ${Number(item.price).toFixed(
          2
        )}</td>
      </tr>
      <tr>
        <td></td>
        <td class="item-price bold">Rs ${Number(item.total).toFixed(2)}</td>
      </tr>
    `
      )
      .join("")}
  </table>
  <div class="line"></div>
  <table>
    <tr>
      <td>Subtotal:</td>
      <td class="right">Rs ${Number(receiptData.subtotal).toFixed(2)}</td>
    </tr>
    ${
      receiptData.taxPercentage > 0
        ? `<tr>
      <td>Tax (${receiptData.taxPercentage}%):</td>
      <td class="right">Rs ${Number(receiptData.tax).toFixed(2)}</td>
    </tr>`
        : ""
    }
    ${
      receiptData.discountAmount > 0
        ? `<tr>
      <td>Discount:</td>
      <td class="right">-Rs ${Number(receiptData.discountAmount).toFixed(
        2
      )}</td>
    </tr>`
        : ""
    }
  </table>
  <div class="line"></div>
  <table>
    <tr class="bold large">
      <td>TOTAL:</td>
      <td class="right">Rs ${Number(receiptData.total).toFixed(2)}</td>
    </tr>
    <tr>
      <td>Paid:</td>
      <td class="right">Rs ${Number(receiptData.paid).toFixed(2)}</td>
    </tr>
    ${
      receiptData.change > 0
        ? `<tr class="bold">
      <td>Change:</td>
      <td class="right">Rs ${Number(receiptData.change).toFixed(2)}</td>
    </tr>`
        : ""
    }
  </table>
  <div class="line"></div>
  <div class="center">
    <div>Thank you for your business!</div>
    <div>Served by: ${receiptData.user}</div>
    <br>
    <div>TEVTA - Creative Hands</div>
  </div>
  <br><br><br>
</body>
</html>`;

    const printWindow = new BrowserWindow({
      show: false, // Change to true for debugging
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`
    );

    // Give more time to render
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return new Promise((resolve) => {
      printWindow.webContents.print(
        {
          silent: false, // Show Windows print dialog
          printBackground: false,
          color: false, // thermal printers are monochrome
          margins: {
            marginType: "none",
          },
          pageSize: {
            width: 80000, // 80mm in microns
            height: 297000, // A4 length in microns (will auto-cut based on content)
          },
        },
        (success, errorType) => {
          printWindow.close();
          if (success) {
            console.log("Print successful");
            resolve({ success: true });
          } else {
            console.error("Print failed:", errorType);
            resolve({
              success: false,
              error: `Print failed: ${errorType}`,
            });
          }
        }
      );
    });
  } catch (error) {
    console.error("Thermal print error:", error);
    return { success: false, error: String(error) };
  }
}

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

  // ===== PRINTER HANDLERS =====

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

  // Printer initialize
  ipcMain.handle("printer:initialize", async () => {
    console.log("Printer initialized (HTML mode)");
    return true;
  });

  // Printer test
  ipcMain.handle("printer:test", async () => {
    try {
      // Try ESC/POS first
      console.log("Attempting ESC/POS test print...");
      const result = await testPrintESCPOS();
      if (result.success) {
        console.log("ESC/POS test print successful");
        return result;
      }

      console.log("ESC/POS failed, trying HTML fallback...");
      // Fallback to HTML if ESC/POS fails
      if (!win) {
        return { success: false, error: "No window available" };
      }

      const testHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { margin: 0; padding: 0; }
    body {
      width: 80mm;
      font-family: monospace;
      font-size: 12px;
      padding: 3mm;
      text-align: center;
    }
    .large { font-size: 16px; font-weight: bold; }
    .line { border-top: 1px dashed #000; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="large">TEST PRINT</div>
  <div>POS-80 Thermal Printer</div>
  <div>Printer is working!</div>
  <div class="line"></div>
  <div>${new Date().toLocaleString()}</div>
</body>
</html>`;

      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: { nodeIntegration: false, contextIsolation: true },
      });

      await printWindow.loadURL(
        `data:text/html;charset=utf-8,${encodeURIComponent(testHTML)}`
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
            resolve(
              success
                ? { success: true }
                : { success: false, error: `Print failed: ${errorType}` }
            );
          }
        );
      });
    } catch (error: any) {
      console.error("Printer test error:", error);
      return { success: false, error: error.message };
    }
  });

  // Print receipt - uses shared function
  ipcMain.handle("printer:print-receipt", async (_event, receiptData: any) => {
    try {
      // Try ESC/POS first
      console.log("Attempting ESC/POS receipt print...");
      const result = await printReceiptESCPOS(receiptData);
      if (result.success) {
        console.log("ESC/POS receipt print successful");
        return result;
      }

      console.log("ESC/POS failed, trying HTML fallback...");
      // Fallback to HTML if ESC/POS fails
      return await printThermalReceipt(receiptData);
    } catch (error: any) {
      console.error("Print receipt error:", error);
      // Try HTML as last resort
      return await printThermalReceipt(receiptData);
    }
  });

  // Main thermal printing - uses shared function
  ipcMain.handle("print:thermal", async (_event, receiptData: any) => {
    try {
      // Try ESC/POS first
      console.log("Attempting ESC/POS thermal print...");
      const result = await printReceiptESCPOS(receiptData);
      if (result.success) {
        console.log("ESC/POS thermal print successful");
        return result;
      }

      console.log("ESC/POS failed, trying HTML fallback...");
      // Fallback to HTML if ESC/POS fails
      return await printThermalReceipt(receiptData);
    } catch (error: any) {
      console.error("Thermal print error:", error);
      // Try HTML as last resort
      return await printThermalReceipt(receiptData);
    }
  });

  // HTML thermal printing - uses shared function
  ipcMain.handle("print:thermal-html", async (_event, receiptData: any) => {
    return await printThermalReceipt(receiptData);
  });

  // List printers
  ipcMain.handle("printer:list", async () => {
    try {
      if (!win) return { success: false, printers: [] };
      const printers = await win.webContents.getPrintersAsync();
      return { success: true, printers };
    } catch (error: any) {
      return { success: false, error: error.message };
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
  setupIPCHandlers();
  createWindow();
});
