import { useCallback, useState } from "react";

declare global {
  interface Window {
    electron: {
      printer: {
        initialize: () => Promise<boolean>;
        test: () => Promise<{ success: boolean; error?: string }>;
        printInvoice: (
          data: PrintInvoiceData
        ) => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}

interface PrintInvoiceData {
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
}

export const usePrinter = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const initialize = useCallback(async () => {
    try {
      const result = await window.electron.printer.initialize();
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
      const result = await window.electron.printer.test();
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

  const printInvoice = useCallback(async (data: PrintInvoiceData) => {
    setIsPrinting(true);
    try {
      const result = await window.electron.printer.printInvoice(data);
      if (!result.success) {
        throw new Error(result.error || "Print failed");
      }
      return result;
    } catch (error) {
      console.error("Invoice print failed:", error);
      throw error;
    } finally {
      setIsPrinting(false);
    }
  }, []);

  return {
    isInitialized,
    isPrinting,
    initialize,
    testPrint,
    printInvoice,
  };
};
