import axios from "axios";
import type {
  Category,
  Customer,
  Institute,
  Product,
  Settings,
  Transaction,
  User,
} from "../types";

const API_URL = "http://localhost:8001/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Users API
export const usersAPI = {
  login: (username: string, password: string) =>
    api.post<User>("/users/login", { username, password }),
  logout: (userId: number) => api.get(`/users/logout/${userId}`),
  getAll: () => api.get<User[]>("/users/all"),
  getById: (userId: number) => api.get<User>(`/users/user/${userId}`),
  create: (userData: any) => api.post<User>("/users/post", userData),
  update: (userData: any) => api.post<User>("/users/post", userData),
  delete: (userId: number) => api.delete(`/users/user/${userId}`),
};

// Products/Inventory API
export const inventoryAPI = {
  getAll: () => api.get<Product[]>("/inventory/products"),
  getById: (productId: number) =>
    api.get<Product>(`/inventory/product/${productId}`),
  getBySKU: (skuCode: string) =>
    api.post<Product>("/inventory/product/sku", { skuCode }),
  create: (productData: any) =>
    api.post<Product>("/inventory/product", productData),
  update: (productData: any) =>
    api.post<Product>("/inventory/product", productData),
  delete: (productId: number) => api.delete(`/inventory/product/${productId}`),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get<Category[]>("/categories/all"),
  create: (categoryData: any) =>
    api.post<Category>("/categories/category", categoryData),
  update: (categoryData: any) => api.put("/categories/category", categoryData),
  delete: (categoryId: number) =>
    api.delete(`/categories/category/${categoryId}`),
};

// Institutes API
export const institutesAPI = {
  getAll: () => api.get<Institute[]>("/institutes/all"),
  getById: (id: number) => api.get<Institute>(`/institutes/institute/${id}`),
  create: (data: any) => api.post<Institute>("/institutes/institute", data),
  update: (data: any) => api.post<Institute>("/institutes/institute", data),
  delete: (id: number) => api.delete(`/institutes/institute/${id}`),
};

// Customers API
export const customersAPI = {
  getAll: () => api.get<Customer[]>("/customers/all"),
  getById: (customerId: number) =>
    api.get<Customer>(`/customers/customer/${customerId}`),
  create: (customerData: any) =>
    api.post<Customer>("/customers/customer", customerData),
  update: (customerData: any) => api.put("/customers/customer", customerData),
  delete: (customerId: number) =>
    api.delete(`/customers/customer/${customerId}`),
};

// Transactions API
export const transactionsAPI = {
  getAll: () => api.get<Transaction[]>("/transactions/all"),
  getById: (transactionId: number) =>
    api.get<Transaction>(`/transactions/${transactionId}`),
  getByDate: (start: string, end: string, status: number, user?: number) =>
    api.get<Transaction[]>("/transactions/by-date", {
      params: { start, end, status, user: user || 0 },
    }),
  getOnHold: () => api.get<Transaction[]>("/transactions/on-hold"),
  getCustomerOrders: () =>
    api.get<Transaction[]>("/transactions/customer-orders"),
  create: (transactionData: any) =>
    api.post("/transactions/new", transactionData),
  update: (transactionData: any) =>
    api.put("/transactions/new", transactionData),
  delete: (orderId: number) => api.post("/transactions/delete", { orderId }),
};

// Settings API
export const settingsAPI = {
  get: () => api.get<Settings>("/settings/get"),
  update: (settingsData: any) => api.post("/settings/post", settingsData),
};

export default api;
