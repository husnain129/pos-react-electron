# Thermal Printing Guide (Windows)

✅ Goal: Remove deprecated `printer@0.4.0`, avoid native node-gyp pain, and ensure reliable thermal printing (no blank pages).

---

## 1) Fixed npm install strategy

- Removed `printer` and `@types/printer` from `package.json` because they are legacy, require node-gyp, and break installs on modern Node/Electron.
- Preferred approaches now:
  - HTML-based printing via Electron's `webContents.print()` (works reliably on Windows printers/drivers and avoids native builds).
  - Network ESC/POS using `node-thermal-printer` (TCP mode) for printers that accept raw TCP (port 9100). This avoids USB native packages and is prebuilt.

How to configure network ESC/POS (optional):
- Set environment variables in packaged app or dev env:
  - `THERMAL_PRINTER_HOST=192.168.1.100` (printer IP)
  - `THERMAL_PRINTER_PORT=9100` (optional, default 9100)
- The app will attempt `node-thermal-printer` TCP printing if `THERMAL_PRINTER_HOST` is set.

If you need USB serial printing on Windows, it may require `serialport` or `usb` native modules — treat those as opt-in with prebuilt binaries.

---

## 2) Electron print flow (fixed)

Main improvements made in `electron/main.ts`:

- Wait for `did-finish-load` before printing (ensures layout complete).
- Verify there is printable text to avoid blank pages (checks `document.body.innerText.length`).
- Select `deviceName` safely (use `receiptData.deviceName` if supplied, else pick default printer from `getPrintersAsync()`).
- Use conservative print options:
  - `printBackground: false` (thermal printers are monochrome)
  - `margins: { marginType: 'none' }`
  - `silent` is configurable via `receiptData.silent`.
- If ESC/POS network printing is configured (env var), the app will try that first (`node-thermal-printer`) and fall back to HTML printing.

Example (core):
- `ipcMain.handle('print:thermal', ...)` now uses `printReceiptESCPOS()` (if configured) and otherwise `printThermalReceipt()` which loads a minimal `data:` URL and prints after verifying content.

---

## 3) Why blank pages happened and how it's fixed

Common causes of blank pages:
- Calling `webContents.print()` before the window finished rendering (race). Fixed by waiting for `did-finish-load` and verifying content.
- CSS rules hiding the printable area for media=print or using display hacks that hide content at print time. Fixed by providing a minimal, `@page`-aware HTML/CSS and explicit `.thermal-receipt` / `.thermal-58` classes that are visible in print media.
- Incorrect `deviceName` or silent printing to a driver that expects different input format. Fixed by selecting the default printer if none provided and trying network ESC/POS when available.

---

## 4) POSPage / CSS for thermal printers

Files updated:
- `src/index.css` — added a `.thermal-58` variant and improved print rules (80mm default, 58mm override).
- `src/pages/POSPage.tsx` — remains the renderer; it calls `window.printer.printReceipt()` which uses the IPC handlers described above.

CSS tips (already added):
- Use `monospace` fonts, fixed width (`width: 72mm` for 80mm paper, `width: 58mm` for 58mm paper).
- Avoid complex flex layouts for the printable content; keep HTML minimal.
- Use print media queries and `visibility` to hide non-print UI elements and ensure the receipt block is visible.

Example usage in markup (already in the app):
- For 80mm: `<div class="thermal-receipt">…</div>`
- For 58mm: `<div class="thermal-58">…</div>`

---

## 5) Node-thermal-printer example (network mode)

- Set `THERMAL_PRINTER_HOST` (and optional port), then printing will use `node-thermal-printer` TCP mode:

```js
// env: THERMAL_PRINTER_HOST and optional THERMAL_PRINTER_PORT
// prints via node-thermal-printer (see code in electron/escpos-printer.ts)
```

Notes:
- This is ideal for Ethernet/Wi-Fi printers with raw/TCP (port 9100).
- For USB/Serial, you will need additional native drivers (not covered here).

---

## 6) How to test locally (Windows)

1. Remove the old node_modules and lockfile if previously failing due to `printer`:
   - rm -rf node_modules package-lock.json
2. Run `npm install` (should succeed without `printer` native installs).
3. Start the app and use the **Check Printers** and **Test Print** buttons in the POS UI to validate available printers and a sample print.
4. If using network ESC/POS, set `THERMAL_PRINTER_HOST` in your environment and run the Test Print.

---

## 7) Production notes

- The changes avoid deprecated native modules, so packaging with `electron-builder` is simpler and more reliable.
- If you need raw USB printing, vendor-specific drivers or prebuilt native modules may still be necessary; prefer network printers when possible for reliability.

---

If you'd like, I can also:
- Add a short test script for running a sample print from CLI (TCP) using `node-thermal-printer`.
- Add an optional settings UI to store `printerName` or `printerHost` for easier config.

