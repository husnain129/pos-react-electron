let printer: any = null;

async function loadPrinterModule() {
  try {
    // Use dynamic import for ESM compatibility
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    printer = require("printer");
    console.log("Printer module loaded");
  } catch (error) {
    console.error("Printer module not available:", error);
  }
}

// Initialize printer module
loadPrinterModule();

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

// ESC/POS Commands
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

function padLine(left: string, right: string, width: number = 48): string {
  const padding = width - left.length - right.length;
  return left + " ".repeat(Math.max(0, padding)) + right;
}

function buildReceiptData(data: PrintReceiptData): string {
  let receipt = "";

  // Initialize printer
  receipt += INIT;

  // Header
  receipt += ALIGN_CENTER;
  receipt += SIZE_DOUBLE;
  receipt += BOLD_ON;
  receipt += "Creative Hands" + NEWLINE;
  receipt += BOLD_OFF;
  receipt += SIZE_NORMAL;
  receipt += "By TEVTA" + NEWLINE;
  receipt += "Point of Sale System" + NEWLINE;
  receipt += NEWLINE;

  // Receipt title
  receipt += BOLD_ON;
  receipt += "SALES RECEIPT" + NEWLINE;
  receipt += BOLD_OFF;
  receipt += "Invoice: " + data.invoiceNo + NEWLINE;
  receipt += data.date + NEWLINE;

  // Line
  receipt += "------------------------------------------------" + NEWLINE;

  // Customer info
  receipt += ALIGN_LEFT;
  receipt += "Customer: " + data.customer_name + NEWLINE;
  receipt += "Payment: " + data.payment_method + NEWLINE;
  receipt += "------------------------------------------------" + NEWLINE;

  // Items
  data.items.forEach((item) => {
    // Item name
    receipt += item.name.substring(0, 48) + NEWLINE;

    // Quantity x Price and Total
    const qtyLine = `  ${item.quantity} x Rs${item.price.toFixed(2)}`;
    const totalStr = `Rs ${item.total.toFixed(2)}`;
    receipt += padLine(qtyLine, totalStr) + NEWLINE;
  });

  receipt += "------------------------------------------------" + NEWLINE;

  // Subtotal
  receipt += padLine("Subtotal:", `Rs ${data.subtotal.toFixed(2)}`) + NEWLINE;

  // Tax
  if (data.taxPercentage > 0) {
    receipt +=
      padLine(`Tax (${data.taxPercentage}%):`, `Rs ${data.tax.toFixed(2)}`) +
      NEWLINE;
  }

  // Discount
  if (data.discountAmount > 0) {
    receipt +=
      padLine("Discount:", `-Rs ${data.discountAmount.toFixed(2)}`) + NEWLINE;
  }

  receipt += "------------------------------------------------" + NEWLINE;

  // Total
  receipt += BOLD_ON;
  receipt += SIZE_DOUBLE_HEIGHT;
  receipt += padLine("TOTAL:", `Rs ${data.total.toFixed(2)}`, 24) + NEWLINE;
  receipt += SIZE_NORMAL;
  receipt += BOLD_OFF;

  // Paid
  receipt += padLine("Paid:", `Rs ${data.paid.toFixed(2)}`) + NEWLINE;

  // Change
  if (data.change > 0) {
    receipt += BOLD_ON;
    receipt += padLine("Change:", `Rs ${data.change.toFixed(2)}`) + NEWLINE;
    receipt += BOLD_OFF;
  }

  receipt += "------------------------------------------------" + NEWLINE;

  // Footer
  receipt += ALIGN_CENTER;
  receipt += "Thank you for your business!" + NEWLINE;
  receipt += "Served by: " + data.user + NEWLINE;
  receipt += NEWLINE;
  receipt += "TEVTA - Creative Hands" + NEWLINE;
  receipt += NEWLINE;
  receipt += NEWLINE;
  receipt += NEWLINE;

  // Cut paper
  receipt += CUT;

  return receipt;
}

export async function printReceiptESCPOS(data: PrintReceiptData): Promise<any> {
  if (!printer) {
    return { success: false, error: "Printer module not available" };
  }

  return new Promise((resolve) => {
    try {
      const receiptData = buildReceiptData(data);

      printer.printDirect({
        data: receiptData,
        printer: "POS-80",
        type: "RAW",
        success: (jobID: string) => {
          console.log("Print job sent. Job ID:", jobID);
          resolve({ success: true });
        },
        error: (err: any) => {
          console.error("Print error:", err);
          resolve({ success: false, error: String(err) });
        },
      });
    } catch (error) {
      console.error("Print failed:", error);
      resolve({ success: false, error: String(error) });
    }
  });
}

export async function testPrintESCPOS(): Promise<any> {
  if (!printer) {
    return { success: false, error: "Printer module not available" };
  }

  return new Promise((resolve) => {
    try {
      let test = INIT;
      test += ALIGN_CENTER;
      test += SIZE_DOUBLE;
      test += BOLD_ON;
      test += "TEST PRINT" + NEWLINE;
      test += BOLD_OFF;
      test += SIZE_NORMAL;
      test += "POS-80 Thermal Printer" + NEWLINE;
      test += "Printer is working!" + NEWLINE;
      test += NEWLINE;
      test += new Date().toLocaleString() + NEWLINE;
      test += "------------------------------------------------" + NEWLINE;
      test += NEWLINE;
      test += NEWLINE;
      test += CUT;

      printer.printDirect({
        data: test,
        printer: "POS-80",
        type: "RAW",
        success: (jobID: string) => {
          console.log("Test print successful. Job ID:", jobID);
          resolve({ success: true });
        },
        error: (err: any) => {
          console.error("Test print error:", err);
          resolve({ success: false, error: String(err) });
        },
      });
    } catch (error) {
      console.error("Test print failed:", error);
      resolve({ success: false, error: String(error) });
    }
  });
}
