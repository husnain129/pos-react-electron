import moment from "moment";
import * as XLSX from "xlsx";
import type { Transaction } from "../types";

interface ReportData {
  transactions: Transaction[];
  startDate: string;
  endDate: string;
}

export const generateExtensiveTransactionReport = (data: ReportData) => {
  try {
    console.log("Report generator called with:", data);
    const { transactions, startDate, endDate } = data;

    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to generate report");
    }

    console.log("Creating workbook...");
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    console.log("Generating summary sheet...");
    // 1. Summary Sheet
    const summaryData = generateSummarySheet(transactions, startDate, endDate);
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    console.log("Generating transactions sheet...");
    // 2. All Transactions Sheet
    const transactionsData = generateTransactionsSheet(transactions);
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    XLSX.utils.book_append_sheet(
      workbook,
      transactionsSheet,
      "All Transactions"
    );

    console.log("Generating product-wise sheet...");
    // 3. Product-wise Report
    const productWiseData = generateProductWiseReport(transactions);
    const productSheet = XLSX.utils.json_to_sheet(productWiseData);
    XLSX.utils.book_append_sheet(workbook, productSheet, "Product-wise");

    console.log("Generating category-wise sheet...");
    // 4. Category-wise Report
    const categoryWiseData = generateCategoryWiseReport(transactions);
    const categorySheet = XLSX.utils.json_to_sheet(categoryWiseData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, "Category-wise");

    console.log("Generating institute-wise sheet...");
    // 5. Institute-wise Report
    const instituteWiseData = generateInstituteWiseReport(transactions);
    const instituteSheet = XLSX.utils.json_to_sheet(instituteWiseData);
    XLSX.utils.book_append_sheet(workbook, instituteSheet, "Institute-wise");

    console.log("Generating daily sales sheet...");
    // 6. Daily Sales Report
    const dailySalesData = generateDailySalesReport(transactions);
    const dailySalesSheet = XLSX.utils.json_to_sheet(dailySalesData);
    XLSX.utils.book_append_sheet(workbook, dailySalesSheet, "Daily Sales");

    console.log("Generating payment method sheet...");
    // 7. Payment Method Report
    const paymentMethodData = generatePaymentMethodReport(transactions);
    const paymentMethodSheet = XLSX.utils.json_to_sheet(paymentMethodData);
    XLSX.utils.book_append_sheet(
      workbook,
      paymentMethodSheet,
      "Payment Methods"
    );

    console.log("Generating cashier sheet...");
    // 8. Cashier Performance
    const cashierData = generateCashierReport(transactions);
    const cashierSheet = XLSX.utils.json_to_sheet(cashierData);
    XLSX.utils.book_append_sheet(workbook, cashierSheet, "Cashier Performance");

    console.log("Creating filename...");
    // Generate filename with date range
    const filename = `Transaction_Report_${moment(startDate).format(
      "YYYYMMDD"
    )}_to_${moment(endDate).format("YYYYMMDD")}.xlsx`;

    console.log("Writing workbook to file:", filename);
    // Write the workbook and trigger download
    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    console.log("Workbook written, size:", wbout.byteLength);

    const blob = new Blob([wbout], { type: "application/octet-stream" });
    console.log("Blob created, size:", blob.size);

    const url = URL.createObjectURL(blob);
    console.log("URL created:", url);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    console.log("Link appended to body, triggering click...");

    link.click();
    console.log("Click triggered");

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("Cleanup completed");
  } catch (error) {
    console.error("Error in generateExtensiveTransactionReport:", error);
    throw error;
  }
};

// Generate Summary Sheet
function generateSummarySheet(
  transactions: Transaction[],
  startDate: string,
  endDate: string
): any[][] {
  const totalSales = transactions.reduce(
    (sum, t) => sum + Number(t.total || 0),
    0
  );
  const totalDiscount = transactions.reduce(
    (sum, t) => sum + Number(t.discount || 0),
    0
  );
  const totalTax = transactions.reduce((sum, t) => sum + Number(t.tax || 0), 0);
  const totalTransactions = transactions.length;
  const averageSale =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const totalItems = transactions.reduce((sum, t) => {
    const items = t.items || [];
    return (
      sum + items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0)
    );
  }, 0);

  return [
    ["TRANSACTION REPORT SUMMARY"],
    [""],
    [
      "Report Period",
      `${moment(startDate).format("MMM DD, YYYY")} - ${moment(endDate).format(
        "MMM DD, YYYY"
      )}`,
    ],
    ["Generated On", moment().format("MMM DD, YYYY h:mm A")],
    [""],
    ["KEY METRICS"],
    ["Total Transactions", totalTransactions],
    ["Total Sales (Rs)", totalSales.toFixed(2)],
    ["Total Discount (Rs)", totalDiscount.toFixed(2)],
    ["Total Tax (Rs)", totalTax.toFixed(2)],
    ["Average Sale (Rs)", averageSale.toFixed(2)],
    ["Total Items Sold", totalItems],
    [""],
    ["PAYMENT METHODS"],
    ...getPaymentMethodSummary(transactions),
  ];
}

