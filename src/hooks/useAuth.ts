import { useAuth as useAuthContext } from "@/providers/AuthProvider";

/**
 * Bridge to AuthProvider context. 
 * This maintains backwards compatibility with the existing useAuth hook usage
 * while ensuring all components share the same auth state and listeners.
 */
export const useAuth = () => {
  return useAuthContext();
};