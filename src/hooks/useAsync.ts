import { useState, useCallback, useEffect } from "react";

/**
 * A custom hook to handle asynchronous operations with loading and error states.
 * 
 * @param fn - The asynchronous function to execute.
 * @param fallback - The initial value for the data state.
 * @returns An object containing the data, loading state, error message, a refetch function, and a manual setData function.
 */
export function useAsync<T>(fn: () => Promise<T>, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refetch: run, setData };
}