function getPaymentMethodSummary(transactions: Transaction[]): any[][] {
  const paymentSummary: { [key: string]: { count: number; total: number } } =
    {};

  transactions.forEach((t) => {
    const method = t.payment_method || "Cash";
    if (!paymentSummary[method]) {
      paymentSummary[method] = { count: 0, total: 0 };
    }
    paymentSummary[method].count += 1;
    paymentSummary[method].total += Number(t.total || 0);
  });

  return Object.entries(paymentSummary).map(([method, data]) => [
    method,
    data.count,
    data.total.toFixed(2),
  ]);
}

// Generate Transactions Sheet
function generateTransactionsSheet(transactions: Transaction[]) {
  return transactions.map((t) => ({
    "Invoice #": t._id,
    Date: moment(t.date).format("MMM DD, YYYY h:mm A"),
    Customer: t.customer_name || "Walk-in",
    "Total (Rs)": Number(t.total || 0).toFixed(2),
    "Discount (Rs)": Number(t.discount || 0).toFixed(2),
    "Tax (Rs)": Number(t.tax || 0).toFixed(2),
    "Payment Method": t.payment_method || "Cash",
    "Payment Status": t.payment_status || "Paid",
    Cashier: t.user,
    "Items Count": (t.items || []).length,
  }));
}

// Generate Product-wise Report
function generateProductWiseReport(transactions: Transaction[]) {
  const productStats: {
    [key: string]: {
      name: string;
      quantity: number;
      revenue: number;
      transactions: number;
      avgPrice: number;
    };
  } = {};

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const itemName = item.name || "Unknown Product";
      const key = itemName;
      if (!productStats[key]) {
        productStats[key] = {
          name: itemName,
          quantity: 0,
          revenue: 0,
          transactions: 0,
          avgPrice: 0,
        };
      }
      productStats[key].quantity += item.quantity || 0;
      productStats[key].revenue += Number(item.total || 0);
      productStats[key].transactions += 1;
    });
  });

  // Calculate average price and sort by revenue
  return Object.values(productStats)
    .map((stat) => ({
      ...stat,
      avgPrice: stat.quantity > 0 ? stat.revenue / stat.quantity : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((stat) => ({
      "Product Name": stat.name,
      "Total Quantity Sold": stat.quantity,
      "Total Revenue (Rs)": stat.revenue.toFixed(2),
      "Number of Transactions": stat.transactions,
      "Average Price (Rs)": stat.avgPrice.toFixed(2),
    }));
}

// Generate Category-wise Report
function generateCategoryWiseReport(transactions: Transaction[]) {
  const categoryStats: {
    [key: string]: {
      category: string;
      products: Set<string>;
      quantity: number;
      revenue: number;
      transactions: number;
    };
  } = {};

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      // Use actual category_name from item, or fallback to product_category, or extract from name
      const itemName = item.name || "Unknown Product";
      const category = 
        (item as any).category_name || 
        (item as any).product_category || 
        (itemName ? extractCategory(itemName) : "Uncategorized");

      if (!categoryStats[category]) {
        categoryStats[category] = {
          category,
          products: new Set(),
          quantity: 0,
          revenue: 0,
          transactions: 0,
        };
      }
      categoryStats[category].products.add(itemName);
      categoryStats[category].quantity += item.quantity || 0;
      categoryStats[category].revenue += Number(item.total || 0);
      categoryStats[category].transactions += 1;
    });
  });

  return Object.values(categoryStats)
    .sort((a, b) => b.revenue - a.revenue)
    .map((stat) => ({
      Category: stat.category,
      "Unique Products": stat.products.size,
      "Total Quantity Sold": stat.quantity,
      "Total Revenue (Rs)": stat.revenue.toFixed(2),
      "Number of Transactions": stat.transactions,
      "Average per Transaction (Rs)": (
        stat.revenue / stat.transactions
      ).toFixed(2),
    }));
}

// Generate Institute-wise Report
function generateInstituteWiseReport(transactions: Transaction[]) {
  const instituteStats: {
    [key: string]: {
      institute: string;
      quantity: number;
      revenue: number;
      transactions: number;
      products: Set<string>;
    };
  } = {};

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      // Use actual institute_name from item, or fallback to extracting from name
      const itemName = item.name || "Unknown Product";
      const institute = 
        (item as any).institute_name || 
        (itemName ? extractInstitute(itemName) : "General");

      if (!instituteStats[institute]) {
        instituteStats[institute] = {
          institute,
          quantity: 0,
          revenue: 0,
          transactions: 0,
          products: new Set(),
        };
      }
      instituteStats[institute].products.add(itemName);
      instituteStats[institute].quantity += item.quantity || 0;
      instituteStats[institute].revenue += Number(item.total || 0);
      instituteStats[institute].transactions += 1;
    });
  });

  return Object.values(instituteStats)
    .sort((a, b) => b.revenue - a.revenue)
    .map((stat) => ({
      Institute: stat.institute,
      "Unique Products": stat.products.size,
      "Total Quantity Sold": stat.quantity,
      "Total Revenue (Rs)": stat.revenue.toFixed(2),
      "Number of Transactions": stat.transactions,
      "Average per Transaction (Rs)": (
        stat.revenue / stat.transactions
      ).toFixed(2),
    }));
}

