import { ConvexHttpClient } from "convex/browser";

// Create a lazy-loaded convex client for client-side sync
let _convex: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
  if (!_convex) {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
    }
    _convex = new ConvexHttpClient(convexUrl);
  }
  return _convex;
}

// For backwards compatibility
export const convex = typeof window !== 'undefined' 
  ? getConvexClient() 
  : null as unknown as ConvexHttpClient;
