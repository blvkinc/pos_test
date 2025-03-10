import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  products: {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    image?: string;
    created_at: string;
    updated_at: string;
  };
  transactions: {
    id: string;
    date: string;
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      category: string;
      stock: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'pending' | 'completed' | 'failed';
    created_at: string;
    updated_at: string;
  };
}; 