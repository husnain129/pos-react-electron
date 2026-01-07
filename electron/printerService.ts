import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const printer = require("printer");

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

class PrinterService {
  private printerName: string = "POS-80";

  // ESC/POS Commands
  private readonly ESC = "\x1B";
  private readonly GS = "\x1D";

  private readonly CMD_INIT = this.ESC + "@";
  private readonly CMD_BOLD_ON = this.ESC + "E" + "\x01";
  private readonly CMD_BOLD_OFF = this.ESC + "E" + "\x00";
  private readonly CMD_ALIGN_LEFT = this.ESC + "a" + "\x00";
  private readonly CMD_ALIGN_CENTER = this.ESC + "a" + "\x01";
  private readonly CMD_SIZE_NORMAL = this.GS + "!" + "\x00";
  private readonly CMD_SIZE_DOUBLE = this.GS + "!" + "\x11";
  private readonly CMD_CUT = this.GS + "V" + "\x00";
  private readonly CMD_NEWLINE = "\n";

  initialize(): boolean {
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

  private buildReceiptData(data: PrintReceiptData): string {
    let receipt = "";

    receipt += this.CMD_INIT;
    receipt += this.CMD_ALIGN_CENTER;
    receipt += this.CMD_SIZE_DOUBLE;
    receipt += this.CMD_BOLD_ON;
    receipt += "Creative Hands" + this.CMD_NEWLINE;
    receipt += this.CMD_BOLD_OFF;
    receipt += this.CMD_SIZE_NORMAL;
    receipt += "By TEVTA" + this.CMD_NEWLINE;
    receipt += "Point of Sale System" + this.CMD_NEWLINE;
    receipt += this.CMD_NEWLINE;
    receipt += this.CMD_BOLD_ON;
    receipt += "SALES RECEIPT" + this.CMD_NEWLINE;
    receipt += this.CMD_BOLD_OFF;
    receipt += `Invoice: ${data.invoiceNo}` + this.CMD_NEWLINE;
    receipt += data.date + this.CMD_NEWLINE;
    receipt += this.line();

    receipt += this.CMD_ALIGN_LEFT;
    receipt += `Customer: ${data.customer_name}` + this.CMD_NEWLINE;
    receipt += `Payment: ${data.payment_method}` + this.CMD_NEWLINE;
    receipt += this.line();

    data.items.forEach((item) => {
      receipt += item.name.substring(0, 30) + this.CMD_NEWLINE;
      receipt += `${item.quantity} x Rs${item.price.toFixed(2)}`;
      receipt += this.pad(
        48 - `${item.quantity} x Rs${item.price.toFixed(2)}`.length
      );
      receipt += this.CMD_BOLD_ON;
      receipt += `Rs ${item.total.toFixed(2)}` + this.CMD_NEWLINE;
      receipt += this.CMD_BOLD_OFF;
    });

    receipt += this.line();
    receipt += this.formatLine("Subtotal:", `Rs ${data.subtotal.toFixed(2)}`);

    if (data.taxPercentage > 0) {
      receipt += this.formatLine(
        `Tax (${data.taxPercentage}%):`,
        `Rs ${data.tax.toFixed(2)}`
      );
    }

    if (data.discountAmount > 0) {
      receipt += this.formatLine(
        "Discount:",
        `-Rs ${data.discountAmount.toFixed(2)}`
      );
    }

    receipt += this.line();
    receipt += this.CMD_BOLD_ON;
    receipt += this.CMD_SIZE_DOUBLE;
    receipt += this.formatLine("TOTAL:", `Rs ${data.total.toFixed(2)}`);
    receipt += this.CMD_SIZE_NORMAL;
    receipt += this.CMD_BOLD_OFF;
    receipt += this.formatLine("Paid:", `Rs ${data.paid.toFixed(2)}`);

    if (data.change > 0) {
      receipt += this.CMD_BOLD_ON;
      receipt += this.formatLine("Change:", `Rs ${data.change.toFixed(2)}`);
      receipt += this.CMD_BOLD_OFF;
    }

    receipt += this.line();
    receipt += this.CMD_ALIGN_CENTER;
    receipt += "Thank you for your business!" + this.CMD_NEWLINE;
    receipt += `Served by: ${data.user}` + this.CMD_NEWLINE;
    receipt += this.CMD_NEWLINE;
    receipt += "TEVTA - Creative Hands" + this.CMD_NEWLINE;
    receipt += this.CMD_NEWLINE;
    receipt += this.CMD_NEWLINE;
    receipt += this.CMD_CUT;

    return receipt;
  }

  private line(): string {
    return (
      "------------------------------------------------" + this.CMD_NEWLINE
    );
  }

  private pad(length: number): string {
    return " ".repeat(Math.max(0, length));
  }

  private formatLine(left: string, right: string): string {
    const totalWidth = 48;
    const padding = totalWidth - left.length - right.length;
    return left + this.pad(padding) + right + this.CMD_NEWLINE;
  }

  async printReceipt(data: PrintReceiptData): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const receiptData = this.buildReceiptData(data);

        printer.printDirect({
          data: receiptData,
          printer: this.printerName,
          type: "RAW",
          success: (jobID: any) => {
            console.log("Print job sent successfully. Job ID:", jobID);
            resolve(true);
          },
          error: (err: any) => {
            console.error("Print error:", err);
            reject(new Error(String(err)));
          },
        });
      } catch (error) {
        console.error("Failed to print receipt:", error);
        reject(error);
      }
    });
  }

  async testPrint(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        let testData = this.CMD_INIT;
        testData += this.CMD_ALIGN_CENTER;
        testData += this.CMD_SIZE_DOUBLE;
        testData += this.CMD_BOLD_ON;
        testData += "TEST PRINT" + this.CMD_NEWLINE;
        testData += this.CMD_BOLD_OFF;
        testData += this.CMD_SIZE_NORMAL;
        testData += "POS-80 Thermal Printer" + this.CMD_NEWLINE;
        testData += "Printer is working!" + this.CMD_NEWLINE;
        testData += this.CMD_NEWLINE;
        testData += new Date().toLocaleString() + this.CMD_NEWLINE;
        testData += this.line();
        testData += this.CMD_NEWLINE;
        testData += this.CMD_CUT;

        printer.printDirect({
          data: testData,
          printer: this.printerName,
          type: "RAW",
          success: (jobID: any) => {
            console.log("Test print successful. Job ID:", jobID);
            resolve(true);
          },
          error: (err: any) => {
            console.error("Test print error:", err);
            reject(new Error(String(err)));
          },
        });
      } catch (error) {
        console.error("Test print failed:", error);
        reject(error);
      }
    });
  }

  listPrinters() {
    return printer.getPrinters();
  }
}

export const printerService = new PrinterService();
