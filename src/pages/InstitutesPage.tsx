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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/table";
import {
  useCreateInstitute,
  useDeleteInstitute,
  useInstitutes,
  useUpdateInstitute,
} from "../hooks/useQueries";
import type { Institute } from "../types";

const InstitutesPage: React.FC = () => {
  const { data: institutes = [], isLoading: loading } = useInstitutes();

  const createInstitute = useCreateInstitute();
  const updateInstitute = useUpdateInstitute();
  const deleteInstitute = useDeleteInstitute();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstitute, setEditingInstitute] = useState<Institute | null>(
    null
  );
  const [formData, setFormData] = useState({
    id: "",
    institute_name: "",
    district: "",
    zone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingInstitute) {
        await updateInstitute.mutateAsync(formData);
        Swal.fire("Success", "Institute updated", "success");
      } else {
        await createInstitute.mutateAsync(formData);
        Swal.fire("Success", "Institute created", "success");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      Swal.fire("Error", "Failed to save institute", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Delete institute?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await deleteInstitute.mutateAsync(id);
        Swal.fire("Deleted!", "Institute deleted", "success");
      } catch (error) {
        Swal.fire("Error", "Failed to delete institute", "error");
      }
    }
  };

  const resetForm = () => {
    setEditingInstitute(null);
    setFormData({ id: "", institute_name: "", district: "", zone: "" });
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading institutes...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Institutes</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-[#17411c]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Institute
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingInstitute ? "Edit" : "Add"} Institute
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={formData.institute_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          institute_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Zone</Label>
                    <Input
                      value={formData.zone}
                      onChange={(e) =>
                        setFormData({ ...formData, zone: e.target.value })
                      }
                    />
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
                      {editingInstitute ? "Update" : "Create"}
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
                    <TableHead>District</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {institutes.map((institute: Institute) => (
                    <TableRow key={institute._id}>
                      <TableCell className="font-medium">
                        {institute.institute_name}
                      </TableCell>
                      <TableCell>{institute.district || "-"}</TableCell>
                      <TableCell>{institute.zone || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingInstitute(institute);
                              setFormData({
                                id: institute._id.toString(),
                                institute_name: institute.institute_name,
                                district: institute.district || "",
                                zone: institute.zone || "",
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(institute._id)}
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

export default InstitutesPage;
