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

const PREFERRED_THERMAL_PRINTER_NAME =
  process.env.THERMAL_PRINTER_NAME || "POS-80";

function normalizeReceiptData(input: any) {
  const rawItems = Array.isArray(input?.items) ? input.items : [];
  const items = rawItems
    .map((it: any) => {
      const quantity = Number(it?.quantity ?? it?.qty ?? 0);
      const price = Number(it?.price ?? 0);
      const total = Number(it?.total ?? price * quantity);
      return {
        name: String(it?.name ?? "").trim() || "Item",
        quantity,
        price,
        total,
      };
    })
    .filter((it: any) => it.quantity > 0);

  const subtotalFromItems = items.reduce(
    (sum: number, it: any) => sum + Number(it.total || 0),
    0
  );

  const discountAmount = Number(input?.discountAmount ?? input?.discount ?? 0);
  const tax = Number(input?.tax ?? 0);
  const taxPercentage = Number(input?.taxPercentage ?? 0);

  const subtotal = Number(input?.subtotal ?? subtotalFromItems);
  const total = Number(input?.total ?? subtotal - discountAmount + tax);
  const paid = Number(input?.paid ?? total);
  const change = Number(input?.change ?? Math.max(0, paid - total));

  return {
    invoiceNo:
      String(input?.invoiceNo ?? input?.invoice_no ?? "").trim() ||
      `INV-${Date.now()}`,
    date: String(input?.date ?? "").trim() || new Date().toLocaleString(),
    customer_name:
      String(input?.customer_name ?? input?.customerName ?? "").trim() ||
      "Walk-in Customer",
    payment_method:
      String(input?.payment_method ?? input?.paymentMethod ?? "").trim() ||
      "Cash",
    items,
    subtotal,
    tax,
    taxPercentage,
    discountAmount,
    total,
    paid,
    change,
    user: String(input?.user ?? input?.username ?? "").trim() || "Staff",
  };
}

async function resolveThermalPrinterName(
  preferredName: string = PREFERRED_THERMAL_PRINTER_NAME
): Promise<string | undefined> {
  // If we can't inspect printers yet, let Electron use the system default.
  if (!win) return undefined;

  try {
    const printers = await win.webContents.getPrintersAsync();
    if (!printers || printers.length === 0) return undefined;

    const preferred = preferredName?.trim();
    const preferredLower = preferred?.toLowerCase();

    const exact =
      preferred &&
      printers.find((p) => p.name?.toLowerCase() === preferredLower);
    if (exact?.name) {
      console.log("Resolved thermal printer (exact match):", exact.name);
      return exact.name;
    }

    const partial =
      preferred &&
      printers.find((p) => p.name?.toLowerCase().includes(preferredLower!));
    if (partial?.name) {
      console.log("Resolved thermal printer (partial match):", partial.name);
      return partial.name;
    }

    const def = printers.find((p) => p.isDefault);
    if (def?.name) {
      if (preferred) {
        console.warn(
          `Preferred thermal printer "${preferred}" not found. Falling back to default: ${def.name}`
        );
      }
      console.log("Resolved thermal printer (default):", def.name);
      return def.name;
    }

    const first = printers[0]?.name;
    if (preferred) {
      console.warn(
        `Preferred thermal printer "${preferred}" not found. Falling back to first available: ${first}`
      );
    }
    console.log("Resolved thermal printer (first available):", first);
    return first;
  } catch (error) {
    console.error("Failed to resolve thermal printer name:", error);
    return undefined;
  }
}