// Generate Daily Sales Report
function generateDailySalesReport(transactions: Transaction[]) {
  const dailyStats: {
    [key: string]: {
      date: string;
      transactions: number;
      revenue: number;
      discount: number;
      tax: number;
      itemsSold: number;
    };
  } = {};

  transactions.forEach((t) => {
    const dateKey = moment(t.date).format("YYYY-MM-DD");

    if (!dailyStats[dateKey]) {
      dailyStats[dateKey] = {
        date: dateKey,
        transactions: 0,
        revenue: 0,
        discount: 0,
        tax: 0,
        itemsSold: 0,
      };
    }
    dailyStats[dateKey].transactions += 1;
    dailyStats[dateKey].revenue += Number(t.total || 0);
    dailyStats[dateKey].discount += Number(t.discount || 0);
    dailyStats[dateKey].tax += Number(t.tax || 0);
    dailyStats[dateKey].itemsSold += (t.items || []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
  });

  return Object.values(dailyStats)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((stat) => ({
      Date: moment(stat.date).format("MMM DD, YYYY"),
      Transactions: stat.transactions,
      "Revenue (Rs)": stat.revenue.toFixed(2),
      "Discount (Rs)": stat.discount.toFixed(2),
      "Tax (Rs)": stat.tax.toFixed(2),
      "Items Sold": stat.itemsSold,
      "Average Sale (Rs)": (stat.revenue / stat.transactions).toFixed(2),
    }));
}

// Generate Payment Method Report
function generatePaymentMethodReport(transactions: Transaction[]) {
  const paymentStats: {
    [key: string]: {
      method: string;
      count: number;
      revenue: number;
      avgTransaction: number;
    };
  } = {};

  transactions.forEach((t) => {
    const method = t.payment_method || "Cash";

    if (!paymentStats[method]) {
      paymentStats[method] = {
        method,
        count: 0,
        revenue: 0,
        avgTransaction: 0,
      };
    }
    paymentStats[method].count += 1;
    paymentStats[method].revenue += Number(t.total || 0);
  });

  return Object.values(paymentStats)
    .map((stat) => ({
      ...stat,
      avgTransaction: stat.revenue / stat.count,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((stat) => ({
      "Payment Method": stat.method,
      "Transaction Count": stat.count,
      "Total Revenue (Rs)": stat.revenue.toFixed(2),
      "Average Transaction (Rs)": stat.avgTransaction.toFixed(2),
      "Percentage of Sales":
        ((stat.count / transactions.length) * 100).toFixed(2) + "%",
    }));
}

// Generate Cashier Report
function generateCashierReport(transactions: Transaction[]) {
  const cashierStats: {
    [key: string]: {
      cashier: string;
      transactions: number;
      revenue: number;
      avgTransaction: number;
      itemsSold: number;
    };
  } = {};

  transactions.forEach((t) => {
    const cashier = t.user || "Unknown";

    if (!cashierStats[cashier]) {
      cashierStats[cashier] = {
        cashier,
        transactions: 0,
        revenue: 0,
        avgTransaction: 0,
        itemsSold: 0,
      };
    }
    cashierStats[cashier].transactions += 1;
    cashierStats[cashier].revenue += Number(t.total || 0);
    cashierStats[cashier].itemsSold += (t.items || []).reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
  });

  return Object.values(cashierStats)
    .map((stat) => ({
      ...stat,
      avgTransaction: stat.revenue / stat.transactions,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((stat) => ({
      Cashier: stat.cashier,
      Transactions: stat.transactions,
      "Total Revenue (Rs)": stat.revenue.toFixed(2),
      "Items Sold": stat.itemsSold,
      "Average Transaction (Rs)": stat.avgTransaction.toFixed(2),
      "Average Items per Transaction": (
        stat.itemsSold / stat.transactions
      ).toFixed(2),
    }));
}

// Helper function to extract category from product name
function extractCategory(productName: string | undefined | null): string {
  if (!productName || typeof productName !== "string") {
    return "Uncategorized";
  }
  // This is a simple implementation - you may need to adjust based on your naming convention
  // Looking for patterns like "Category - Product" or "Category: Product"
  const categoryMatch = productName.match(/^([^-:]+)[-:]/);
  return categoryMatch ? categoryMatch[1].trim() : "Uncategorized";
}

// Helper function to extract institute from product name
function extractInstitute(productName: string | undefined | null): string {
  if (!productName || typeof productName !== "string") {
    return "General";
  }
  // This is a simple implementation - adjust based on your naming convention
  // You might need to fetch this from the products table in a real implementation
  const instituteMatch = productName.match(/\(([^)]+)\)$/);
  return instituteMatch ? instituteMatch[1].trim() : "General";
}
