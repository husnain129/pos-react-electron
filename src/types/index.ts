export interface User {
  _id: number;
  username: string;
  name?: string;
  fullname?: string;
  email?: string;
  role: string;
  status?: string;
  perm_products?: number;
  perm_categories?: number;
  perm_transactions?: number;
  perm_users?: number;
  perm_settings?: number;
}

export interface Product {
  _id: number;
  name: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  category: number;
  quantity: number;
  stock: number;
  zone?: string;
  district?: string;
  institute_name?: string;
  institute_id?: number;
  product_category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  _id: number;
  name: string;
  description?: string;
  institute_id?: number;
  created_at?: string;
}

export interface Institute {
  _id: number;
  institute_name: string;
  district?: string;
  zone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  _id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransactionItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  category_id?: number;
  category_name?: string;
  institute_id?: number;
  institute_name?: string;
  product_category?: string;
}

export interface Transaction {
  _id: number;
  order: number;
  ref_number?: string;
  customer_id?: number;
  customer_name?: string;
  total: number;
  paid: number;
  change: number;
  discount: number;
  tax: number;
  payment_method?: string;
  payment_status?: string;
  status: number;
  items: TransactionItem[];
  user_id?: number;
  till: number;
  user: string;
  user_fullname?: string;
  user_role?: string;
  date: string;
}

export interface Settings {
  _id: number;
  store_name: string;
  store_address?: string;
  store_phone?: string;
  store_email?: string;
  currency?: string;
  tax_rate: number;
  charge_tax: boolean;
  symbol?: string;
  receipt_header?: string;
  receipt_footer?: string;
  logo?: string;
  settings: {
    app: string;
    store: string;
    address_one?: string;
    address_two?: string;
    contact?: string;
    tax: number;
    symbol: string;
    percentage: number;
    charge_tax: number;
    footer?: string;
    img?: string;
  };
}

export interface CartItem extends Product {
  cartQuantity: number;
  cartTotal: number;
}
