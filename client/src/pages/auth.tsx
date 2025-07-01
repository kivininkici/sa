import { useState, useEffect, useRef } from "react";
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
  Sparkles,
  Crown,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/ui/animated-background";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mouse tracking effect
  useEffect(() => {
    let rafId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

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
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Enhanced Background Effects */}
      <FloatingOrbs />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 pointer-events-none"></div>
      
      {/* Advanced Mouse tracking effect */}
      <motion.div
        className="fixed w-48 h-48 bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-cyan-400/15 rounded-full blur-2xl pointer-events-none z-10"
        style={{
          x: mousePosition.x - 96,
          y: mousePosition.y - 96,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Floating particles specific to auth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, -15, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Enhanced Back to home button */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 neo-card px-6 py-3 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </motion.div>
        </motion.div>

        {/* Enhanced Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 80 }}
          className="perspective-1000"
        >
          <Card className="neo-card bg-slate-800/70 border-slate-700/50 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
            <CardHeader className="text-center pb-8 relative overflow-hidden">
              {/* Animated background element */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-t-xl"></div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 100 }}
                className="relative z-10"
              >
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg relative"
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -10, 10, 0],
                    boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)"
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <KeyRound className="w-10 h-10 text-white drop-shadow-lg" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl opacity-0"
                    whileHover={{ opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="relative z-10"
              >
                <CardTitle className="text-3xl font-bold gradient-text mb-3">
                  KeyPanel
                </CardTitle>
                <motion.p 
                  className="text-slate-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Hesabınıza giriş yapın veya yeni hesap oluşturun
                </motion.p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 relative overflow-hidden rounded-xl p-0 backdrop-blur-sm">
                  <motion.div 
                    className="absolute inset-y-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-xl shadow-lg tab-indicator-glow"
                    initial={{ x: "0%" }}
                    animate={{
                      x: activeTab === "register" ? "100%" : "0%"
                    }}
                    transition={{
                      type: "tween",
                      duration: 0.3,
                      ease: [0.4, 0.0, 0.2, 1]
                    }}
                    style={{ width: "50%" }}
                  />
                  <TabsTrigger 
                    value="login" 
                    className="relative z-10 transition-all duration-300 ease-out data-[state=active]:text-white data-[state=active]:bg-transparent hover:text-white text-slate-300 rounded-xl py-4 font-medium h-full flex items-center justify-center"
                  >
                    <motion.div
                      className="flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Giriş Yap
                    </motion.div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="relative z-10 transition-all duration-300 ease-out data-[state=active]:text-white data-[state=active]:bg-transparent hover:text-white text-slate-300 rounded-xl py-4 font-medium h-full flex items-center justify-center"
                  >
                    <motion.div
                      className="flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Kayıt Ol
                    </motion.div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <motion.div
                    key="login-content"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.4, 0.0, 0.2, 1],
                      delay: 0.05
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isLoginSuccess ? (
                        <>
                          {/* Success Wave Effect - Multiple layers like admin */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 8, 12], opacity: [0, 0.08, 0] }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-blue-400/15 via-blue-500/8 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 6, 10], opacity: [0, 0.12, 0] }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-cyan-400/20 via-blue-400/10 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 4, 8], opacity: [0, 0.15, 0] }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-blue-300/25 via-cyan-400/12 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 2, 5], opacity: [0, 0.18, 0] }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-blue-200/30 via-blue-300/15 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          
                          <motion.div
                            key="login-success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-4 relative z-10"
                          >
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                              className="relative z-10 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/50"
                            >
                              {/* Animated Circle Glow */}
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1.2, 1], opacity: [0, 0.5, 0] }}
                                transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                                className="absolute inset-0 bg-blue-400/30 rounded-full blur-md"
                              />
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1.4, 1], opacity: [0, 0.3, 0] }}
                                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                                className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg"
                              />
                              {/* Animated Checkmark */}
                              <svg 
                                width="32" 
                                height="32" 
                                viewBox="0 0 32 32" 
                                className="text-white relative z-10"
                              >
                                <motion.path
                                  d="M8 16l6 6 12-12"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ 
                                    pathLength: { duration: 0.8, delay: 0.6, ease: "easeInOut" },
                                    opacity: { duration: 0.2, delay: 0.6 }
                                  }}
                                />
                              </svg>
                            </motion.div>
                            <motion.h3
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.8 }}
                              className="text-xl font-semibold text-blue-400 relative z-10"
                            >
                              Giriş Başarılı!
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 1 }}
                              className="text-slate-400 relative z-10"
                            >
                              Yönlendiriliyor...
                            </motion.p>
                          </motion.div>
                        </>
                      ) : (
                        <motion.form
                          key="login-form"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
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
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.4, 0.0, 0.2, 1],
                      delay: 0.05
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isRegisterSuccess ? (
                        <>
                          {/* Success Wave Effect - Multiple layers like admin */}
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 8, 12], opacity: [0, 0.08, 0] }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-blue-400/15 via-blue-500/8 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 6, 10], opacity: [0, 0.12, 0] }}
                            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-cyan-400/20 via-blue-400/10 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 4, 8], opacity: [0, 0.15, 0] }}
                            transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-blue-300/25 via-cyan-400/12 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 2, 5], opacity: [0, 0.18, 0] }}
                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                            className="fixed inset-0 -z-10 bg-gradient-radial from-blue-200/30 via-blue-300/15 to-transparent pointer-events-none"
                            style={{ transformOrigin: 'center center' }}
                          />
                          
                          <motion.div
                            key="register-success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 space-y-4 relative z-10"
                          >
                            <motion.div
                              initial={{ scale: 0.5, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.5, delay: 0.3 }}
                              className="relative z-10 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/50"
                            >
                              {/* Animated Checkmark */}
                              <svg 
                                width="32" 
                                height="32" 
                                viewBox="0 0 32 32" 
                                className="text-white"
                              >
                                <motion.path
                                  d="M8 16l6 6 12-12"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  fill="none"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ 
                                    pathLength: { duration: 0.8, delay: 0.6, ease: "easeInOut" },
                                    opacity: { duration: 0.2, delay: 0.6 }
                                  }}
                                />
                              </svg>
                            </motion.div>
                            <motion.h3
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 0.8 }}
                              className="text-xl font-semibold text-blue-400 relative z-10"
                            >
                              Kayıt Başarılı!
                            </motion.h3>
                            <motion.p
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.5, delay: 1 }}
                              className="text-slate-400 relative z-10"
                            >
                              Giriş sekmesine yönlendiriliyorsunuz...
                            </motion.p>
                          </motion.div>
                        </>
                    ) : (
                      <motion.form
                        key="register-form"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: [0.4, 0.0, 0.2, 1] }}
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