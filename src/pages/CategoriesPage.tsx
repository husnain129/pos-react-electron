import { Edit, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Button } from "../components/button";
import { Card, CardContent } from "../components/card";
import {
  Dialog,
  DialogContent,
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
  useCreateCategory,
  useDeleteCategory,
  useInstitutes,
  useUpdateCategory,
} from "../hooks/useQueries";
import type { Category, Institute } from "../types";

const CategoriesPage: React.FC = () => {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: institutes = [], isLoading: institutesLoading } =
    useInstitutes();

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const loading = categoriesLoading || institutesLoading;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    institute_id: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync(formData);
        Swal.fire("Success", "Category updated", "success");
      } else {
        await createCategory.mutateAsync(formData);
        Swal.fire("Success", "Category created", "success");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      Swal.fire("Error", "Failed to save category", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete category?",
      text: "This will affect products in this category",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory.mutateAsync(id);
        Swal.fire("Deleted!", "Category deleted", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete category", "error");
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({ id: "", name: "", description: "", institute_id: "" });
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Categories</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-[#17411c]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit" : "Add"} Category
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Institute</Label>
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
                    <Button type="submit" className="bg-[#17411c]">
                      {editingCategory ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Institute</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category: Category) => (
                    <TableRow key={category._id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>
                        {institutes.find(
                          (i: Institute) => i._id === category.institute_id
                        )?.institute_name || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(category);
                              setFormData({
                                id: category._id.toString(),
                                name: category.name,
                                description: category.description || "",
                                institute_id:
                                  category.institute_id?.toString() || "",
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(category._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CategoriesPage;
