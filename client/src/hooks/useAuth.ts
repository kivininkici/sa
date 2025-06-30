import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  email?: string;
  authenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User | undefined>({
    queryKey: ["/api/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
