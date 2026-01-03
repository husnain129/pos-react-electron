// Check if we're in Electron environment
const isElectron = typeof window !== "undefined" && window.ipcRenderer;

// Wrapper to handle both HTTP (dev) and IPC (production)
const apiCall = async (channel: string, ...args: any[]) => {
  if (isElectron) {
    // Use IPC in Electron
    return await window.ipcRenderer.invoke(channel, ...args);
  } else {
    // Fallback to HTTP for web/dev
    throw new Error(
      "HTTP fallback not implemented. Running in Electron mode only."
    );
  }
};

// Users API
export const usersAPI = {
  login: async (username: string, password: string) => {
    const data = await apiCall("users:login", username, password);
    return { data };
  },
  logout: async (userId: number) => {
    await apiCall("users:logout", userId);
    return { data: null };
  },
  getAll: async () => {
    const data = await apiCall("users:getAll");
    return { data };
  },
  getById: async (userId: number) => {
    const data = await apiCall("users:getById", userId);
    return { data };
  },
  create: async (userData: any) => {
    const data = await apiCall("users:create", userData);
    return { data };
  },
  update: async (userData: any) => {
    const data = await apiCall("users:update", userData);
    return { data };
  },
  delete: async (userId: number) => {
    await apiCall("users:delete", userId);
    return { data: null };
  },
};

// Products/Inventory API
export const inventoryAPI = {
  getAll: async () => {
    const data = await apiCall("inventory:getAll");
    return { data };
  },
  getById: async (productId: number) => {
    const data = await apiCall("inventory:getById", productId);
    return { data };
  },
  getBySKU: async (skuCode: string) => {
    const data = await apiCall("inventory:getBySKU", skuCode);
    return { data };
  },
  create: async (productData: any) => {
    const data = await apiCall("inventory:create", productData);
    return { data };
  },
  update: async (productData: any) => {
    const data = await apiCall("inventory:update", productData);
    return { data };
  },
  delete: async (productId: number) => {
    await apiCall("inventory:delete", productId);
    return { data: null };
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const data = await apiCall("categories:getAll");
    return { data };
  },
  create: async (categoryData: any) => {
    const data = await apiCall("categories:create", categoryData);
    return { data };
  },
  update: async (categoryData: any) => {
    const data = await apiCall("categories:update", categoryData);
    return { data };
  },
  delete: async (categoryId: number) => {
    await apiCall("categories:delete", categoryId);
    return { data: null };
  },
};

// Institutes API
export const institutesAPI = {
  getAll: async () => {
    const data = await apiCall("institutes:getAll");
    return { data };
  },
  getById: async (id: number) => {
    const data = await apiCall("institutes:getById", id);
    return { data };
  },
  create: async (data: any) => {
    const result = await apiCall("institutes:create", data);
    return { data: result };
  },
  update: async (data: any) => {
    const result = await apiCall("institutes:update", data);
    return { data: result };
  },
  delete: async (id: number) => {
    await apiCall("institutes:delete", id);
    return { data: null };
  },
};

// Customers API
export const customersAPI = {
  getAll: async () => {
    const data = await apiCall("customers:getAll");
    return { data };
  },
  getById: async (customerId: number) => {
    const data = await apiCall("customers:getById", customerId);
    return { data };
  },
  create: async (customerData: any) => {
    const data = await apiCall("customers:create", customerData);
    return { data };
  },
  update: async (customerData: any) => {
    const data = await apiCall("customers:update", customerData);
    return { data };
  },
  delete: async (customerId: number) => {
    await apiCall("customers:delete", customerId);
    return { data: null };
  },
};

// Transactions API
export const transactionsAPI = {
  getAll: async () => {
    const data = await apiCall("transactions:getAll");
    return { data };
  },
  getById: async (transactionId: number) => {
    const data = await apiCall("transactions:getById", transactionId);
    return { data };
  },
  getByDate: async (
    start: string,
    end: string,
    status: number,
    user?: number
  ) => {
    const data = await apiCall(
      "transactions:getByDate",
      start,
      end,
      status,
      user
    );
    return { data };
  },
  getOnHold: async () => {
    const data = await apiCall("transactions:getOnHold");
    return { data };
  },
  getCustomerOrders: async () => {
    const data = await apiCall("transactions:getCustomerOrders");
    return { data };
  },
  create: async (transactionData: any) => {
    const data = await apiCall("transactions:create", transactionData);
    return { data };
  },
  update: async (transactionData: any) => {
    const data = await apiCall("transactions:update", transactionData);
    return { data };
  },
  delete: async (orderId: number) => {
    await apiCall("transactions:delete", orderId);
    return { data: null };
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const data = await apiCall("settings:get");
    return { data };
  },
  update: async (settingsData: any) => {
    const data = await apiCall("settings:update", settingsData);
    return { data };
  },
};

export default {
  usersAPI,
  inventoryAPI,
  categoriesAPI,
  institutesAPI,
  customersAPI,
  transactionsAPI,
  settingsAPI,
};
