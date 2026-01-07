// This file provides optional ESC/POS printing via network using `node-thermal-printer`.
// The previous native `printer` module (printer@0.4.0) caused install failures on modern Node/Electron.
// Preferred approach on Windows: use HTML printing via Electron (safe & native), or configure a network thermal printer
// and set THERMAL_PRINTER_HOST (and optional THERMAL_PRINTER_PORT) environment variables.

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

// Build a human-readable receipt for network (TCP) printers
function buildPlainReceipt(data: PrintReceiptData): string {
  const NL = "\n";
  let receipt = "";
  receipt += "CREATIVE HANDS" + NL;
  receipt += "By TEVTA" + NL;
  receipt += "Point of Sale System" + NL + NL;
  receipt += "SALES RECEIPT" + NL;
  receipt += `Invoice: ${data.invoiceNo}` + NL;
  receipt += `${data.date}` + NL;
  receipt += "--------------------------------" + NL;
  receipt += `Customer: ${data.customer_name}` + NL;
  receipt += `Payment: ${data.payment_method}` + NL;
  receipt += "--------------------------------" + NL;
  data.items.forEach((item) => {
    receipt += `${item.name.substring(0, 32)}` + NL;
    receipt += `${item.quantity} x Rs${item.price.toFixed(2)}   Rs ${item.total.toFixed(2)}` + NL;
  });
  receipt += "--------------------------------" + NL;
  receipt += `Subtotal: Rs ${data.subtotal.toFixed(2)}` + NL;
  if (data.taxPercentage > 0) receipt += `Tax (${data.taxPercentage}%): Rs ${data.tax.toFixed(2)}` + NL;
  if (data.discountAmount > 0) receipt += `Discount: -Rs ${data.discountAmount.toFixed(2)}` + NL;
  receipt += `TOTAL: Rs ${data.total.toFixed(2)}` + NL;
  receipt += `Paid: Rs ${data.paid.toFixed(2)}` + NL;
  if (data.change > 0) receipt += `Change: Rs ${data.change.toFixed(2)}` + NL;
  receipt += NL + NL + "Thank you for your business!" + NL;
  return receipt;
}

// Tries network printing using `node-thermal-printer` when THERMAL_PRINTER_HOST is configured.
export async function printReceiptESCPOS(data: PrintReceiptData): Promise<any> {
  const host = process.env.THERMAL_PRINTER_HOST;
  const port = process.env.THERMAL_PRINTER_PORT || "9100";

  if (!host) {
    return { success: false, error: "ESC/POS network printer not configured (set THERMAL_PRINTER_HOST)" };
  }

  try {
    const mt = await import("node-thermal-printer");
    const ThermalPrinter = (mt as any).ThermalPrinter;
    const PrinterTypes = (mt as any).PrinterTypes;

    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `tcp://${host}:${port}`,
    });

    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.println("Creative Hands");
    printer.setTextNormal();
    printer.println("By TEVTA");
    printer.println("Point of Sale System");
    printer.newLine();
    printer.bold(true);
    printer.println("SALES RECEIPT");
    printer.bold(false);
    printer.println(`Invoice: ${data.invoiceNo}`);
    printer.println(`${data.date}`);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Customer: ${data.customer_name}`);
    printer.println(`Payment: ${data.payment_method}`);
    printer.drawLine();

    data.items.forEach((item) => {
      printer.println(item.name.substring(0, 32));
      printer.tableCustom([{ text: `${item.quantity} x Rs${item.price.toFixed(2)}`, align: "LEFT", width: 0.7 }, { text: `Rs ${item.total.toFixed(2)}`, align: "RIGHT", width: 0.3 }]);
    });

    printer.drawLine();
    printer.tableCustom([{ text: "Subtotal:", align: "LEFT", width: 0.7 }, { text: `Rs ${data.subtotal.toFixed(2)}`, align: "RIGHT", width: 0.3 }]);

    if (data.taxPercentage > 0) {
      printer.tableCustom([{ text: `Tax (${data.taxPercentage}%):`, align: "LEFT", width: 0.7 }, { text: `Rs ${data.tax.toFixed(2)}`, align: "RIGHT", width: 0.3 }]);
    }

    if (data.discountAmount > 0) {
      printer.tableCustom([{ text: "Discount:", align: "LEFT", width: 0.7 }, { text: `-Rs ${data.discountAmount.toFixed(2)}`, align: "RIGHT", width: 0.3 }]);
    }

    printer.drawLine();
    printer.bold(true);
    printer.println(`TOTAL: Rs ${data.total.toFixed(2)}`);
    printer.bold(false);
    printer.tableCustom([{ text: "Paid:", align: "LEFT", width: 0.7 }, { text: `Rs ${data.paid.toFixed(2)}`, align: "RIGHT", width: 0.3 }]);
    if (data.change > 0) printer.tableCustom([{ text: "Change:", align: "LEFT", width: 0.7 }, { text: `Rs ${data.change.toFixed(2)}`, align: "RIGHT", width: 0.3 }]);

    printer.newLine();
    printer.alignCenter();
    printer.println("Thank you for your business!");
    printer.cut();

    const connected = await printer.isPrinterConnected();
    if (!connected) {
      return { success: false, error: `Unable to connect to printer at ${host}:${port}` };
    }

    await printer.execute();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: String(error) };
  }
}

export async function testPrintESCPOS(): Promise<any> {
  const host = process.env.THERMAL_PRINTER_HOST;
  const port = process.env.THERMAL_PRINTER_PORT || "9100";

  if (!host) {
    return { success: false, error: "ESC/POS network printer not configured (set THERMAL_PRINTER_HOST)" };
  }

  try {
    const mt = await import("node-thermal-printer");
    const ThermalPrinter = (mt as any).ThermalPrinter;
    const PrinterTypes = (mt as any).PrinterTypes;

    const printer = new ThermalPrinter({ type: PrinterTypes.EPSON, interface: `tcp://${host}:${port}` });

    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.println("TEST PRINT");
    printer.setTextNormal();
    printer.println("POS-80 Thermal Printer");
    printer.println("Printer is working!");
    printer.newLine();
    printer.println(new Date().toLocaleString());
    printer.cut();

    const connected = await printer.isPrinterConnected();
    if (!connected) {
      return { success: false, error: `Unable to connect to printer at ${host}:${port}` };
    }

    await printer.execute();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: String(error) };
  }
}
