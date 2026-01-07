import ThermalPrinter from "node-thermal-printer";
import { exec } from "child_process";
import { existsSync, readdirSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { nativeImage } from "electron";

let printer: ThermalPrinter.printer | null = null;
let useFallback = false;

interface PrintReceiptData {
  invoiceNo: string;
  date: string;
  customer_name: string;
  payment_method: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  discountAmount: number;
  total: number;
  paid: number;
  change: number;
  user: string;
}

// ESC/POS Commands for raw printing
const ESC = "\x1B";
const GS = "\x1D";
const INIT = ESC + "@";
const BOLD_ON = ESC + "E\x01";
const BOLD_OFF = ESC + "E\x00";
const ALIGN_LEFT = ESC + "a\x00";
const ALIGN_CENTER = ESC + "a\x01";
const SIZE_NORMAL = GS + "!\x00";
const SIZE_DOUBLE = GS + "!\x11";
const SIZE_DOUBLE_HEIGHT = GS + "!\x01";
const CUT = GS + "V\x00";
const NEWLINE = "\n";

function padLine(left: string, right: string, width: number = 42): string {
  const padding = width - left.length - right.length;
  return left + " ".repeat(Math.max(0, padding)) + right;
}

function resolveAssetPath(
  exactName: string,
  distPrefix: string
): string | null {
  const appRoot = process.env.APP_ROOT || process.cwd();

  const directCandidates = [
    join(appRoot, "src", "assets", exactName),
    join(appRoot, "public", exactName),
  ];

  for (const p of directCandidates) {
    if (existsSync(p)) return p;
  }

  const distAssetsDir = join(appRoot, "dist", "assets");
  if (existsSync(distAssetsDir)) {
    try {
      const files = readdirSync(distAssetsDir);
      const lower = exactName.toLowerCase();
      const exact = files.find((f) => f.toLowerCase() === lower);
      if (exact) return join(distAssetsDir, exact);

      const prefix = distPrefix.toLowerCase();
      const hashed = files.find((f) => f.toLowerCase().startsWith(prefix));
      if (hashed) return join(distAssetsDir, hashed);
    } catch {
      // ignore
    }
  }

  return null;
}

function escposRasterImageFromPath(
  imagePath: string,
  maxWidthPx: number = 576
): string {
  const img = nativeImage.createFromPath(imagePath);
  if (img.isEmpty()) throw new Error(`Failed to load image: ${imagePath}`);

  // Resize down if needed, keep aspect ratio
  const original = img.getSize();
  const targetWidth = Math.min(maxWidthPx, original.width);
  const scaled =
    targetWidth !== original.width ? img.resize({ width: targetWidth }) : img;

  const { width, height } = scaled.getSize();
  const rgba = scaled.toBitmap(); // BGRA on Windows

  const bytesPerRow = Math.ceil(width / 8);
  const xL = bytesPerRow & 0xff;
  const xH = (bytesPerRow >> 8) & 0xff;
  const yL = height & 0xff;
  const yH = (height >> 8) & 0xff;

  const out: number[] = [];
  // GS v 0 m xL xH yL yH
  out.push(0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH);

  for (let y = 0; y < height; y++) {
    for (let xb = 0; xb < bytesPerRow; xb++) {
      let b = 0;
      for (let bit = 0; bit < 8; bit++) {
        const x = xb * 8 + bit;
        if (x >= width) continue;
        const idx = (y * width + x) * 4;
        const blue = rgba[idx];
        const green = rgba[idx + 1];
        const red = rgba[idx + 2];
        const lum = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        const isBlack = lum < 180;
        if (isBlack) b |= 0x80 >> bit;
      }
      out.push(b);
    }
  }

  return Buffer.from(out).toString("binary");
}

// Build raw ESC/POS receipt data
function buildRawReceiptData(data: PrintReceiptData): string {
  let receipt = "";

  receipt += INIT;

  // Print logo image from assets (logo.png)
  try {
    const logoPath = resolveAssetPath("logo.png", "logo-");
    if (logoPath) {
      receipt += ALIGN_CENTER;
      // 50% size: print at half-width on 80mm paper
      receipt += escposRasterImageFromPath(logoPath, 288);
      receipt += NEWLINE;
    } else {
      console.warn("Logo not found: src/assets/logo.png");
    }
  } catch (e) {
    console.warn("Failed to print logo image:", e);
  }

  receipt += ALIGN_CENTER;
  receipt += SIZE_DOUBLE;
  receipt += BOLD_ON;
  // "Logo" header (text-based). Printing bitmap logos requires a graphics pipeline
  // which is not reliable on your current Windows driver path.
  receipt += "Creative Hands" + NEWLINE;
  receipt += BOLD_OFF;
  receipt += SIZE_NORMAL;
  receipt += "By TEVTA" + NEWLINE;
  receipt += "Point of Sale System" + NEWLINE;
  receipt += NEWLINE;

  receipt += BOLD_ON;
  receipt += "SALES RECEIPT" + NEWLINE;
  receipt += BOLD_OFF;
  receipt += "Invoice: " + data.invoiceNo + NEWLINE;
  receipt += data.date + NEWLINE;

  receipt += "------------------------------------------" + NEWLINE;

  receipt += ALIGN_LEFT;
  receipt += "Customer: " + data.customer_name + NEWLINE;
  receipt += "Payment: " + data.payment_method + NEWLINE;
  receipt += "------------------------------------------" + NEWLINE;

  for (const item of data.items) {
    receipt += item.name.substring(0, 42) + NEWLINE;
    const qtyLine = `  ${item.quantity} x Rs${item.price.toFixed(2)}`;
    const totalStr = `Rs ${item.total.toFixed(2)}`;
    receipt += padLine(qtyLine, totalStr) + NEWLINE;
  }

  receipt += "------------------------------------------" + NEWLINE;

  receipt += padLine("Subtotal:", `Rs ${data.subtotal.toFixed(2)}`) + NEWLINE;

  if (data.taxPercentage > 0) {
    receipt += padLine(`Tax (${data.taxPercentage}%):`, `Rs ${data.tax.toFixed(2)}`) + NEWLINE;
  }

  if (data.discountAmount > 0) {
    receipt += padLine("Discount:", `-Rs ${data.discountAmount.toFixed(2)}`) + NEWLINE;
  }

  receipt += "------------------------------------------" + NEWLINE;

  receipt += BOLD_ON;
  receipt += SIZE_DOUBLE_HEIGHT;
  receipt += padLine("TOTAL:", `Rs ${data.total.toFixed(2)}`, 21) + NEWLINE;
  receipt += SIZE_NORMAL;
  receipt += BOLD_OFF;

  receipt += padLine("Paid:", `Rs ${data.paid.toFixed(2)}`) + NEWLINE;

  if (data.change > 0) {
    receipt += BOLD_ON;
    receipt += padLine("Change:", `Rs ${data.change.toFixed(2)}`) + NEWLINE;
    receipt += BOLD_OFF;
  }

  receipt += "------------------------------------------" + NEWLINE;

  receipt += ALIGN_CENTER;
  receipt += "Thank you for your business!" + NEWLINE;
  receipt += "Served by: " + data.user + NEWLINE;
  receipt += NEWLINE;
  receipt += "TEVTA - Creative Hands" + NEWLINE;
  receipt += NEWLINE;

  // Print QR image from assets (qr.jpeg) instead of generated QR
  try {
    const qrPath = resolveAssetPath("qr.jpeg", "qr-");
    if (qrPath) {
      receipt += ALIGN_CENTER;
      receipt += "Scan for online shopping" + NEWLINE;
      receipt += escposRasterImageFromPath(qrPath, 320);
      receipt += NEWLINE;
      // Add extra feed after barcode/QR so it doesn't cut too close
      receipt += NEWLINE;
      receipt += NEWLINE;
      receipt += NEWLINE;
    } else {
      console.warn("QR not found: src/assets/qr.jpeg");
    }
  } catch (e) {
    console.warn("Failed to print QR image:", e);
  }

  receipt += NEWLINE;
  receipt += NEWLINE;

  receipt += CUT;

  return receipt;
}

// Print using Windows - try multiple methods for raw ESC/POS printing
async function printRawToWindows(data: string, printerName: string): Promise<boolean> {
  // Create temp file with raw ESC/POS data
  const tempFile = join(tmpdir(), `receipt_${Date.now()}.bin`);
  
  try {
    // Write as binary buffer to preserve ESC/POS control codes
    const buffer = Buffer.from(data, 'binary');
    writeFileSync(tempFile, buffer);

    console.log("Temp file created:", tempFile);
    console.log("Data length:", buffer.length, "bytes");

    // Method 1: Try copy to printer share (requires shared printer)
    const shareResult = await tryPrintMethod(
      `copy /b "${tempFile}" "\\\\localhost\\${printerName}"`,
      "printer share"
    );
    if (shareResult) {
      cleanup(tempFile);
      return true;
    }

    // Method 2: Try PowerShell raw printing
    const psCmd = `powershell -Command "Get-Content -Path '${tempFile}' -Encoding Byte -Raw | Out-Printer -Name '${printerName}'"`;
    const psResult = await tryPrintMethod(psCmd, "PowerShell Out-Printer");
    if (psResult) {
      cleanup(tempFile);
      return true;
    }

    // Method 3: Try using Windows print command with /d flag
    const printResult = await tryPrintMethod(
      `print /d:"${printerName}" "${tempFile}"`,
      "Windows print"
    );
    if (printResult) {
      cleanup(tempFile);
      return true;
    }

    console.error("All Windows print methods failed");
    cleanup(tempFile);
    return false;
  } catch (error) {
    console.error("Failed to print via Windows:", error);
    cleanup(tempFile);
    return false;
  }
}

function tryPrintMethod(cmd: string, methodName: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`Trying ${methodName}: ${cmd}`);
    exec(cmd, { encoding: 'utf8', shell: 'cmd.exe', timeout: 10000 }, (error, stdout, stderr) => {
      if (error) {
        console.log(`${methodName} failed:`, error.message);
        if (stderr) console.log(`stderr: ${stderr}`);
        resolve(false);
      } else {
        console.log(`${methodName} succeeded:`, stdout || "(no output)");
        resolve(true);
      }
    });
  });
}

