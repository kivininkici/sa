import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, User } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLogin) => {
      const res = await apiRequest("POST", "/api/admin/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Giriş başarılı",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });
      // Redirect to admin dashboard
      window.location.href = "/admin/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Giriş başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLogin) => {
    setIsLoading(true);
    loginMutation.mutate(data);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-600/20 rounded-full">
                <Lock className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-50">
              Admin Girişi
            </CardTitle>
            <p className="text-slate-400">
              Yönetim paneline erişmek için giriş yapın
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Kullanıcı Adı
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Kullanıcı adınızı girin"
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-sm">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Şifre
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Şifrenizi girin"
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || loginMutation.isPending}
              >
                {isLoading || loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-400">
                Normal kullanıcı mısınız?{" "}
                <a href="/" className="text-blue-400 hover:text-blue-300">
                  Ana sayfaya dönün
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}