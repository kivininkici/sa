import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  KeyRound,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  CheckCircle,
  Loader2,
  UserPlus,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  confirmPassword: z.string().min(6, "Şifre tekrarı gereklidir"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Auth() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Tab indicator animation
  useEffect(() => {
    const indicator = document.querySelector('.tabs-indicator') as HTMLElement;
    if (indicator) {
      if (activeTab === "register") {
        indicator.style.transform = "translateX(100%)";
      } else {
        indicator.style.transform = "translateX(0%)";
      }
    }
  }, [activeTab]);

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
      const response = await apiRequest("POST", "/api/auth/login", data);
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error("JSON parse error:", error, "Response text:", responseText);
        throw new Error("Server response format error");
      }
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
      const response = await apiRequest("POST", "/api/auth/register", data);
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error("JSON parse error:", error, "Response text:", responseText);
        throw new Error("Server response format error");
      }
    },
    onSuccess: () => {
      setIsRegisterLoading(false);
      setIsRegisterSuccess(true);
      toast({
        title: "Kayıt Başarılı",
        description: "Hesabınız oluşturuldu! Yönlendiriliyorsunuz...",
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
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterData) => {
    setIsRegisterLoading(true);
    registerMutation.mutate(data);
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
                KeyPanel
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Hesabınıza giriş yapın veya yeni hesap oluşturun
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 relative overflow-hidden rounded-xl p-1 backdrop-blur-sm">
                  <motion.div 
                    className="absolute inset-y-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-lg shadow-lg tab-indicator-glow"
                    initial={false}
                    animate={{
                      x: activeTab === "login" ? "0%" : "calc(100% - 2px)",
                      width: "calc(50% - 2px)"
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 25,
                      duration: 0.7,
                      bounce: 0.2
                    }}
                  />
                  <TabsTrigger 
                    value="login" 
                    className="relative z-10 transition-all duration-500 ease-out data-[state=active]:text-white data-[state=active]:bg-transparent hover:text-white text-slate-300 rounded-lg py-3 font-medium"
                  >
                    <motion.div
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Giriş Yap
                    </motion.div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="relative z-10 transition-all duration-500 ease-out data-[state=active]:text-white data-[state=active]:bg-transparent hover:text-white text-slate-300 rounded-lg py-3 font-medium"
                  >
                    <motion.div
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kayıt Ol
                    </motion.div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <motion.div
                    key="login-content"
                    initial={{ opacity: 0, x: -20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: -20, y: -10 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.1
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isLoginSuccess ? (
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
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                          className="space-y-4 mt-6"
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
                              className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 auth-input transition-all duration-300"
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
                            <Input
                              id="login-password"
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="Şifreniz"
                              className="pr-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 auth-input transition-all duration-300"
                              {...loginForm.register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              {showLoginPassword ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
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
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12 font-medium btn-pulse transform hover:scale-105 transition-all duration-200"
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
                    )}
                  </AnimatePresence>
                  </motion.div>
                </TabsContent>

                <TabsContent value="register" className="mt-0">
                  <motion.div
                    key="register-content"
                    initial={{ opacity: 0, x: 20, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 20, y: -10 }}
                    transition={{ 
                      duration: 0.5, 
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.1
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isRegisterSuccess ? (
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
                        <p className="text-slate-400">Giriş sekmesine yönlendiriliyorsunuz...</p>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="register-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="space-y-4 mt-6"
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
                              className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 auth-input transition-all duration-300"
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
                            E-posta
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="E-posta adresiniz"
                              className="pl-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 auth-input transition-all duration-300"
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
                            <Input
                              id="register-password"
                              type={showRegisterPassword ? "text" : "password"}
                              placeholder="Şifreniz"
                              className="pr-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500 auth-input transition-all duration-300"
                              {...registerForm.register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              {showRegisterPassword ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          {registerForm.formState.errors.password && (
                            <p className="text-red-400 text-sm">
                              {registerForm.formState.errors.password.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password" className="text-slate-300">
                            Şifre Tekrarı
                          </Label>
                          <div className="relative">
                            <Input
                              id="register-confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Şifrenizi tekrar giriniz"
                              className="pr-10 bg-slate-700 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500"
                              {...registerForm.register("confirmPassword")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              {showConfirmPassword ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </button>
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
                          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white h-12 font-medium btn-pulse transform hover:scale-105 transition-all duration-200"
                        >
                          {isRegisterLoading || registerMutation.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Kayıt Oluşturuluyor...
                            </>
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
                  </motion.div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}