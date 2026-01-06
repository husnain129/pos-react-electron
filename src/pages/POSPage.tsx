import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
import qrCode from "../assets/qr.jpeg";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader } from "../components/card";
import { Input } from "../components/input";
import { ScrollArea } from "../components/scroll-area";
import { Separator } from "../components/separator";
import { useCreateTransaction, useProducts } from "../hooks/useQueries";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import type { Product } from "../types";

const POSPage: React.FC = () => {
  const { data: products = [], isLoading: loading } = useProducts();
  const createTransaction = useCreateTransaction();
  const [searchTerm, setSearchTerm] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);
  const { items, addItem, updateQuantity, removeItem, clearCart, getTotal } =
    useCartStore();
  const { user } = useAuthStore();

  // Calculate totals
  const subtotal = getTotal();
  const discountValue = Number(discountAmount) || 0;
  const subtotalAfterDiscount = subtotal - discountValue;
  const taxAmount = (subtotalAfterDiscount * taxPercentage) / 100;
  const totalWithTax = subtotalAfterDiscount + taxAmount;
  const changeAmount = paidAmount - totalWithTax;

  // Auto-focus barcode scanner input when page loads and after adding items
  React.useEffect(() => {
    if (!showInvoice && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [showInvoice, items.length]);

  // Auto-add product when barcode is entered (without pressing Enter)
  React.useEffect(() => {
    if (barcodeInput.trim().length >= 13) {
      // EAN-13 barcodes are 13 digits
      const product = products.find(
        (p: Product) => p.barcode && p.barcode === barcodeInput.trim()
      );

      if (product) {
        if (product.quantity > 0) {
          addItem(product);
          Swal.fire({
            icon: "success",
            title: "Added to Cart",
            text: `${product.name} added successfully!`,
            timer: 1500,
            showConfirmButton: false,
            position: "top-end",
            toast: true,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Out of Stock",
            text: `${product.name} is currently out of stock!`,
            timer: 2000,
            showConfirmButton: false,
            position: "top-end",
            toast: true,
          });
        }
        // Clear barcode input
        setBarcodeInput("");
      }
    }
  }, [barcodeInput, products, addItem]);

  // Handle barcode scan
  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // The useEffect above already handles adding the product
      // This just clears the input if needed
      if (barcodeInput.trim()) {
        setBarcodeInput("");
      }
    }
  };

  // Check available printers
  const checkPrinters = async () => {
    if (window.ipcRenderer) {
      const result = await window.ipcRenderer.invoke("print:listPrinters");
      if (result.success) {
        const printerList = result.printers
          .map((p: any) => `${p.name}${p.isDefault ? " (Default)" : ""}`)
          .join("\n");
        Swal.fire({
          title: "Available Printers",
          html: `<pre style="text-align: left; font-size: 12px;">${
            printerList || "No printers found"
          }</pre>`,
          icon: "info",
        });
      } else {
        Swal.fire("Error", "Failed to list printers", "error");
      }
    } else {
      Swal.fire("Info", "Printer detection only works in Electron app", "info");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Swal.fire("Empty Cart", "Please add items to cart", "warning");
      return;
    }

    // For cash payments, validate paid amount
    if (paymentMethod === "Cash" && paidAmount < totalWithTax) {
      Swal.fire(
        "Insufficient Amount",
        "Paid amount is less than total",
        "warning"
      );
      return;
    }

    try {
      setIsProcessing(true);

      // For card payments, paid amount equals total
      const actualPaidAmount =
        paymentMethod === "Card" ? totalWithTax : paidAmount;

      const transactionData = {
        customer: 0,
        customer_name: "Walk-in Customer",
        total: totalWithTax,
        paid: actualPaidAmount,
        discount: discountValue,
        tax: taxAmount,
        payment_method: paymentMethod,
        payment_status: "Paid",
        status: 1,
        items: items.map((item) => ({
          id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity,
          total: item.cartTotal,
        })),
        user_id: user?._id,
      };

      // Save transaction to backend
      const result = await createTransaction.mutateAsync(transactionData);

      console.log("Transaction saved successfully:", result);

      // Calculate change for invoice (only for cash payments)
      const actualChange = paymentMethod === "Card" ? 0 : changeAmount;

      // Prepare invoice data and print instantly
      const invoiceData = {
        ...transactionData,
        subtotal,
        discountAmount: discountValue,
        taxPercentage,
        change: actualChange,
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.cartQuantity,
          total: item.cartTotal,
        })),
        date: new Date().toLocaleString(),
        invoiceNo: `INV-${Date.now()}`,
        user: user?.fullname || user?.username || "Staff",
      };

      // Clear cart before showing invoice
      clearCart();
      setTaxPercentage(0);
      setDiscountAmount(0);
      setPaidAmount(0);
      setPaymentMethod("Cash");

      // Auto-print immediately after completing sale
      if (window.ipcRenderer) {
        // Use thermal printer in Electron
        const result = await window.ipcRenderer.invoke(
          "print:thermal",
          invoiceData
        );
        if (result.success) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Sale completed and receipt printed",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Print Failed",
            text: result.error || "Sale completed but failed to print receipt",
            timer: 3000,
          });
          // Show invoice for manual printing
          setInvoiceData(invoiceData);
          setShowInvoice(true);
        }
      } else {
        // For web version, show invoice with manual print
        setInvoiceData(invoiceData);
        setShowInvoice(true);
      }
    } catch (error) {
      console.error("Error completing sale:", error);
      Swal.fire("Error", "Failed to complete sale", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products
    .filter(
      (p: Product) =>
        (searchTerm &&
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p._id.toString().includes(searchTerm))) ||
        (barcodeInput && p.barcode && p.barcode.includes(barcodeInput)) ||
        (!searchTerm && !barcodeInput)
    )
    .sort((a: Product, b: Product) => Number(a._id) - Number(b._id));

  if (showInvoice && invoiceData) {
    return (
      <div className="thermal-receipt">
        <div className="receipt-content">
          {/* Invoice Header */}
          <div className="text-center mb-4 pb-3 border-b-2 border-dashed border-gray-400">
            <div className="flex justify-center mb-2">
              <img
                src={logo}
                alt="Creative Hands Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-lg font-bold">Creative Hands</h1>
            <p className="text-xs">By TEVTA</p>
            <p className="text-xs">Point of Sale System</p>
            <div className="mt-2">
              <p className="text-sm font-semibold">SALES RECEIPT</p>
              <p className="text-xs">Invoice: {invoiceData.invoiceNo}</p>
              <p className="text-xs">{invoiceData.date}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="mb-3 text-xs">
            <p>
              <strong>Customer:</strong> {invoiceData.customer_name}
            </p>
            <p>
              <strong>Payment:</strong> {invoiceData.payment_method}
            </p>
          </div>

          {/* Items List */}
          <div className="mb-3 border-b-2 border-dashed border-gray-400 pb-2">
            <div className="text-xs font-semibold border-b border-gray-300 pb-1 mb-2">
              <div className="flex justify-between">
                <span className="flex-1">Item</span>
                <span className="w-12 text-right">Qty</span>
                <span className="w-20 text-right">Total</span>
              </div>
            </div>
            {invoiceData.items.map((item: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between text-xs">
                  <span className="flex-1 font-medium">{item.name}</span>
                  <span className="w-12 text-right">{item.quantity}</span>
                  <span className="w-20 text-right">
                    Rs {Number(item.total || 0).toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-gray-600 ml-0">
                  Rs {Number(item.price || 0).toFixed(2)} each
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mb-3 text-xs">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>
              <span>Rs {Number(invoiceData.subtotal || 0).toFixed(2)}</span>
            </div>
            {invoiceData.taxPercentage > 0 && (
              <div className="flex justify-between mb-1">
                <span>Tax ({invoiceData.taxPercentage}%):</span>
                <span>Rs {Number(invoiceData.tax || 0).toFixed(2)}</span>
              </div>
            )}
            {invoiceData.discountAmount > 0 && (
              <div className="flex justify-between mb-1">
                <span>Discount:</span>
                <span>
                  - Rs {Number(invoiceData.discountAmount || 0).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm border-t-2 border-gray-400 pt-2 mt-2">
              <span>TOTAL:</span>
              <span>Rs {Number(invoiceData.total || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Paid:</span>
              <span>Rs {Number(invoiceData.paid || 0).toFixed(2)}</span>
            </div>
            {invoiceData.change > 0 && (
              <div className="flex justify-between mt-1 font-semibold">
                <span>Change:</span>
                <span>Rs {Number(invoiceData.change || 0).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs border-t-2 border-dashed border-gray-400 pt-3 mt-3">
            <p className="font-medium">Thank you for your business!</p>
            <p className="mt-1">Served by: {invoiceData.user}</p>
            <div className="mt-3 mb-2">
              <img src={qrCode} alt="QR Code" className="w-20 h-20 mx-auto" />
            </div>
            <p className="text-xs mt-2">TEVTA - Creative Hands</p>
          </div>

          {/* Print and Close Buttons - Hidden when printing */}
          <div className="flex gap-4 mt-6 print:hidden">
            <Button
              onClick={async () => {
                if (window.ipcRenderer) {
                  // Use thermal printer in Electron
                  const result = await window.ipcRenderer.invoke(
                    "print:thermal",
                    invoiceData
                  );
                  if (result.success) {
                    Swal.fire({
                      icon: "success",
                      title: "Printed!",
                      text: "Receipt printed successfully",
                      timer: 1500,
                      showConfirmButton: false,
                    });
                    setShowInvoice(false);
                    setInvoiceData(null);
                  } else {
                    Swal.fire({
                      icon: "error",
                      title: "Print Failed",
                      text: result.error || "Failed to print receipt",
                    });
                  }
                } else {
                  // Fallback to browser print
                  window.print();
                }
              }}
              className="flex-1 bg-[#17411c] hover:bg-[#1a4f22]"
            >
              Print Receipt
            </Button>
            <Button
              onClick={() => {
                setShowInvoice(false);
                setInvoiceData(null);
              }}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {loading ? (
        <div className="lg:col-span-3 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Products List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Products</h2>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search products by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <ShoppingCart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    ref={barcodeInputRef}
                    placeholder="Scan or enter barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcodeScan}
                    className="pl-10 font-mono"
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product: Product) => (
                    <Card
                      key={product._id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => addItem(product)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">
                              ID: {product._id}
                            </p>
                            <h3 className="font-semibold line-clamp-2">
                              {product.name}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-green-600">
                              Rs {Number(product.price || 0).toFixed(2)}
                            </span>
                            <Badge
                              variant={
                                product.quantity > 0 ? "default" : "destructive"
                              }
                            >
                              {product.quantity}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Cart ({items.length})
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px]">
                {items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-16 h-16 mx-auto mb-2 opacity-20" />
                    <p>Cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="border rounded-lg p-3 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm flex-1">
                            {item.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item._id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item._id, item.cartQuantity - 1)
                              }
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">
                              {item.cartQuantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item._id, item.cartQuantity + 1)
                              }
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="font-semibold">
                            Rs {Number(item.cartTotal || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Rs {Number(item.price || 0).toFixed(2)} each
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <Separator />

              <div className="space-y-3">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    Rs {Number(subtotal || 0).toFixed(2)}
                  </span>
                </div>

                {/* Discount Input */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Discount (Rs)</label>
                  <Input
                    type="number"
                    min="0"
                    max={subtotal}
                    step="0.01"
                    value={discountAmount || ""}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    placeholder="Enter discount amount"
                    className="text-right"
                  />
                </div>

                {/* Discount Display */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Discount:</span>
                    <span className="text-red-600">
                      - Rs {Number(discountAmount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Subtotal after discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm font-medium border-t pt-2">
                    <span>Subtotal after discount:</span>
                    <span>
                      Rs {Number(subtotalAfterDiscount || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Tax Input */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Tax (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxPercentage || ""}
                    onChange={(e) => setTaxPercentage(Number(e.target.value))}
                    placeholder="Enter tax %"
                    className="text-right"
                  />
                </div>

                {/* Tax Amount Display */}
                {taxPercentage > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({taxPercentage}%):</span>
                    <span>Rs {Number(taxAmount || 0).toFixed(2)}</span>
                  </div>
                )}

                {/* Total with Tax */}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">
                    Rs {Number(totalWithTax || 0).toFixed(2)}
                  </span>
                </div>

                {/* Paid Amount Input */}
                {paymentMethod === "Cash" && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Amount Paid</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paidAmount || ""}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      placeholder="Enter amount paid"
                      className="text-right text-lg font-semibold"
                    />
                  </div>
                )}

                {/* Payment Method Selector */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === "Cash" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("Cash")}
                      className={
                        paymentMethod === "Cash"
                          ? "bg-[#17411c] hover:bg-[#1a4f22]"
                          : ""
                      }
                    >
                      Cash
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "Card" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("Card")}
                      className={
                        paymentMethod === "Card"
                          ? "bg-[#17411c] hover:bg-[#1a4f22]"
                          : ""
                      }
                    >
                      Card
                    </Button>
                  </div>
                </div>

                {/* Change Display */}
                {paymentMethod === "Cash" && paidAmount > 0 && (
                  <div
                    className={`flex justify-between text-sm font-semibold p-2 rounded ${
                      changeAmount >= 0
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <span>Change:</span>
                    <span>
                      Rs {Number(Math.max(0, changeAmount) || 0).toFixed(2)}
                    </span>
                  </div>
                )}

                <Button
                  className="w-full bg-[#17411c] hover:bg-[#1a4f22] text-lg py-6"
                  onClick={handleCheckout}
                  disabled={
                    items.length === 0 ||
                    isProcessing ||
                    (paymentMethod === "Cash" && paidAmount < totalWithTax)
                  }
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Complete Sale
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                  disabled={items.length === 0 || isProcessing}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={checkPrinters}
                >
                  Check Printers
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default POSPage;
