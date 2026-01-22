import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface OfflineProduct {
  _id: string;
  name: string;
  sku: string;
  buyPrice: number;
  sellPrice: number;
  stockQuantity: number;
  imageUrl?: string;
  _lastSynced?: number;
  _isOffline?: boolean;
}

export interface OfflineTransaction {
  _id: string; // Local ID
  productId: string;
  userId: string;
  quantity: number;
  totalSale: number;
  totalProfit: number;
  timestamp: number;
  _synced: boolean;
  _serverId?: string; // Server ID after sync
}

interface OfflineStore {
  // Products
  products: OfflineProduct[];
  setProducts: (products: OfflineProduct[]) => void;
  addProduct: (product: OfflineProduct) => void;
  updateProduct: (id: string, updates: Partial<OfflineProduct>) => void;
  deleteProduct: (id: string) => void;
  
  // Transactions
  transactions: OfflineTransaction[];
  addTransaction: (transaction: Omit<OfflineTransaction, '_id' | '_synced'>) => void;
  markTransactionSynced: (localId: string, serverId: string) => void;
  removeSyncedTransactions: () => void;
  
  // Sync status
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  pendingSyncCount: number;
  
  // Sync operations
  syncProducts: () => Promise<void>;
  syncTransactions: () => Promise<void>;
  syncAll: () => Promise<void>;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      transactions: [],
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      pendingSyncCount: 0,

      // Products
      setProducts: (products) => set({ products }),
      
      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, { ...product, _isOffline: true }],
        })),
      
      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p._id === id ? { ...p, ...updates, _isOffline: true } : p
          ),
        })),
      
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p._id !== id),
        })),

      // Transactions
      addTransaction: (transaction) => {
        const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newTransaction: OfflineTransaction = {
          ...transaction,
          _id: localId,
          _synced: false,
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
          pendingSyncCount: state.transactions.filter((t) => !t._synced).length + 1,
        }));
      },
      
      markTransactionSynced: (localId, serverId) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t._id === localId ? { ...t, _synced: true, _serverId: serverId } : t
          ),
          pendingSyncCount: state.transactions.filter((t) => !t._synced && t._id !== localId).length,
        })),
      
      removeSyncedTransactions: () =>
        set((state) => ({
          transactions: state.transactions.filter((t) => !t._synced),
        })),

      // Online status
      setIsOnline: (online) => set({ isOnline: online }),

      // Sync operations (delegated to SyncService)
      syncProducts: async () => {
        // This is a placeholder - actual sync is handled by SyncService
        // Kept for backward compatibility
      },

      syncTransactions: async () => {
        // This is a placeholder - actual sync is handled by SyncService
        // Kept for backward compatibility
      },

      syncAll: async () => {
        // This is a placeholder - actual sync is handled by SyncService
        // Kept for backward compatibility
      },
    }),
    {
      name: 'genesis1-offline-store',
      version: 1,
    }
  )
);

// Listen to online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setIsOnline(true);
    // Auto-sync when coming online
    useOfflineStore.getState().syncAll().catch(console.error);
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setIsOnline(false);
  });
}

