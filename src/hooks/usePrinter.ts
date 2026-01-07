import { useCallback, useState } from "react";

// Add the type declaration directly in this file
declare global {
  interface Window {
    printer: {
      listPrinters: () => Promise<{
        success: boolean;
        printers: any[];
        error?: string;
      }>;
      initialize: () => Promise<boolean>;
      test: () => Promise<{ success: boolean; error?: string }>;
      printReceipt: (
        receiptData: PrintReceiptData
      ) => Promise<{ success: boolean; error?: string }>;
      printThermalHTML: (
        receiptData: PrintReceiptData
      ) => Promise<{ success: boolean; error?: string }>;
      printSilent: () => Promise<{ success: boolean; error?: string }>;
    };
  }
}

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

export const usePrinter = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const initialize = useCallback(async () => {
    try {
      const result = await window.printer.initialize();
      setIsInitialized(result);
      return result;
    } catch (error) {
      console.error("Failed to initialize printer:", error);
      return false;
    }
  }, []);

  const testPrint = useCallback(async () => {
    setIsPrinting(true);
    try {
      const result = await window.printer.test();
      if (!result.success) {
        throw new Error(result.error || "Print failed");
      }
      return result;
    } catch (error) {
      console.error("Test print failed:", error);
      throw error;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const printReceipt = useCallback(async (data: PrintReceiptData) => {
    setIsPrinting(true);
    try {
      const result = await window.printer.printReceipt(data);
      if (!result.success) {
        throw new Error(result.error || "Print failed");
      }
      return result;
    } catch (error) {
      console.error("Receipt print failed:", error);
      throw error;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const printReceiptHTML = useCallback(async (data: PrintReceiptData) => {
    setIsPrinting(true);
    try {
      const result = await window.printer.printThermalHTML(data);
      if (!result.success) {
        throw new Error(result.error || "Print failed");
      }
      return result;
    } catch (error) {
      console.error("HTML receipt print failed:", error);
      throw error;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  const listPrinters = useCallback(async () => {
    try {
      const result = await window.printer.listPrinters();
      return result;
    } catch (error) {
      console.error("Failed to list printers:", error);
      throw error;
    }
  }, []);

  return {
    isInitialized,
    isPrinting,
    initialize,
    testPrint,
    printReceipt,
    printReceiptHTML,
    listPrinters,
  };
};

export type { PrintReceiptData };
