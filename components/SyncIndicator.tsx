"use client";

import { useOfflineStore } from '@/lib/stores/offline-store';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

export default function SyncIndicator({ role }: { role: string }) {
  const { isOnline, pendingSyncCount } = useOfflineStore();

  // Don't show anything if online and no pending items
  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  // Offline indicator
  if (!isOnline) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl shadow-lg">
        <WifiOff size={18} className="text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-800">You're offline</p>
          <p className="text-xs text-amber-600">
            {pendingSyncCount > 0 
              ? `${pendingSyncCount} changes waiting to sync` 
              : 'Working with cached data'}
          </p>
        </div>
      </div>
    );
  }

  // Online with pending sync
  if (pendingSyncCount > 0) {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl shadow-lg">
        <Cloud size={18} className="text-blue-600 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Syncing...</p>
          <p className="text-xs text-blue-600">{pendingSyncCount} items pending</p>
        </div>
      </div>
    );
  }

  return null;
}
