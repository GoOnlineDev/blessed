import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useOfflineStore } from './offline-store';

export function useProducts(role: string) {
  // Get products from Convex directly (real-time)
  const convexProducts = useQuery(api.products.list, { role });
  
  // Also track in offline store for offline functionality
  const { products: offlineProducts, isOnline } = useOfflineStore();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync Convex products to offline store when they change
  useEffect(() => {
    if (convexProducts && convexProducts.length > 0) {
      const store = useOfflineStore.getState();
      const formattedProducts = convexProducts.map((p: any) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        buyPrice: p.buyPrice !== undefined ? p.buyPrice : 0,
        sellPrice: p.sellPrice,
        stockQuantity: p.stockQuantity,
        imageUrl: p.imageUrl,
        _lastSynced: Date.now(),
        _isOffline: false,
      }));
      
      store.setProducts(formattedProducts);
      setHasInitialized(true);
    }
  }, [convexProducts]);

  // Determine which products to use
  const products = isOnline && convexProducts 
    ? convexProducts.map((p: any) => ({
        _id: p._id,
        name: p.name,
        sku: p.sku,
        buyPrice: p.buyPrice !== undefined ? p.buyPrice : 0,
        sellPrice: p.sellPrice,
        stockQuantity: p.stockQuantity,
        imageUrl: p.imageUrl,
        _isOffline: false,
      }))
    : offlineProducts;

  const isLoading = convexProducts === undefined && !hasInitialized;

  return {
    products: products || [],
    isLoading,
    error: null,
    refetch: () => {
      // Convex queries are reactive, no manual refetch needed
    },
  };
}
