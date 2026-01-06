import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbOperations } from "./database";

createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
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

  // Thermal printer - Direct print using Electron's built-in print
  ipcMain.handle("print:thermal", async (_event, receiptData: any) => {
    try {
      if (!win) {
        return { success: false, error: "No window available" };
      }

      // Create a hidden window for printing
      const printWindow = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
      });

      // Build the HTML receipt
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
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 80mm;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              padding: 5mm;
              background: white;
              color: black;
            }
            .center { text-align: center; }
            .left { text-align: left; }
            .bold { font-weight: bold; }
            .large { font-size: 16px; }
            .line { border-top: 1px dashed #000; margin: 5px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 2px 0; }
            .spacing { margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="large bold">Creative Hands</div>
            <div>By TEVTA</div>
            <div>Point of Sale System</div>
            <div class="spacing"></div>
            <div class="bold">SALES RECEIPT</div>
            <div>Invoice: ${receiptData.invoiceNo}</div>
            <div>${receiptData.date}</div>
          </div>
          
          <div class="line"></div>
          
          <div class="left">
            <div>Customer: ${receiptData.customer_name}</div>
            <div>Payment: ${receiptData.payment_method}</div>
          </div>
          
          <div class="spacing"></div>
          <div class="line"></div>
          
          <div class="left">
            ${receiptData.items
              .map(
                (item: any) => `
              <div class="item-row">
                <span>${item.name.substring(0, 20)}</span>
                <span>${item.quantity} x Rs ${Number(item.price).toFixed(
                  2
                )}</span>
                <span>Rs ${Number(item.total).toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="line"></div>
          
          <div class="left">
            <div class="item-row">
              <span>Subtotal:</span>
              <span>Rs ${Number(receiptData.subtotal).toFixed(2)}</span>
            </div>
            ${
              receiptData.taxPercentage > 0
                ? `
            <div class="item-row">
              <span>Tax (${receiptData.taxPercentage}%):</span>
              <span>Rs ${Number(receiptData.tax).toFixed(2)}</span>
            </div>
            `
                : ""
            }
            ${
              receiptData.discountAmount > 0
                ? `
            <div class="item-row">
              <span>Discount:</span>
              <span>-Rs ${Number(receiptData.discountAmount).toFixed(2)}</span>
            </div>
            `
                : ""
            }
            <div class="line"></div>
            <div class="item-row bold large">
              <span>TOTAL:</span>
              <span>Rs ${Number(receiptData.total).toFixed(2)}</span>
            </div>
            <div class="item-row">
              <span>Paid:</span>
              <span>Rs ${Number(receiptData.paid).toFixed(2)}</span>
            </div>
            ${
              receiptData.change > 0
                ? `
            <div class="item-row bold">
              <span>Change:</span>
              <span>Rs ${Number(receiptData.change).toFixed(2)}</span>
            </div>
            `
                : ""
            }
          </div>
          
          <div class="line"></div>
          <div class="spacing"></div>
          
          <div class="center">
            <div>Thank you for your business!</div>
            <div>Served by: ${receiptData.user}</div>
            <div class="spacing"></div>
            <div>TEVTA - Creative Hands</div>
          </div>
        </body>
        </html>
      `;

      // Load HTML content directly instead of using data URL
      await printWindow.loadURL("about:blank");
      await printWindow.webContents.executeJavaScript(
        `document.write(${JSON.stringify(receiptHTML)}); document.close();`
      );

      // Wait for rendering to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get available printers
      const printers = await printWindow.webContents.getPrintersAsync();
      console.log("Available printers:", printers);

      // Try to find POS-80 printer
      const posPrinter = printers.find(
        (p) =>
          p.name.includes("POS-80") ||
          p.name.includes("POS") ||
          p.displayName.includes("POS-80")
      );

      const printerName =
        posPrinter?.name || printers.find((p) => p.isDefault)?.name || "";

      console.log("Using printer:", printerName);

      return new Promise((resolve) => {
        printWindow.webContents.print(
          {
            silent: true,
            printBackground: true,
            deviceName: printerName,
            margins: {
              marginType: "none",
            },
            pageSize: {
              width: 80000, // 80mm in microns
              height: 297000, // A4 height in microns (auto-adjust)
            },
          },
          (success, errorType) => {
            printWindow.close();
            if (success) {
              resolve({ success: true });
            } else {
              resolve({
                success: false,
                error: `Print failed: ${errorType}. Make sure POS-80 printer is connected and set as default.`,
              });
            }
          }
        );
      });
    } catch (error) {
      console.error("Thermal print error:", error);
      return { success: false, error: String(error) };
    }
  });

  // Silent printing for thermal receipts (fallback)
  ipcMain.handle("print:silent", async () => {
    if (!win) return { success: false, error: "No window available" };

    try {
      await win.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: "", // Empty string uses default printer
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

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  setupIPCHandlers();
  createWindow();
});
