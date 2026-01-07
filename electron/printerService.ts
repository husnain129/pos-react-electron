import { ipcMain } from "electron";
import { PrinterTypes, ThermalPrinter } from "node-thermal-printer";

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
  private printer: ThermalPrinter | null = null;

  initialize() {
    try {
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: "printer:POS-80",
        removeSpecialCharacters: false,
        lineCharacter: "-",
        options: {
          timeout: 5000,
        },
      });

      console.log("Thermal printer initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize thermal printer:", error);
      return false;
    }
  }

  async printReceipt(data: PrintReceiptData): Promise<boolean> {
    try {
      if (!this.printer) {
        this.initialize();
      }

      if (!this.printer) {
        throw new Error("Printer not initialized");
      }

      this.printer.clear();

      // Header
      this.printer.alignCenter();
      this.printer.setTextSize(1, 1);
      this.printer.bold(true);
      this.printer.println("Creative Hands");
      this.printer.bold(false);
      this.printer.setTextNormal();
      this.printer.println("By TEVTA");
      this.printer.println("Point of Sale System");
      this.printer.newLine();
      this.printer.bold(true);
      this.printer.println("SALES RECEIPT");
      this.printer.bold(false);
      this.printer.println(`Invoice: ${data.invoiceNo}`);
      this.printer.println(data.date);
      this.printer.drawLine();

      // Customer & Payment Info
      this.printer.alignLeft();
      this.printer.println(`Customer: ${data.customer_name}`);
      this.printer.println(`Payment: ${data.payment_method}`);
      this.printer.drawLine();

      // Items
      data.items.forEach((item) => {
        // Item name
        const itemName = item.name.substring(0, 30);
        this.printer!.println(itemName);

        // Quantity x Price = Total
        const qtyPrice = `${item.quantity} x Rs${item.price.toFixed(2)}`;
        const total = `Rs ${item.total.toFixed(2)}`;

        this.printer!.tableCustom([
          { text: qtyPrice, align: "LEFT", width: 0.6 },
          { text: total, align: "RIGHT", width: 0.4, bold: true },
        ]);
      });

      this.printer.drawLine();

      // Totals
      this.printer.tableCustom([
        { text: "Subtotal:", align: "LEFT", width: 0.6 },
        { text: `Rs ${data.subtotal.toFixed(2)}`, align: "RIGHT", width: 0.4 },
      ]);

      if (data.taxPercentage > 0) {
        this.printer.tableCustom([
          { text: `Tax (${data.taxPercentage}%):`, align: "LEFT", width: 0.6 },
          { text: `Rs ${data.tax.toFixed(2)}`, align: "RIGHT", width: 0.4 },
        ]);
      }

      if (data.discountAmount > 0) {
        this.printer.tableCustom([
          { text: "Discount:", align: "LEFT", width: 0.6 },
          {
            text: `-Rs ${data.discountAmount.toFixed(2)}`,
            align: "RIGHT",
            width: 0.4,
          },
        ]);
      }

      this.printer.drawLine();

      // Total
      this.printer.bold(true);
      this.printer.setTextSize(1, 1);
      this.printer.tableCustom([
        { text: "TOTAL:", align: "LEFT", width: 0.6 },
        { text: `Rs ${data.total.toFixed(2)}`, align: "RIGHT", width: 0.4 },
      ]);
      this.printer.setTextNormal();
      this.printer.bold(false);

      // Payment details
      this.printer.tableCustom([
        { text: "Paid:", align: "LEFT", width: 0.6 },
        { text: `Rs ${data.paid.toFixed(2)}`, align: "RIGHT", width: 0.4 },
      ]);

      if (data.change > 0) {
        this.printer.bold(true);
        this.printer.tableCustom([
          { text: "Change:", align: "LEFT", width: 0.6 },
          { text: `Rs ${data.change.toFixed(2)}`, align: "RIGHT", width: 0.4 },
        ]);
        this.printer.bold(false);
      }

      this.printer.drawLine();

      // Footer
      this.printer.alignCenter();
      this.printer.println("Thank you for your business!");
      this.printer.println(`Served by: ${data.user}`);
      this.printer.newLine();
      this.printer.println("TEVTA - Creative Hands");
      this.printer.newLine();
      this.printer.newLine();

      this.printer.cut();

      await this.printer.execute();
      console.log("Receipt printed successfully");
      return true;
    } catch (error) {
      console.error("Print failed:", error);
      throw error;
    }
  }

  async testPrint(): Promise<boolean> {
    try {
      if (!this.printer) {
        this.initialize();
      }

      if (!this.printer) {
        throw new Error("Printer not initialized");
      }

      this.printer.clear();
      this.printer.alignCenter();
      this.printer.bold(true);
      this.printer.setTextSize(1, 1);
      this.printer.println("TEST PRINT");
      this.printer.bold(false);
      this.printer.setTextNormal();
      this.printer.println("POS-80 Thermal Printer");
      this.printer.println("Printer is working correctly!");
      this.printer.newLine();
      this.printer.println(new Date().toLocaleString());
      this.printer.drawLine();
      this.printer.newLine();
      this.printer.cut();

      await this.printer.execute();
      return true;
    } catch (error) {
      console.error("Test print failed:", error);
      throw error;
    }
  }
}

export const printerService = new PrinterService();

export function setupPrinterIPC() {
  ipcMain.handle("printer:initialize", async () => {
    try {
      return printerService.initialize();
    } catch (error: any) {
      console.error("Printer initialization error:", error);
      return false;
    }
  });

  ipcMain.handle("printer:test", async () => {
    try {
      await printerService.testPrint();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("printer:print-receipt", async (_, data: PrintReceiptData) => {
    try {
      await printerService.printReceipt(data);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
}
