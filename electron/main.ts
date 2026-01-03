import { app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, ChildProcess } from "node:child_process";

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
let backendProcess: ChildProcess | null = null;

function startBackendServer() {
  if (!VITE_DEV_SERVER_URL) {
    // Only start backend in production/built mode
    // In production, use app.getAppPath() and look in resources/app.asar.unpacked
    const isPackaged = app.isPackaged;
    const appPath = app.getAppPath();
    
    let serverPath: string;
    let appRoot: string;
    
    if (isPackaged) {
      // In packaged app, server is in asar.unpacked
      appRoot = path.join(path.dirname(appPath), "app.asar.unpacked");
      serverPath = path.join(appRoot, "server", "index.ts");
    } else {
      // In development build
      appRoot = path.join(process.env.APP_ROOT);
      serverPath = path.join(appRoot, "server", "index.ts");
    }
    
    console.log("Starting backend server...");
    console.log("Server path:", serverPath);
    console.log("App root:", appRoot);
    console.log("Is packaged:", isPackaged);
    
    // Use bun or node to run the server
    const runCommand = process.platform === "win32" ? "bun.exe" : "bun";
    backendProcess = spawn(runCommand, ["run", serverPath], {
      cwd: appRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    });

    backendProcess.on("error", (err) => {
      console.error("Failed to start backend server:", err);
    });

    backendProcess.on("exit", (code) => {
      console.log(`Backend server exited with code ${code}`);
    });
  }
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
  // Kill backend server when app closes
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
  
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
  startBackendServer();
  
  // Wait a moment for backend to start, then create window
  setTimeout(() => {
    createWindow();
  }, 2000);
});
