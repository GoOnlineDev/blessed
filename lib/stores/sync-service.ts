import { api } from '@/convex/_generated/api';
import { useOfflineStore, OfflineProduct } from './offline-store';
import { ConvexReactClient } from 'convex/react';

// This service is now mainly for offline transaction syncing
// Product operations should use Convex mutations directly via useMutation hook
export class SyncService {
  /**
   * Add a product using Convex mutation
   * NOTE: This should be called from components using useMutation for better reactivity
   */
  static async addProductOffline(productData: {
    name: string;
    buyPrice: number;
    sellPrice: number;
    stockQuantity: number;
    imageUrl?: string;
  }): Promise<string> {
    const store = useOfflineStore.getState();
    
    // Generate temp ID for offline storage
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempSku = productData.name.toUpperCase().replace(/[^A-Z0-9]/g, "").substring(0, 10) || "PROD";
    
    // Add to offline store immediately
    store.addProduct({
      _id: tempId,
      sku: tempSku,
      ...productData,
      _isOffline: true,
    });
    
    return tempId;
  }

  /**
   * Update a product locally (offline store only)
   * Real updates should use Convex mutation
   */
  static async updateProductOffline(
    productId: string,
    updates: Partial<OfflineProduct>
  ): Promise<void> {
    const store = useOfflineStore.getState();
    store.updateProduct(productId, updates);
  }

  /**
   * Delete a product locally (offline store only)
   * Real deletes should use Convex mutation
   */
  static async deleteProductOffline(productId: string): Promise<void> {
    const store = useOfflineStore.getState();
    store.deleteProduct(productId);
  }

  /**
   * Add transaction (offline-first)
   */
  static async addTransaction(
    productId: string,
    userId: string,
    quantity: number,
    product: OfflineProduct
  ): Promise<void> {
    const store = useOfflineStore.getState();
    
    // Validate stock
    if (product.stockQuantity < quantity) {
      throw new Error(`Insufficient stock. Only ${product.stockQuantity} available.`);
    }
    
    const totalSale = product.sellPrice * quantity;
    const totalProfit = (product.sellPrice - product.buyPrice) * quantity;
    
    // Add transaction to offline store
    store.addTransaction({
      productId,
      userId,
      quantity,
      totalSale,
      totalProfit,
      timestamp: Date.now(),
    });
  }

  /**
   * Sync offline transactions to server
   * This is called automatically when coming online
   */
  static async syncTransactionsToServer(convexClient: ConvexReactClient): Promise<void> {
    const store = useOfflineStore.getState();
    const unsyncedTransactions = store.transactions.filter((t) => !t._synced);
    
    if (unsyncedTransactions.length === 0) {
      return;
    }
    
    for (const transaction of unsyncedTransactions) {
      try {
        // Skip if product ID is a temp ID
        if (transaction.productId.startsWith('temp_')) {
          continue;
        }
        
        // Create transaction on server
        const result = await convexClient.mutation(api.transactions.create, {
          productId: transaction.productId as any,
          userId: transaction.userId as any,
          quantity: transaction.quantity,
        });
        
        // Mark as synced
        store.markTransactionSynced(transaction._id, result.transactionId.toString());
      } catch (error: any) {
        if (error?.message?.includes("Insufficient stock") || error?.message?.includes("not found")) {
          store.markTransactionSynced(transaction._id, 'skipped');
        }
      }
    }
    
    // Clean up old synced transactions (older than 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const oldSynced = store.transactions.filter(
      (t) => t._synced && t.timestamp < sevenDaysAgo
    );
    
    if (oldSynced.length > 0) {
      store.removeSyncedTransactions();
    }
  }
}
