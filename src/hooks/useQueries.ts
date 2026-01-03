import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  categoriesAPI,
  institutesAPI,
  inventoryAPI,
  transactionsAPI,
  usersAPI,
} from "../services/api";
import type { Product } from "../types";

// Products/Inventory Queries
export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await inventoryAPI.getAll();
      return response.data;
    },
  });
};

export const useProductBySKU = (sku: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ["product", sku],
    queryFn: async () => {
      const response = await inventoryAPI.getBySKU(sku);
      return response.data;
    },
    enabled: enabled && !!sku,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => inventoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => inventoryAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Categories Queries
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await categoriesAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => categoriesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => categoriesAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// Institutes Queries
export const useInstitutes = () => {
  return useQuery({
    queryKey: ["institutes"],
    queryFn: async () => {
      const response = await institutesAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateInstitute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => institutesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutes"] });
    },
  });
};

export const useUpdateInstitute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => institutesAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutes"] });
    },
  });
};

export const useDeleteInstitute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => institutesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["institutes"] });
    },
  });
};

// Transactions Queries
export const useTransactions = () => {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await transactionsAPI.getAll();
      return response.data;
    },
  });
};

export const useTransactionsByDate = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: ["transactions", startDate, endDate],
    queryFn: async () => {
      // Add end of day time to endDate to include all transactions on that day
      const endDateTime = `${endDate} 23:59:59`;
      const response = await transactionsAPI.getByDate(
        startDate,
        endDateTime,
        1, // status: 1 for completed transactions
        0 // user: 0 for all users
      );
      return response.data;
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => transactionsAPI.create(data),
    onSuccess: () => {
      // Invalidate all transaction queries (including date-filtered ones)
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["products"],
        refetchType: "all",
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "all",
      });
    },
  });
};

// Dashboard Data Query
export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [productsRes, transactionsRes] = await Promise.all([
        inventoryAPI.getAll(),
        transactionsAPI.getAll(),
      ]);

      const products = productsRes.data;
      const transactions = transactionsRes.data;

      const today = new Date().toDateString();
      const todayTransactions = transactions.filter(
        (t: any) => new Date(t.date).toDateString() === today
      );

      return {
        totalProducts: products.length,
        lowStockProducts: products.filter((p: Product) => p.quantity < 10)
          .length,
        todaySales: todayTransactions.reduce(
          (sum: number, t: any) => sum + Number(t.total || 0),
          0
        ),
        totalTransactions: todayTransactions.length,
      };
    },
  });
};

// Users Queries
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await usersAPI.getAll();
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => usersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => usersAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
