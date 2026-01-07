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

let printer: any = null;

// Try to load printer module (only works on Windows after rebuild)
try {
  printer = require("printer");
  console.log("Printer module loaded successfully");
} catch (error) {
  console.log("Printer module not available, will use HTML printing fallback");
}

class PrinterService {
  private printerName: string = "POS-80";

  initialize(): boolean {
    if (!printer) {
      console.log("Using HTML printing mode");
      return true;
    }

    try {
      const printers = printer.getPrinters();
      const pos80 = printers.find((p: any) => p.name === "POS-80");

      if (!pos80) {
        console.error("POS-80 printer not found");
        console.log(
          "Available printers:",
          printers.map((p: any) => p.name)
        );
        return false;
      }

      this.printerName = pos80.name;
      console.log("Thermal printer initialized:", this.printerName);
      return true;
    } catch (error) {
      console.error("Failed to initialize printer:", error);
      return false;
    }
  }

  async printReceipt(data: PrintReceiptData): Promise<boolean> {
    if (!printer) {
      throw new Error("Printer module not available, use HTML printing");
    }

    return new Promise((resolve, reject) => {
      try {
        const receiptData = this.buildReceiptData(data);

        printer.printDirect({
          data: receiptData,
          printer: this.printerName,
          type: "RAW",
          success: (jobID: string) => {
            console.log("Print job sent successfully. Job ID:", jobID);
            resolve(true);
          },
          error: (err: any) => {
            console.error("Print error:", err);
            reject(new Error(err));
          },
        });
      } catch (error) {
        console.error("Failed to print receipt:", error);
        reject(error);
      }
    });
  }

  async testPrint(): Promise<boolean> {
    if (!printer) {
      throw new Error("Printer module not available, use HTML printing");
    }

    return new Promise((resolve, reject) => {
      try {
        const testData = this.buildTestData();

        printer.printDirect({
          data: testData,
          printer: this.printerName,
          type: "RAW",
          success: (jobID: string) => {
            console.log("Test print successful. Job ID:", jobID);
            resolve(true);
          },
          error: (err: any) => {
            console.error("Test print error:", err);
            reject(new Error(err));
          },
        });
      } catch (error) {
        console.error("Test print failed:", error);
        reject(error);
      }
    });
  }

  listPrinters() {
    if (!printer) {
      return [];
    }
    return printer.getPrinters();
  }

  private buildReceiptData(data: PrintReceiptData): string {
    const ESC = "\x1B";
    const GS = "\x1D";
    const CMD_INIT = ESC + "@";
    const CMD_BOLD_ON = ESC + "E" + "\x01";
    const CMD_BOLD_OFF = ESC + "E" + "\x00";
    const CMD_ALIGN_CENTER = ESC + "a" + "\x01";
    const CMD_ALIGN_LEFT = ESC + "a" + "\x00";
    const CMD_SIZE_DOUBLE = GS + "!" + "\x11";
    const CMD_SIZE_NORMAL = GS + "!" + "\x00";
    const CMD_CUT = GS + "V" + "\x00";
    const NL = "\n";

    let receipt = CMD_INIT;
    receipt += CMD_ALIGN_CENTER;
    receipt += CMD_SIZE_DOUBLE + CMD_BOLD_ON;
    receipt += "Creative Hands" + NL;
    receipt += CMD_SIZE_NORMAL + CMD_BOLD_OFF;
    receipt += "By TEVTA" + NL;
    receipt += "Point of Sale System" + NL + NL;
    receipt += CMD_BOLD_ON + "SALES RECEIPT" + NL + CMD_BOLD_OFF;
    receipt += `Invoice: ${data.invoiceNo}` + NL;
    receipt += data.date + NL;
    receipt += "------------------------------------------------" + NL;
    receipt += CMD_ALIGN_LEFT;
    receipt += `Customer: ${data.customer_name}` + NL;
    receipt += `Payment: ${data.payment_method}` + NL;
    receipt += "------------------------------------------------" + NL;

    data.items.forEach((item) => {
      receipt += item.name.substring(0, 30) + NL;
      const line =
        `${item.quantity} x Rs${item.price.toFixed(2)}`.padEnd(30) +
        CMD_BOLD_ON +
        `Rs ${item.total.toFixed(2)}` +
        CMD_BOLD_OFF +
        NL;
      receipt += line;
    });

    receipt += "------------------------------------------------" + NL;
    receipt += `Subtotal:`.padEnd(35) + `Rs ${data.subtotal.toFixed(2)}` + NL;

    if (data.taxPercentage > 0) {
      receipt +=
        `Tax (${data.taxPercentage}%):`.padEnd(35) +
        `Rs ${data.tax.toFixed(2)}` +
        NL;
    }

    if (data.discountAmount > 0) {
      receipt +=
        `Discount:`.padEnd(35) + `-Rs ${data.discountAmount.toFixed(2)}` + NL;
    }

    receipt += "------------------------------------------------" + NL;
    receipt += CMD_BOLD_ON + CMD_SIZE_DOUBLE;
    receipt += `TOTAL:`.padEnd(20) + `Rs ${data.total.toFixed(2)}` + NL;
    receipt += CMD_SIZE_NORMAL + CMD_BOLD_OFF;
    receipt += `Paid:`.padEnd(35) + `Rs ${data.paid.toFixed(2)}` + NL;

    if (data.change > 0) {
      receipt += CMD_BOLD_ON;
      receipt += `Change:`.padEnd(35) + `Rs ${data.change.toFixed(2)}` + NL;
      receipt += CMD_BOLD_OFF;
    }

    receipt += "------------------------------------------------" + NL;
    receipt += CMD_ALIGN_CENTER;
    receipt += "Thank you for your business!" + NL;
    receipt += `Served by: ${data.user}` + NL + NL;
    receipt += "TEVTA - Creative Hands" + NL + NL + NL;
    receipt += CMD_CUT;

    return receipt;
  }

  private buildTestData(): string {
    const ESC = "\x1B";
    const GS = "\x1D";
    const CMD_INIT = ESC + "@";
    const CMD_BOLD_ON = ESC + "E" + "\x01";
    const CMD_BOLD_OFF = ESC + "E" + "\x00";
    const CMD_ALIGN_CENTER = ESC + "a" + "\x01";
    const CMD_SIZE_DOUBLE = GS + "!" + "\x11";
    const CMD_SIZE_NORMAL = GS + "!" + "\x00";
    const CMD_CUT = GS + "V" + "\x00";
    const NL = "\n";

    let test = CMD_INIT;
    test += CMD_ALIGN_CENTER;
    test += CMD_SIZE_DOUBLE + CMD_BOLD_ON;
    test += "TEST PRINT" + NL;
    test += CMD_SIZE_NORMAL + CMD_BOLD_OFF;
    test += "POS-80 Thermal Printer" + NL;
    test += "Printer is working!" + NL + NL;
    test += new Date().toLocaleString() + NL;
    test += "------------------------------------------------" + NL + NL;
    test += CMD_CUT;

    return test;
  }
}

export const printerService = new PrinterService();
