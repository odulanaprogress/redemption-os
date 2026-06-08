import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Vendor, Order } from '../types';

interface MarketplaceState {
  products: Product[];
  vendors: Vendor[];
  orders: Order[];
  selectedProduct: Product | null;
  selectedVendor: Vendor | null;
  isLoading: boolean;
  error: string | null;

  setProducts: (products: Product[]) => void;
  setVendors: (vendors: Vendor[]) => void;
  setOrders: (orders: Order[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedVendor: (vendor: Vendor | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMarketplace: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set) => ({
      products: [],
      vendors: [],
      orders: [],
      selectedProduct: null,
      selectedVendor: null,
      isLoading: false,
      error: null,

      setProducts: (products) => set({ products }),

      setVendors: (vendors) => set({ vendors }),

      setOrders: (orders) => set({ orders }),

      setSelectedProduct: (product) => set({ selectedProduct: product }),

      setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),

      addProduct: (product) =>
        set((state) => ({
          products: [product, ...state.products],
        })),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, ...updates } : o)),
        })),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error, isLoading: false }),

      clearMarketplace: () =>
        set({
          products: [],
          vendors: [],
          orders: [],
          selectedProduct: null,
          selectedVendor: null,
        }),
    }),
    {
      name: 'marketplace-storage',
      partialize: (state) => ({
        selectedProduct: state.selectedProduct,
        selectedVendor: state.selectedVendor,
      }),
    }
  )
);
