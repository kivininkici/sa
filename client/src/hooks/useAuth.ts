
import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    retry: false,
  });

  return {
    user: admin,
    isLoading,
    isAuthenticated: !!admin,
  };
}
