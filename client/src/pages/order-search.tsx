import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/ui/animated-background";
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  RotateCcw,
  CheckCircle2,
  Tag,
  Calendar,
  Link,
  Loader2,
  Sparkles,
  PlayCircle,
  ArrowLeft,
  KeyRound,
  ShoppingCart,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const searchSchema = z.object({
  orderId: z.string().min(1, "Sipariş ID gerekli"),
});

type SearchData = z.infer<typeof searchSchema>;

interface OrderDetails {
  id: number;
  orderId: string;
  keyId: number;
  serviceId: number;
  quantity: number;
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'partial' | 'in_progress';
  message?: string;
  response?: any;
  createdAt: string;
  completedAt?: string;
  service: {
    id: number;
    name: string;
    platform: string;
    type: string;
  };
  key: {
    id: number;
    value: string;
    name: string;
  };
}

export default function OrderSearchEnhanced() {
  const { toast } = useToast();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const form = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
  });

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

  // Auto-refresh for pending/processing orders
  useEffect(() => {
    if (!orderDetails || !isAutoRefreshing) return;
    
    const shouldAutoRefresh = ['pending', 'processing', 'in_progress'].includes(orderDetails.status);
    
    if (shouldAutoRefresh) {
      const interval = setInterval(() => {
        searchOrderMutation.mutate({ orderId: orderDetails.orderId });
        setRefreshCount(prev => prev + 1);
      }, 10000); // 10 seconds
      
      return () => clearInterval(interval);
    } else {
      setIsAutoRefreshing(false);
    }
  }, [orderDetails, isAutoRefreshing]);

  const searchOrderMutation = useMutation({
    mutationFn: async (data: SearchData) => {
      const response = await apiRequest(`/api/orders/search/${data.orderId}`, {
        method: 'GET',
      });
      return response;
    },
    onSuccess: (data) => {
      const previousStatus = orderDetails?.status;
      setOrderDetails(data);
      setLastUpdate(new Date());
      
      // Show status change notification
      if (previousStatus && previousStatus !== data.status) {
        toast({
          title: "Sipariş Durumu Güncellendi",
          description: `Sipariş durumu: ${getStatusText(data.status)}`,
        });
      }
      
      // Start auto-refresh for pending/processing orders
      if (['pending', 'processing', 'in_progress'].includes(data.status)) {
        setIsAutoRefreshing(true);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Sipariş Bulunamadı",
        description: error.message || "Sipariş ID'si doğru değil veya sipariş mevcut değil.",
        variant: "destructive",
      });
      setOrderDetails(null);
      setIsAutoRefreshing(false);
    },
  });

  const onSubmit = (data: SearchData) => {
    setRefreshCount(0);
    searchOrderMutation.mutate(data);
  };

  const handleManualRefresh = () => {
    if (orderDetails) {
      searchOrderMutation.mutate({ orderId: orderDetails.orderId });
      setRefreshCount(prev => prev + 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500 to-green-500';
      case 'processing':
      case 'in_progress':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'partial':
        return 'bg-gradient-to-r from-orange-500 to-yellow-500';
      case 'failed':
      case 'cancelled':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'processing':
        return 'İşleniyor';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'pending':
        return 'Sipariş Alındı';
      case 'partial':
        return 'Kısmi Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'processing':
      case 'in_progress':
        return <Settings className="w-5 h-5 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'partial':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 25;
      case 'processing':
        return 50;
      case 'in_progress':
        return 75;
      case 'completed':
      case 'partial':
        return 100;
      case 'failed':
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  const progressSteps = [
    { key: 'pending', label: 'Sipariş Alındı', icon: Clock },
    { key: 'processing', label: 'İşleniyor', icon: Settings },
    { key: 'in_progress', label: 'Devam Ediyor', icon: PlayCircle },
    { key: 'completed', label: 'Tamamlandı', icon: CheckCircle },
  ];

  const getCurrentStepIndex = (status: string) => {
    if (status === 'completed' || status === 'partial') return 3;
    if (status === 'in_progress') return 2;
    if (status === 'processing') return 1;
    if (status === 'pending') return 0;
    return -1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <FloatingOrbs />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none"></div>
      
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

      {/* Enhanced Header */}
      <motion.header 
        className="bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/50 relative z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Search className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">Sipariş Sorgula</h1>
                <p className="text-slate-400">Siparişinizin durumunu kontrol edin</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = "/")}
                  className="text-slate-300 hover:text-white hover:bg-slate-800/50 neo-card px-6 py-3"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Satın Al
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="container mx-auto px-4 py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="neo-card bg-slate-800/70 border-slate-700/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center">
                  <Search className="w-6 h-6 mr-2 text-blue-400" />
                  Sipariş Arama
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Input
                        {...form.register("orderId")}
                        placeholder="Sipariş ID'sini giriniz..."
                        className="bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:border-blue-500 transition-all duration-300"
                      />
                      {form.formState.errors.orderId && (
                        <p className="text-red-400 text-sm mt-1">
                          {form.formState.errors.orderId.message}
                        </p>
                      )}
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={searchOrderMutation.isPending}
                        className="cyber-button w-full sm:w-auto px-8"
                      >
                        {searchOrderMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="w-4 h-4 mr-2" />
                        )}
                        Ara
                      </Button>
                    </motion.div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Details */}
          <AnimatePresence>
            {orderDetails && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Enhanced Progress Steps */}
                <Card className="neo-card bg-slate-800/70 border-slate-700/50 backdrop-blur-xl">
                  <CardContent className="p-8">
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-slate-50">Sipariş Durumu</h3>
                        {isAutoRefreshing && (
                          <motion.div 
                            className="flex items-center text-blue-400"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Activity className="w-4 h-4 mr-2" />
                            <span className="text-sm">Canlı takip aktif</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Progress Steps */}
                      <div className="relative">
                        <div className="flex items-center justify-between mb-8">
                          {progressSteps.map((step, index) => {
                            const currentIndex = getCurrentStepIndex(orderDetails.status);
                            const isActive = index <= currentIndex;
                            const isCurrent = index === currentIndex;
                            
                            return (
                              <motion.div
                                key={step.key}
                                className="flex flex-col items-center flex-1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                              >
                                <motion.div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-3 transition-all duration-500 ${
                                    isActive 
                                      ? 'bg-blue-500 border-blue-500 text-white' 
                                      : 'bg-slate-700 border-slate-600 text-slate-400'
                                  }`}
                                  animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <step.icon className="w-5 h-5" />
                                </motion.div>
                                <span className={`text-sm font-medium ${isActive ? 'text-slate-50' : 'text-slate-400'}`}>
                                  {step.label}
                                </span>
                              </motion.div>
                            );
                          })}
                        </div>

                        {/* Progress Bar */}
                        <div className="absolute top-6 left-6 right-6 h-0.5 bg-slate-700 -z-10">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            initial={{ width: "0%" }}
                            animate={{ width: `${(getCurrentStepIndex(orderDetails.status) / 3) * 100}%` }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                          />
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <Badge className={`${getStatusColor(orderDetails.status)} text-white px-6 py-2 text-base font-semibold`}>
                            {getStatusIcon(orderDetails.status)}
                            <span className="ml-2">{getStatusText(orderDetails.status)}</span>
                          </Badge>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Details Card */}
                <Card className="neo-card bg-slate-800/70 border-slate-700/50 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-50 flex items-center">
                        <Tag className="w-5 h-5 mr-2 text-purple-400" />
                        Sipariş Detayları
                      </CardTitle>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={handleManualRefresh}
                          variant="outline"
                          size="sm"
                          disabled={searchOrderMutation.isPending}
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${searchOrderMutation.isPending ? 'animate-spin' : ''}`} />
                          Yenile
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <div>
                          <label className="text-slate-400 text-sm">Sipariş ID</label>
                          <p className="text-slate-50 font-mono text-lg">{orderDetails.orderId}</p>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Servis</label>
                          <p className="text-slate-50">{orderDetails.service.name}</p>
                          <p className="text-slate-400 text-sm">{orderDetails.service.platform}</p>
                        </div>
                        <div>
                          <label className="text-slate-400 text-sm">Miktar</label>
                          <p className="text-slate-50">{orderDetails.quantity.toLocaleString()}</p>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="space-y-4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <div>
                          <label className="text-slate-400 text-sm">Oluşturulma Tarihi</label>
                          <p className="text-slate-50">{new Date(orderDetails.createdAt).toLocaleString('tr-TR')}</p>
                        </div>
                        {orderDetails.targetUrl && (
                          <div>
                            <label className="text-slate-400 text-sm">Hedef URL</label>
                            <p className="text-slate-50 break-all">{orderDetails.targetUrl}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-slate-400 text-sm">Anahtar</label>
                          <p className="text-slate-50 font-mono">{orderDetails.key.value}</p>
                        </div>
                      </motion.div>
                    </div>

                    {/* Auto-refresh Info */}
                    {lastUpdate && (
                      <motion.div 
                        className="pt-4 border-t border-slate-700/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
                          </div>
                          {refreshCount > 0 && (
                            <div className="flex items-center">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {refreshCount} kez yenilendi
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}