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
}

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },

    fullscreen: true,
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
