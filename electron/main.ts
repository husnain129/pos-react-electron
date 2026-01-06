import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbOperations } from "./database";

const require = createRequire(import.meta.url);
const escpos = require("escpos");
const USB = require("usb");
escpos.USB = require("escpos-usb");
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

  // Thermal printer - Direct ESC/POS printing via USB
  ipcMain.handle("print:thermal", async (_event, receiptData: any) => {
    try {
      return new Promise((resolve) => {
        try {
          // Find USB devices using the usb library directly
          const usbDevices = USB.getDeviceList();
          console.log(`Found ${usbDevices.length} USB devices`);

          // Find printer devices (common printer class: 7)
          const printerDevices = usbDevices.filter((device: any) => {
            try {
              device.open();
              const interfaces = device.interfaces || [];
              device.close();
              return interfaces.some(
                (iface: any) =>
                  iface.descriptor && iface.descriptor.bInterfaceClass === 7
              );
            } catch (e) {
              return false;
            }
          });

          if (printerDevices.length === 0) {
            resolve({
              success: false,
              error:
                "No USB thermal printer found. Make sure POS-80 is connected via USB and powered on.",
            });
            return;
          }

          console.log(`Found ${printerDevices.length} USB printer(s)`);

          // Get the first printer
          const printerDevice = printerDevices[0];
          const vendorId = printerDevice.deviceDescriptor.idVendor;
          const productId = printerDevice.deviceDescriptor.idProduct;

          console.log(
            `Using printer with VendorID: ${vendorId}, ProductID: ${productId}`
          );

          // Create device and printer
          const device = new escpos.USB(vendorId, productId);
          const printer = new escpos.Printer(device, { encoding: "CP437" });

          device.open((error: any) => {
            if (error) {
              console.error("Error opening printer device:", error);
              resolve({
                success: false,
                error: `Failed to open printer: ${
                  error.message || String(error)
                }. Make sure POS-80 is not being used by another program.`,
              });
              return;
            }

            try {
              // Print header
              printer
                .font("a")
                .align("ct")
                .style("bu")
                .size(1, 1)
                .text("Creative Hands")
                .style("normal")
                .text("By TEVTA")
                .text("Point of Sale System")
                .text("")
                .style("b")
                .text("SALES RECEIPT")
                .style("normal")
                .text(`Invoice: ${receiptData.invoiceNo}`)
                .text(receiptData.date)
                .drawLine();

              // Customer info
              printer
                .align("lt")
                .text(`Customer: ${receiptData.customer_name}`)
                .text(`Payment: ${receiptData.payment_method}`)
                .text("");

              // Items header
              printer.text("Item                  Qty    Total").drawLine();

              // Print items
              for (const item of receiptData.items) {
                const name = item.name.substring(0, 20).padEnd(20);
                const qty = String(item.quantity).padStart(3);
                const total = `Rs ${Number(item.total).toFixed(2)}`.padStart(
                  10
                );
                printer.text(`${name} ${qty} ${total}`);
                printer.text(`  Rs ${Number(item.price).toFixed(2)} each`);
              }

              printer.drawLine();

              // Totals
              printer.text(
                `Subtotal:     Rs ${Number(receiptData.subtotal).toFixed(2)}`
              );

              if (receiptData.taxPercentage > 0) {
                printer.text(
                  `Tax (${receiptData.taxPercentage}%):       Rs ${Number(
                    receiptData.tax
                  ).toFixed(2)}`
                );
              }

              if (receiptData.discountAmount > 0) {
                printer.text(
                  `Discount:    -Rs ${Number(
                    receiptData.discountAmount
                  ).toFixed(2)}`
                );
              }

              printer
                .style("b")
                .size(1, 1)
                .text(
                  `TOTAL:        Rs ${Number(receiptData.total).toFixed(2)}`
                )
                .style("normal")
                .size(0, 0)
                .text(
                  `Paid:         Rs ${Number(receiptData.paid).toFixed(2)}`
                );

              if (receiptData.change > 0) {
                printer
                  .style("b")
                  .text(
                    `Change:       Rs ${Number(receiptData.change).toFixed(2)}`
                  )
                  .style("normal");
              }

              printer.drawLine();

              // Footer
              printer
                .align("ct")
                .text("")
                .text("Thank you for your business!")
                .text(`Served by: ${receiptData.user}`)
                .text("")
                .text("TEVTA - Creative Hands")
                .text("")
                .text("")
                .cut()
                .close(() => {
                  resolve({ success: true });
                });
            } catch (printError) {
              console.error("Error during printing:", printError);
              try {
                printer.close();
              } catch (e) {
                // Ignore close errors
              }
              resolve({
                success: false,
                error: `Print error: ${String(printError)}`,
              });
            }
          });
        } catch (deviceError) {
          console.error("Error creating printer device:", deviceError);
          resolve({
            success: false,
            error: `Device error: ${String(
              deviceError
            )}. Make sure POS-80 is connected and drivers are installed.`,
          });
        }
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
