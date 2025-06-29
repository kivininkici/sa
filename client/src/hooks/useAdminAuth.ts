import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface AdminUser {
  id: number;
  username: string;
  email?: string;
}

export function useAdminAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: admin,
    error,
    isLoading,
  } = useQuery<AdminUser | undefined, Error>({
    queryKey: ["/api/admin/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/me"], null);
      toast({
        title: "Çıkış başarılı",
        description: "Admin oturumunuz sonlandırıldı",
      });
      window.location.href = "/admin/login";
    },
    onError: (error: Error) => {
      toast({
        title: "Çıkış başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    admin,
    isLoading,
    error,
    isAuthenticated: !!admin,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}