// Helper function for HTML-based thermal printing
async function printThermalReceipt(receiptData: any): Promise<any> {
  if (!win) {
    return { success: false, error: "No window available" };
  }

  try {
    const data = normalizeReceiptData(receiptData);

    // Validate receipt data
    console.log("=== Building HTML Receipt ===");
    console.log("Normalized receipt data:", JSON.stringify(data, null, 2));
    
    if (!data.items || data.items.length === 0) {
      console.error("ERROR: Cannot print HTML receipt - empty or invalid data!");
      return { success: false, error: "Empty or invalid receipt data" };
    }

    // HTML for 80mm thermal receipt printer
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page {
      size: 80mm 150mm;
      margin: 0;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 80mm;
      font-family: 'Courier New', monospace;
      font-size: 11px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      padding: 2mm;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .large { font-size: 13px; }
    .line { 
      border-bottom: 1px dashed #000; 
      margin: 3px 0; 
    }
    .row { 
      display: flex; 
      justify-content: space-between; 
      padding: 1px 0;
    }
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
  <div class="center">Invoice: ${data.invoiceNo}</div>
  <div class="center">${data.date}</div>
  <div class="line"></div>
  <div class="left">
    <div>Customer: ${data.customer_name}</div>
    <div>Payment: ${data.payment_method}</div>
  </div>
  <div class="line"></div>
  ${data.items
    .map(
      (item: any) => `
  <div style="margin-bottom: 5px;">
    <div class="bold">${item.name.substring(0, 24)}</div>
    <div class="row">
      <span>${item.quantity} x Rs ${Number(item.price).toFixed(2)}</span>
      <span class="bold">Rs ${Number(item.total).toFixed(2)}</span>
    </div>
  </div>`
    )
    .join("")}
  <div class="line"></div>
  <div class="row">
    <span>Subtotal:</span>
    <span>Rs ${Number(data.subtotal).toFixed(2)}</span>
  </div>
  ${
    data.taxPercentage > 0
      ? `<div class="row">
    <span>Tax (${data.taxPercentage}%):</span>
    <span>Rs ${Number(data.tax).toFixed(2)}</span>
  </div>`
      : ""
  }
  ${
    data.discountAmount > 0
      ? `<div class="row">
    <span>Discount:</span>
    <span>-Rs ${Number(data.discountAmount).toFixed(2)}</span>
  </div>`
      : ""
  }
  <div class="line"></div>
  <div class="row bold large">
    <span>TOTAL:</span>
    <span>Rs ${Number(data.total).toFixed(2)}</span>
  </div>
  <div class="row">
    <span>Paid:</span>
    <span>Rs ${Number(data.paid).toFixed(2)}</span>
  </div>
  ${
    data.change > 0
      ? `<div class="row bold">
    <span>Change:</span>
    <span>Rs ${Number(data.change).toFixed(2)}</span>
  </div>`
      : ""
  }
  <div class="line"></div>
  <div class="center">
    <div>Thank you for your business!</div>
    <div>Served by: ${data.user}</div>
    <br>
    <div>TEVTA - Creative Hands</div>
  </div>
  <br><br><br>
</body>
</html>`;

    // Show print window for debugging - set to true to see what's being printed
    const DEBUG_PRINT = false; // Set to true to debug HTML rendering
    
    const printWindow = new BrowserWindow({
      show: DEBUG_PRINT,
      width: 400,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Use base64 encoding which is more reliable for HTML content
    const base64HTML = Buffer.from(receiptHTML, 'utf-8').toString('base64');
    
    // Wait for content to fully load
    await new Promise<void>((resolve, reject) => {
      printWindow.webContents.once('did-finish-load', () => {
        console.log("Receipt HTML loaded successfully");
        resolve();
      });
      printWindow.webContents.once('did-fail-load', (_event, errorCode, errorDescription) => {
        console.error("Failed to load receipt HTML:", errorCode, errorDescription);
        reject(new Error(errorDescription));
      });
      printWindow.loadURL(`data:text/html;base64,${base64HTML}`);
    });

    // Extra wait to ensure rendering is complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    const deviceName = await resolveThermalPrinterName();
    console.log("HTML print deviceName:", deviceName);

    return new Promise((resolve) => {
      // POS-80 thermal printer: 80mm width, variable height receipt
      // Using exact driver page width (80mm = 80,000 microns)
      const options: Electron.WebContentsPrintOptions = {
        silent: false,
        printBackground: true,
        color: false,
        margins: { marginType: "none" },
        pageSize: {
          width: 80000,   // 80mm in microns - matches driver
          height: 150000, // 150mm height for receipt content
        },
      };

      if (deviceName) {
        options.deviceName = deviceName;
      }

      console.log("Printing receipt: 80mm x 150mm...");

      printWindow.webContents.print(
        options,
        (success, errorType) => {
          if (!DEBUG_PRINT) {
            printWindow.close();
          }
          if (success) {
            console.log("Print job sent successfully");
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
      const thermalPrinterName = await resolveThermalPrinterName();
      console.log("Resolved thermal printer for test:", thermalPrinterName);

      // Try ESC/POS first
      console.log("Attempting ESC/POS test print...");
      const result = await testPrintESCPOS(thermalPrinterName);
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
        const options: Electron.WebContentsPrintOptions = {
          silent: true,
          printBackground: true,
          margins: { marginType: "none" },
        };
        if (thermalPrinterName) options.deviceName = thermalPrinterName;

        printWindow.webContents.print(
          options,
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
      const thermalPrinterName = await resolveThermalPrinterName();
      const normalized = normalizeReceiptData(receiptData);

      // Try ESC/POS first
      console.log("Attempting ESC/POS receipt print...");
      const result = await printReceiptESCPOS(normalized, thermalPrinterName);
      if (result.success) {
        console.log("ESC/POS receipt print successful");
        return result;
      }

      console.log("ESC/POS failed, trying HTML fallback...");
      // Fallback to HTML if ESC/POS fails
      return await printThermalReceipt(normalized);
    } catch (error: any) {
      console.error("Print receipt error:", error);
      // Try HTML as last resort
      return await printThermalReceipt(receiptData);
    }
  });

  // Main thermal printing - uses shared function
  ipcMain.handle("print:thermal", async (_event, receiptData: any) => {
    try {
      const thermalPrinterName = await resolveThermalPrinterName();
      console.log("Resolved thermal printer:", thermalPrinterName);

      const normalized = normalizeReceiptData(receiptData);

      // Log received data for debugging
      console.log("=== Receipt Data Received ===");
      console.log("Normalized receipt data:", JSON.stringify(normalized, null, 2));
      console.log("Items count:", normalized?.items?.length || 0);
      console.log("Invoice No:", normalized?.invoiceNo);
      console.log("Customer:", normalized?.customer_name);
      
      if (!normalized.items || normalized.items.length === 0) {
        console.error("ERROR: Empty or invalid receipt data received!");
        return { success: false, error: "Empty or invalid receipt data" };
      }

      // Try ESC/POS first
      console.log("Attempting ESC/POS thermal print...");
      const result = await printReceiptESCPOS(normalized, thermalPrinterName);
      if (result.success) {
        console.log("ESC/POS thermal print successful");
        return result;
      }

      console.log("ESC/POS failed, trying HTML fallback...");
      // Fallback to HTML if ESC/POS fails
      return await printThermalReceipt(normalized);
    } catch (error: any) {
      console.error("Thermal print error:", error);
      // Try HTML as last resort
      return await printThermalReceipt(receiptData);
    }
  });

  // HTML thermal printing - uses shared function
  ipcMain.handle("print:thermal-html", async (_event, receiptData: any) => {
    return await printThermalReceipt(normalizeReceiptData(receiptData));
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
  const silentPrintHandler = async () => {
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
  };

  // Keep both channel names for compatibility with preload
  ipcMain.handle("print:silent", silentPrintHandler);
  ipcMain.handle("printer:silent", silentPrintHandler);
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
