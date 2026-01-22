import { useEffect, useCallback } from 'react';
import { useOfflineStore } from '@/lib/stores/offline-store';

export function useOfflineSync(role: string) {
  const { isOnline, pendingSyncCount } = useOfflineStore();

  // Note: With Convex's reactive queries, syncing happens automatically
  // This hook now mainly tracks online/offline status and pending count

  const manualSync = useCallback(async () => {
    if (!isOnline) {
      throw new Error('Cannot sync while offline');
    }
    // Convex handles sync automatically via reactive queries
    // This is just a placeholder for any manual sync needs
    console.log('Manual sync requested - Convex handles this automatically');
  }, [isOnline]);

  return {
    isOnline,
    pendingSyncCount,
    manualSync,
  };
}
