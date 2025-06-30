import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KeyRound,
  User,
  Mail,
  Lock,
  ArrowLeft,
  UserPlus,
  LogIn,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
    email: z.string().email("Geçerli bir email adresi giriniz"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: (data: any) => {
      setIsLoginLoading(false);
      setIsLoginSuccess(true);
      const userType = data.isAdmin ? 'Admin' : 'Kullanıcı';
      toast({
        title: `${userType} Girişi Başarılı`,
        description: "Hoş geldiniz!",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      setIsLoginLoading(false);
      setIsLoginSuccess(false);
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      setIsRegisterLoading(false);
      setIsRegisterSuccess(true);
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu ve giriş yapıldı!",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      setIsRegisterLoading(false);
      setIsRegisterSuccess(false);
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    setIsLoginLoading(true);
    setIsLoginSuccess(false);
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    setIsRegisterLoading(true);
    setIsRegisterSuccess(false);
    registerMutation.mutate(data);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back to home button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">
                {mode === "login" ? "Hesaba Giriş" : "Hesap Oluştur"}
              </CardTitle>
              <p className="text-slate-400 text-sm">
                {mode === "login" 
                  ? "Admin bilgileriniz otomatik algılanır" 
                  : "Yeni hesap oluşturun"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {mode === "login" ? (
                  isLoginSuccess ? (
                    <motion.div
                      key="login-success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-400">
                        Giriş Başarılı!
                      </h3>
                      <p className="text-slate-400">Yönlendiriliyor...</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="login-username" className="text-slate-300">
                          Kullanıcı Adı
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="login-username"
                            placeholder="Kullanıcı adınız"
                            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            {...loginForm.register("username")}
                          />
                        </div>
                        {loginForm.formState.errors.username && (
                          <p className="text-red-400 text-sm">
                            {loginForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password" className="text-slate-300">
                          Şifre
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="Şifreniz"
                            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            {...loginForm.register("password")}
                          />
                        </div>
                        {loginForm.formState.errors.password && (
                          <p className="text-red-400 text-sm">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoginLoading || loginMutation.isPending}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12 font-medium"
                      >
                        {isLoginLoading || loginMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Giriş Yapılıyor...
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4 mr-2" />
                            Giriş Yap
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )
                ) : (
                  isRegisterSuccess ? (
                    <motion.div
                      key="register-success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-400">
                        Kayıt Başarılı!
                      </h3>
                      <p className="text-slate-400">Yönlendiriliyor...</p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="register-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="register-username" className="text-slate-300">
                          Kullanıcı Adı
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="register-username"
                            placeholder="Kullanıcı adınız"
                            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            {...registerForm.register("username")}
                          />
                        </div>
                        {registerForm.formState.errors.username && (
                          <p className="text-red-400 text-sm">
                            {registerForm.formState.errors.username.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email" className="text-slate-300">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Email adresiniz"
                            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            {...registerForm.register("email")}
                          />
                        </div>
                        {registerForm.formState.errors.email && (
                          <p className="text-red-400 text-sm">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password" className="text-slate-300">
                          Şifre
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Şifreniz"
                            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            {...registerForm.register("password")}
                          />
                        </div>
                        {registerForm.formState.errors.password && (
                          <p className="text-red-400 text-sm">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password" className="text-slate-300">
                          Şifre Onayı
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            id="register-confirm-password"
                            type="password"
                            placeholder="Şifrenizi tekrar giriniz"
                            className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                            {...registerForm.register("confirmPassword")}
                          />
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm">
                            {registerForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isRegisterLoading || registerMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-12 font-medium"
                      >
                        {isRegisterLoading || registerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Hesap Oluşturuluyor...
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Hesap Oluştur
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )
                )}
              </AnimatePresence>

              {/* Mode Switch Button */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={switchMode}
                  className="text-slate-400 hover:text-white hover:bg-slate-800/50"
                >
                  {mode === "login" ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-slate-400 text-sm mt-6"
        >
          Admin bilgileriniz otomatik olarak algılanacaktır
        </motion.p>
      </div>
    </div>
  );
}