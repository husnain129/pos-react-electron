import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import logo from "../assets/logo.png";
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

  // Handle barcode scan
  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      e.preventDefault();

      // Search for product by barcode
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
      } else {
        Swal.fire({
          icon: "error",
          title: "Not Found",
          text: `No product found with barcode: ${barcodeInput}`,
          timer: 2000,
          showConfirmButton: false,
          position: "top-end",
          toast: true,
        });
      }

      // Clear barcode input
      setBarcodeInput("");
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

      await createTransaction.mutateAsync(transactionData);

      // Calculate change for invoice (only for cash payments)
      const actualChange = paymentMethod === "Card" ? 0 : changeAmount;

      // Show invoice
      setInvoiceData({
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
      });
      setShowInvoice(true);
      clearCart();
      setTaxPercentage(0);
      setDiscountAmount(0);
      setPaidAmount(0);
      setPaymentMethod("Cash");
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
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p._id.toString().includes(searchTerm)
    )
    .sort((a: Product, b: Product) => Number(a._id) - Number(b._id));

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setInvoiceData(null);
  };

  if (showInvoice && invoiceData) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8">
            {/* Invoice Header */}
            <div className="text-center mb-8 border-b pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-3 border-2 border-[#17411c]">
                  <img
                    src={logo}
                    alt="Creative Hands Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#17411c] mb-2">
                Creative Hands
              </h1>
              <p className="text-sm text-gray-600">By TEVTA</p>
              <p className="text-sm text-gray-600">Point of Sale System</p>
              <div className="mt-4">
                <h2 className="text-xl font-semibold">SALES INVOICE</h2>
                <p className="text-sm text-gray-600">
                  Invoice No: {invoiceData.invoiceNo}
                </p>
                <p className="text-sm text-gray-600">{invoiceData.date}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6">
              <p className="text-sm">
                <strong>Customer:</strong> {invoiceData.customer_name}
              </p>
              <p className="text-sm">
                <strong>Payment Method:</strong> {invoiceData.payment_method}
              </p>
              <p className="text-sm">
                <strong>Payment Status:</strong> {invoiceData.payment_status}
              </p>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Item</th>
                    <th className="text-right py-2 px-2">Price</th>
                    <th className="text-right py-2 px-2">Qty</th>
                    <th className="text-right py-2 px-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-2 px-2">{index + 1}</td>
                      <td className="py-2 px-2">{item.name}</td>
                      <td className="text-right py-2 px-2">
                        Rs {Number(item.price || 0).toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-2">{item.quantity}</td>
                      <td className="text-right py-2 px-2">
                        Rs {Number(item.total || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="border-t-2 border-gray-300 pt-4 mb-6">
              <div className="flex justify-end mb-2">
                <div className="w-64">
                  <div className="flex justify-between mb-1">
                    <span>Subtotal:</span>
                    <span>
                      Rs {Number(invoiceData.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  {invoiceData.taxPercentage > 0 && (
                    <div className="flex justify-between mb-1">
                      <span>Tax ({invoiceData.taxPercentage}%):</span>
                      <span>Rs {Number(invoiceData.tax || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {invoiceData.discountAmount > 0 && (
                    <div className="flex justify-between mb-1 text-red-600">
                      <span>Discount:</span>
                      <span>
                        - Rs{" "}
                        {Number(invoiceData.discountAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">
                      Rs {Number(invoiceData.total || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Paid:</span>
                    <span>Rs {Number(invoiceData.paid || 0).toFixed(2)}</span>
                  </div>
                  {invoiceData.change > 0 && (
                    <div className="flex justify-between mt-1 font-semibold text-green-700">
                      <span>Change:</span>
                      <span>
                        Rs {Number(invoiceData.change || 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Instructions */}
            <div className="mb-6 p-3 bg-gray-50 rounded border">
              <p className="text-sm font-medium mb-1">Customer Instructions:</p>
              <p className="text-sm text-gray-700">
                Thank you for shopping with Creative Hands. For any queries or
                support, please contact our TEVTA office.
              </p>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-4">
              <p>Thank you for your business!</p>
              <p className="mt-2">
                Served by: {user?.fullname || user?.username}
              </p>
            </div>

            {/* Action Buttons - Hidden on print */}
            <div className="flex gap-4 mt-8 print:hidden">
              <Button
                onClick={handlePrintInvoice}
                className="flex-1 bg-[#17411c] hover:bg-[#1a4f22]"
              >
                Print Invoice
              </Button>
              <Button
                onClick={handleCloseInvoice}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
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
          {/* Hidden Barcode Scanner Input - Receives input from physical scanner */}
          <input
            ref={barcodeInputRef}
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={handleBarcodeScan}
            className="absolute opacity-0 pointer-events-none"
            autoComplete="off"
            aria-label="Barcode scanner input"
          />

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
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default POSPage;
