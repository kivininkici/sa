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
    onSuccess: () => {
      setIsLoginLoading(false);
      setIsLoginSuccess(true);
      toast({
        title: "Kullanıcı Girişi Başarılı",
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
          transition={{ duration: 0.5 }}
        >
          <Button
            variant="ghost"
            onClick={() => (window.location.href = "/")}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardHeader className="text-center pb-8">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <KeyRound className="w-8 h-8 text-white" />
              </motion.div>

              <motion.div
                key={mode}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CardTitle className="text-3xl font-black text-white mb-2">
                  {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
                </CardTitle>
                <p className="text-slate-400">
                  {mode === "login"
                    ? "Hesabınıza giriş yapın ve key yönetimini başlatın"
                    : "Yeni hesap oluşturun ve hemen başlayın"}
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="relative min-h-[320px]">
                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4 absolute inset-0"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">
                          Kullanıcı Adı
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="Kullanıcı adınızı giriniz"
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
                        <Label htmlFor="password" className="text-white">
                          Şifre
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="Şifrenizi giriniz"
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
                        disabled={isLoginLoading || loginMutation.isPending || isLoginSuccess}
                        className={`w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 mt-6 ${
                          isLoginSuccess 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        }`}
                      >
                        {isLoginSuccess ? (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Kullanıcı Girişi Başarılı
                          </div>
                        ) : isLoginLoading || loginMutation.isPending ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Giriş yapılıyor...
                          </div>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4 mr-2" />
                            Giriş Yap
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="register"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4 absolute inset-0"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="reg-username" className="text-white">
                          Kullanıcı Adı
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="reg-username"
                            type="text"
                            placeholder="Kullanıcı Adınızı Seçiniz"
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="E-Mail Adresinizi Giriniz"
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
                        <Label htmlFor="reg-password" className="text-white">
                          Şifre
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="reg-password"
                            type="password"
                            placeholder="Şifre Oluşturunuz"
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
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
                        <Label
                          htmlFor="confirm-password"
                          className="text-white"
                        >
                          Şifre Tekrar
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Şifrenizi Tekrar Giriniz"
                            className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                            {...registerForm.register("confirmPassword")}
                          />
                        </div>
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm">
                            {
                              registerForm.formState.errors.confirmPassword
                                .message
                            }
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isRegisterLoading || registerMutation.isPending || isRegisterSuccess}
                        className={`w-full text-white font-semibold py-3 rounded-xl transition-all duration-300 mt-6 ${
                          isRegisterSuccess 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                            : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700'
                        }`}
                      >
                        {isRegisterSuccess ? (
                          <div className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Kayıt Başarılı
                          </div>
                        ) : isRegisterLoading || registerMutation.isPending ? (
                          <div className="flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Kayıt yapılıyor...
                          </div>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Kayıt Ol
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Mode Switch */}
              <motion.div
                className="pt-6 border-t border-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-center">
                  <p className="text-slate-400 mb-4">
                    {mode === "login"
                      ? "Henüz hesabınız yok mu?"
                      : "Zaten hesabınız var mı?"}
                  </p>
                  <Button
                    variant="ghost"
                    onClick={switchMode}
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300"
                  >
                    {mode === "login" ? "Kayıt Ol" : "Giriş Yap"}
                  </Button>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
