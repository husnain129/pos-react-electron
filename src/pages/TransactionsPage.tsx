import { Eye, Search } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";
import logo from "../assets/logo.png";
import qrCode from "../assets/qr.jpeg";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader } from "../components/card";
import { Dialog, DialogContent } from "../components/dialog";
import { Input } from "../components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table";
import { useTransactionsByDate } from "../hooks/useQueries";
import type { Transaction } from "../types";

const TransactionsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    start: moment().subtract(3, "days").format("YYYY-MM-DD"),
    end: moment().format("YYYY-MM-DD"),
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const { data: transactions = [], isLoading: loading } = useTransactionsByDate(
    dateFilter.start,
    dateFilter.end
  );

  const filteredTransactions = searchTerm
    ? transactions.filter(
        (t: Transaction) =>
          t._id.toString().includes(searchTerm) ||
          t.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.user?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transactions;

  const viewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const handleCloseInvoice = () => {
    setSelectedTransaction(null);
  };

  const totalSales = filteredTransactions.reduce(
    (sum: number, t: Transaction) => sum + (Number(t.total) || 0),
    0
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">Transactions</h2>
              <p className="text-muted-foreground">Sales history and reports</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, start: e.target.value })
                  }
                />
                <Input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) =>
                    setDateFilter({ ...dateFilter, end: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <p className="text-sm font-medium">Total Sales</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  Rs {Number(totalSales || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm font-medium">Total Transactions</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {filteredTransactions.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <p className="text-sm font-medium">Average Sale</p>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  Rs{" "}
                  {filteredTransactions.length > 0
                    ? (
                        Number(totalSales || 0) / filteredTransactions.length
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by invoice, customer, or cashier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction: Transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium">
                        #{transaction._id}
                      </TableCell>
                      <TableCell>
                        {moment(transaction.date).format("MMM DD, YYYY")}
                      </TableCell>
                      <TableCell>
                        {transaction.customer_name || "Walk-in"}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        Rs {Number(transaction.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge>{transaction.payment_method || "Cash"}</Badge>
                      </TableCell>
                      <TableCell>{transaction.user}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Invoice Modal */}
      <Dialog
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedTransaction && (
            <div className="p-6">
              {/* Invoice Header */}
              <div className="text-center border-b">
                <img
                  src={logo}
                  alt="Creative Hands Logo"
                  className="!w-[120px] !h-[120px] object-cover mx-auto"
                />
                <h1 className="text-3xl font-bold text-[#17411c] mb-2">
                  Creative Hands
                </h1>
                <p className="text-sm text-gray-600">By TEVTA</p>
                <p className="text-sm text-gray-600">Point of Sale System</p>
                <div className="mt-4">
                  <h2 className="text-xl font-semibold">SALES INVOICE</h2>
                  <p className="text-sm text-gray-600">
                    Invoice No: INV-{selectedTransaction._id}
                  </p>
                  <p className="text-sm text-gray-600">
                    {moment(selectedTransaction.date).format(
                      "MMM DD, YYYY h:mm A"
                    )}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <p className="text-sm">
                  <strong>Customer:</strong>{" "}
                  {selectedTransaction.customer_name || "Walk-in Customer"}
                </p>
                <p className="text-sm">
                  <strong>Payment Method:</strong>{" "}
                  {selectedTransaction.payment_method || "Cash"}
                </p>
                <p className="text-sm">
                  <strong>Payment Status:</strong>{" "}
                  {selectedTransaction.payment_status || "Paid"}
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
                    {(selectedTransaction.items || []).map(
                      (item: any, index: number) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 px-2">{index + 1}</td>
                          <td className="py-2 px-2">{item.name}</td>
                          <td className="text-right py-2 px-2">
                            Rs {Number(item.price || 0).toFixed(2)}
                          </td>
                          <td className="text-right py-2 px-2">
                            {item.quantity}
                          </td>
                          <td className="text-right py-2 px-2">
                            Rs {Number(item.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      )
                    )}
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
                        Rs{" "}
                        {(
                          Number(selectedTransaction.total || 0) -
                          Number(selectedTransaction.tax || 0) +
                          Number(selectedTransaction.discount || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                    {selectedTransaction.tax > 0 && (
                      <div className="flex justify-between mb-1">
                        <span>Tax:</span>
                        <span>
                          Rs {Number(selectedTransaction.tax || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {selectedTransaction.discount > 0 && (
                      <div className="flex justify-between mb-1 text-red-600">
                        <span>Discount:</span>
                        <span>
                          - Rs{" "}
                          {Number(selectedTransaction.discount || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">
                        Rs {Number(selectedTransaction.total || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Paid:</span>
                      <span>
                        Rs {Number(selectedTransaction.paid || 0).toFixed(2)}
                      </span>
                    </div>
                    {selectedTransaction.paid - selectedTransaction.total >
                      0 && (
                      <div className="flex justify-between mt-1 font-semibold text-green-700">
                        <span>Change:</span>
                        <span>
                          Rs{" "}
                          {Number(
                            selectedTransaction.paid -
                              selectedTransaction.total || 0
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-600 border-t pt-4">
                <p>Thank you for your business!</p>
                <p className="mt-2">Served by: {selectedTransaction.user}</p>
                <div className="mt-4">
                  <img
                    src={qrCode}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
