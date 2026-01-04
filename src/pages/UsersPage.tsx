import { Edit, Plus, Shield, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Badge } from "../components/badge";
import { Button } from "../components/button";
import { Card, CardContent, CardHeader } from "../components/card";
import { Checkbox } from "../components/checkbox";
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
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "../hooks/useQueries";
import type { User } from "../types";

const UsersPage: React.FC = () => {
  const { data: users = [], isLoading: loading } = useUsers();

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    fullname: "",
    role: "cashier",
    perm_products: "off",
    perm_categories: "off",
    perm_transactions: "off",
    perm_users: "off",
    perm_settings: "off",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert permission strings to integers
      const userData = {
        ...formData,
        perm_products: formData.perm_products === "on" ? 1 : 0,
        perm_categories: formData.perm_categories === "on" ? 1 : 0,
        perm_transactions: formData.perm_transactions === "on" ? 1 : 0,
        perm_users: formData.perm_users === "on" ? 1 : 0,
        perm_settings: formData.perm_settings === "on" ? 1 : 0,
      };

      if (editingUser) {
        await updateUser.mutateAsync(userData);
        Swal.fire("Success", "User updated successfully", "success");
      } else {
        await createUser.mutateAsync(userData);
        Swal.fire("Success", "User created successfully", "success");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      Swal.fire("Error", "Failed to save user", "error");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      id: user._id.toString(),
      username: user.username,
      password: "", // Don't populate password for security
      fullname: user.fullname || "",
      role: user.role || "cashier",
      perm_products: user.perm_products === 1 ? "on" : "off",
      perm_categories: user.perm_categories === 1 ? "on" : "off",
      perm_transactions: user.perm_transactions === 1 ? "on" : "off",
      perm_users: user.perm_users === 1 ? "on" : "off",
      perm_settings: user.perm_settings === 1 ? "on" : "off",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: number) => {
    const result = await Swal.fire({
      title: "Delete user?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser.mutateAsync(userId);
        Swal.fire("Deleted!", "User has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", "Failed to delete user", "error");
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      id: "",
      username: "",
      password: "",
      fullname: "",
      role: "cashier",
      perm_products: "off",
      perm_categories: "off",
      perm_transactions: "off",
      perm_users: "off",
      perm_settings: "off",
    });
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#17411c] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Users Management
              </h2>
              <p className="text-muted-foreground">
                Manage user accounts and permissions
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={resetForm}
                  className="bg-[#17411c] hover:bg-[#1a4f22]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? "Edit User" : "Add New User"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingUser
                      ? "Update user information and permissions"
                      : "Create a new user account with permissions"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name *</Label>
                    <Input
                      id="fullname"
                      value={formData.fullname}
                      onChange={(e) =>
                        setFormData({ ...formData, fullname: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password{" "}
                      {editingUser ? "(leave blank to keep current)" : "*"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required={!editingUser}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({ ...formData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Permissions
                    </Label>

                    <div className="space-y-2 pl-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm_products"
                          checked={formData.perm_products === "on"}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              perm_products: checked ? "on" : "off",
                            })
                          }
                        />
                        <label
                          htmlFor="perm_products"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Products Management
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm_categories"
                          checked={formData.perm_categories === "on"}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              perm_categories: checked ? "on" : "off",
                            })
                          }
                        />
                        <label
                          htmlFor="perm_categories"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Categories Management
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm_transactions"
                          checked={formData.perm_transactions === "on"}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              perm_transactions: checked ? "on" : "off",
                            })
                          }
                        />
                        <label
                          htmlFor="perm_transactions"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Transactions Management
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm_users"
                          checked={formData.perm_users === "on"}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              perm_users: checked ? "on" : "off",
                            })
                          }
                        />
                        <label
                          htmlFor="perm_users"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Users Management
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="perm_settings"
                          checked={formData.perm_settings === "on"}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              perm_settings: checked ? "on" : "off",
                            })
                          }
                        />
                        <label
                          htmlFor="perm_settings"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Settings Management
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#17411c] hover:bg-[#1a4f22]"
                    >
                      {editingUser ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">All Users</h3>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Shield className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-gray-500">No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: User) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">
                          {user._id}
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullname || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "secondary"
                            }
                          >
                            {user.role || "cashier"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {user.perm_products === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Products
                              </Badge>
                            )}
                            {user.perm_categories === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Categories
                              </Badge>
                            )}
                            {user.perm_transactions === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Transactions
                              </Badge>
                            )}
                            {user.perm_users === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Users
                              </Badge>
                            )}
                            {user.perm_settings === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Settings
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(user._id)}
                              disabled={user._id === 1} // Prevent deleting admin
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

export default UsersPage;
