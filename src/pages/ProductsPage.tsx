import { Download, Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader } from "../components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/dialog";
import { Input } from "../components/input";
import { Label } from "../components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table";
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useInstitutes,
  useProducts,
  useUpdateProduct,
} from "../hooks/useQueries";
import type { Category, Institute, Product } from "../types";

const ProductsPage: React.FC = () => {
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: institutes = [], isLoading: institutesLoading } =
    useInstitutes();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterInstitute, setFilterInstitute] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    price: "",
    cost_price: "",
    quantity: "",
    category: "",
    institute_id: "",
    stock: "off",
  });

  const loading = productsLoading || categoriesLoading || institutesLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync(formData);
        Swal.fire("Success", "Product updated successfully", "success");
      } else {
        await createProduct.mutateAsync(formData);
        Swal.fire("Success", "Product created successfully", "success");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      Swal.fire("Error", "Failed to save product", "error");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      id: product._id.toString(),
      name: product.name,
      price: product.price.toString(),
      cost_price: product.cost_price?.toString() || "0",
      quantity: product.quantity.toString(),
      category: product.category.toString(),
      institute_id: product.institute_id?.toString() || "",
      stock: product.stock === 0 ? "on" : "off",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteProduct.mutateAsync(productId);
        Swal.fire("Deleted!", "Product has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting product:", error);
        Swal.fire("Error", "Failed to delete product", "error");
      }
    }
  };

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Barcode",
      "Price",
      "Cost Price",
      "Quantity",
      "Category",
      "Institute",
      "Zone",
      "District",
    ];

    const rows = filteredProducts.map((product: Product) => [
      product._id,
      product.name,
      product.barcode || "",
      product.price,
      product.cost_price || 0,
      product.quantity,
      product.product_category || "",
      product.institute_name || "",
      product.zone || "",
      product.district || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `products_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      id: "",
      name: "",
      price: "",
      cost_price: "",
      quantity: "",
      category: "",
      institute_id: "",
      stock: "off",
    });
  };

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product._id.toString().includes(searchTerm);
    const matchesInstitute =
      filterInstitute === "all" ||
      product.institute_id?.toString() === filterInstitute;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const productDate = product.created_at
        ? new Date(product.created_at)
        : null;
      if (productDate) {
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (productDate < fromDate) matchesDate = false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (productDate > toDate) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesInstitute && matchesDate;
  });

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Products</h2>
              <p className="text-muted-foreground">Manage your inventory</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadCSV}
                variant="outline"
                className="border-[#17411c] text-[#17411c] hover:bg-[#17411c] hover:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={resetForm}
                    className="bg-[#17411c] hover:bg-[#1a4f22]"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct
                        ? "Update product information"
                        : "Fill in the details to create a new product"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Selling Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cost_price">Cost Price</Label>
                        <Input
                          id="cost_price"
                          type="number"
                          step="0.01"
                          value={formData.cost_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cost_price: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) =>
                          setFormData({ ...formData, quantity: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        type="text"
                        value={formData.barcode || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, barcode: e.target.value })
                        }
                        placeholder="Enter barcode or leave empty for auto-generation"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: Category) => (
                            <SelectItem
                              key={cat._id}
                              value={cat._id.toString()}
                            >
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institute">Institute</Label>
                      <Select
                        value={formData.institute_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, institute_id: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select institute" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutes.map((inst: Institute) => (
                            <SelectItem
                              key={inst._id}
                              value={inst._id.toString()}
                            >
                              {inst.institute_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#17411c] hover:bg-[#1a4f22]"
                      >
                        {editingProduct ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={filterInstitute}
                    onValueChange={setFilterInstitute}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by institute" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutes</SelectItem>
                      {institutes.map((inst: Institute) => (
                        <SelectItem key={inst._id} value={inst._id.toString()}>
                          {inst.institute_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">
                    Created Date:
                  </Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    placeholder="From"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    placeholder="To"
                  />
                  {(dateFrom || dateTo) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Institute</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No products found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product: Product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">
                          {product._id}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {product.barcode || "-"}
                          </span>
                        </TableCell>
                        <TableCell>{product.product_category || "-"}</TableCell>
                        <TableCell>
                          Rs {Number(product.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.quantity < 10 ? "destructive" : "default"
                            }
                          >
                            {product.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.institute_name || "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProductsPage;
