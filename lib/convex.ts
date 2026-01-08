import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined in environment variables");
}

// Create client with retry and timeout handling
export const convex = new ConvexHttpClient(convexUrl);

/**
 * Executes a Convex mutation with retry logic.
 */
export async function runMutation<T>(
  mutation: any,
  args: any,
  maxRetries: number = 2
): Promise<T> {
  return await queryWithRetry(
    () => convex.mutation(mutation, args),
    maxRetries
  );
}

/**
 * Executes a Convex query with retry logic.
 */
export async function runQuery<T>(
  query: any,
  args: any,
  maxRetries: number = 2
): Promise<T> {
  return await queryWithRetry(
    () => convex.query(query, args),
    maxRetries
  );
}

// Helper function to query with retry logic
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || String(error);

      // Only log warnings for retries, not for the final failure
      if (attempt < maxRetries) {
        console.warn(`Convex query attempt ${attempt}/${maxRetries} failed, retrying...`, errorMsg);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  // Wrap the error to provide better context
  if (lastError) {
    const wrappedError = new Error(
      `Convex query failed after ${maxRetries} attempts: ${lastError.message || String(lastError)}`
    );
    wrappedError.cause = lastError;
    throw wrappedError;
  }

  throw new Error("Convex query failed: Unknown error");
}

// Helper for safe queries that return fallback on failure
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await queryWithRetry(queryFn);
  } catch (error: any) {
    // Silently return fallback - this is expected behavior for graceful degradation
    // Only log in development to help with debugging
    if (process.env.NODE_ENV === 'development') {
      const errorMsg = error?.message || error?.cause?.message || String(error);
      console.warn("Convex query failed, using fallback:", errorMsg);
    }
    return fallback;
  }
}