function cleanup(filePath: string) {
  setTimeout(() => {
    try {
      unlinkSync(filePath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }, 3000);
}

export async function initializePrinter(printerName: string = "POS-80"): Promise<boolean> {
  try {
    // Try node-thermal-printer first
    printer = new ThermalPrinter.printer({
      type: ThermalPrinter.types.EPSON,
      interface: `printer:${printerName}`,
      removeSpecialCharacters: false,
      lineCharacter: "-",
      options: {
        timeout: 5000,
      },
    });

    const isConnected = await printer.isPrinterConnected();
    console.log(`Thermal printer ${printerName} connected:`, isConnected);
    
    if (!isConnected) {
      console.log("Will use Windows raw printing fallback");
      useFallback = true;
    }
    
    return true; // Return true to allow fallback
  } catch (error) {
    console.error("Failed to initialize thermal printer:", error);
    console.log("Will use Windows raw printing fallback");
    useFallback = true;
    return true; // Return true to allow fallback
  }
}

export async function printReceiptESCPOS(
  data: PrintReceiptData,
  printerName: string = "POS-80"
): Promise<any> {
  try {
    console.log("=== Building ESC/POS Receipt ===");
    console.log("Target printer:", printerName);
    console.log("Data received:", {
      invoiceNo: data?.invoiceNo,
      itemsCount: data?.items?.length || 0,
      customer: data?.customer_name,
      total: data?.total,
    });

    if (!data || !data.items || data.items.length === 0) {
      console.error("ERROR: Cannot build receipt - empty or invalid data!");
      return { success: false, error: "Empty or invalid receipt data" };
    }

    // Initialize printer if not already done
    if (!printer && !useFallback) {
      await initializePrinter(printerName);
    }

    // Try Windows raw printing (most reliable for Windows thermal printers)
    console.log("Using Windows raw printing...");
    const rawData = buildRawReceiptData(data);
    const success = await printRawToWindows(rawData, printerName);
    
    if (success) {
      console.log("Windows raw print successful");
      return { success: true };
    }

    // Fallback to node-thermal-printer if Windows raw printing fails
    if (printer && !useFallback) {
      console.log("Trying node-thermal-printer...");
      printer.clear();

      printer.alignCenter();
      printer.setTextDoubleHeight();
      printer.bold(true);
      printer.println("Creative Hands");
      printer.bold(false);
      printer.setTextNormal();
      printer.println("By TEVTA");
      printer.println("Point of Sale System");
      printer.newLine();

      printer.bold(true);
      printer.println("SALES RECEIPT");
      printer.bold(false);
      printer.println(`Invoice: ${data.invoiceNo}`);
      printer.println(data.date);

      printer.drawLine();

      printer.alignLeft();
      printer.println(`Customer: ${data.customer_name}`);
      printer.println(`Payment: ${data.payment_method}`);
      printer.drawLine();

      for (const item of data.items) {
        printer.println(item.name.substring(0, 32));
        printer.leftRight(
          `  ${item.quantity} x Rs${item.price.toFixed(2)}`,
          `Rs ${item.total.toFixed(2)}`
        );
      }

      printer.drawLine();
      printer.leftRight("Subtotal:", `Rs ${data.subtotal.toFixed(2)}`);

      if (data.taxPercentage > 0) {
        printer.leftRight(`Tax (${data.taxPercentage}%):`, `Rs ${data.tax.toFixed(2)}`);
      }

      if (data.discountAmount > 0) {
        printer.leftRight("Discount:", `-Rs ${data.discountAmount.toFixed(2)}`);
      }

      printer.drawLine();

      printer.bold(true);
      printer.setTextDoubleHeight();
      printer.leftRight("TOTAL:", `Rs ${data.total.toFixed(2)}`);
      printer.setTextNormal();
      printer.bold(false);

      printer.leftRight("Paid:", `Rs ${data.paid.toFixed(2)}`);

      if (data.change > 0) {
        printer.bold(true);
        printer.leftRight("Change:", `Rs ${data.change.toFixed(2)}`);
        printer.bold(false);
      }

      printer.drawLine();

      printer.alignCenter();
      printer.println("Thank you for your business!");
      printer.println(`Served by: ${data.user}`);
      printer.newLine();
      printer.println("TEVTA - Creative Hands");
      printer.newLine();
      printer.newLine();

      printer.cut();

      const result = await printer.execute();
      console.log("node-thermal-printer result:", result);
      return { success: true };
    }

    return { success: false, error: "All printing methods failed" };
  } catch (error) {
    console.error("Print failed:", error);
    return { success: false, error: String(error) };
  }
}

export async function testPrintESCPOS(printerName: string = "POS-80"): Promise<any> {
  try {
    console.log("=== Test Print ===");
    console.log("Target printer:", printerName);

    // Build test print data
    let testData = INIT;
    testData += ALIGN_CENTER;
    testData += SIZE_DOUBLE;
    testData += BOLD_ON;
    testData += "TEST PRINT" + NEWLINE;
    testData += BOLD_OFF;
    testData += SIZE_NORMAL;
    testData += "POS-80 Thermal Printer" + NEWLINE;
    testData += "Printer is working!" + NEWLINE;
    testData += NEWLINE;
    testData += new Date().toLocaleString() + NEWLINE;
    testData += "------------------------------------------" + NEWLINE;
    testData += NEWLINE;
    testData += NEWLINE;
    testData += CUT;

    // Try Windows raw printing first
    console.log("Using Windows raw printing for test...");
    const success = await printRawToWindows(testData, printerName);
    
    if (success) {
      console.log("Windows raw test print successful");
      return { success: true };
    }

    // Fallback to node-thermal-printer
    if (!printer && !useFallback) {
      await initializePrinter(printerName);
    }

    if (printer && !useFallback) {
      console.log("Trying node-thermal-printer for test...");
      printer.clear();

      printer.alignCenter();
      printer.setTextDoubleHeight();
      printer.bold(true);
      printer.println("TEST PRINT");
      printer.bold(false);
      printer.setTextNormal();
      printer.println("POS-80 Thermal Printer");
      printer.println("Printer is working!");
      printer.newLine();
      printer.println(new Date().toLocaleString());
      printer.drawLine();
      printer.newLine();
      printer.newLine();
      printer.cut();

      const result = await printer.execute();
      console.log("Test print result:", result);
      return { success: true };
    }

    return { success: false, error: "All printing methods failed" };
  } catch (error) {
    console.error("Test print failed:", error);
    return { success: false, error: String(error) };
  }
}
