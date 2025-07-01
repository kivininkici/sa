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
  PlayCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/hooks/use-theme";

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
    category: string;
    value: string;
    name: string;
  };
}

export default function OrderSearchPage() {
  const { toast } = useToast();
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const searchForm = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      orderId: ""
    }
  });

  // Auto-populate order ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    if (orderIdParam) {
      searchForm.setValue('orderId', orderIdParam);
      searchOrderMutation.mutate({ orderId: orderIdParam });
    }
  }, []);

  // Auto-refresh for pending/processing orders
  useEffect(() => {
    if (searchedOrder && (searchedOrder.status === 'pending' || searchedOrder.status === 'processing' || searchedOrder.status === 'in_progress')) {
      setIsAutoRefreshing(true);
      const interval = setInterval(() => {
        searchOrderMutation.mutate({ orderId: searchedOrder.orderId });
      }, 10000); // Every 10 seconds

      return () => {
        clearInterval(interval);
        setIsAutoRefreshing(false);
      };
    } else {
      setIsAutoRefreshing(false);
    }
  }, [searchedOrder]);

  // Search order mutation
  const searchOrderMutation = useMutation({
    mutationFn: async (data: SearchData & { forceRefresh?: boolean }) => {
      setIsSearching(true);
      setOrderNotFound(false);
      const url = `/api/orders/search/${data.orderId}${data.forceRefresh ? '?refresh=true' : ''}`;
      const response = await apiRequest("GET", url);
      return response.json();
    },
    onSuccess: (data: OrderDetails) => {
      // Check if status changed for existing order
      if (searchedOrder && searchedOrder.status !== data.status) {
        let statusMessage = '';
        if (data.status === 'cancelled') {
          statusMessage = 'Sipariş iptal edildi';
        } else if (data.status === 'completed') {
          statusMessage = 'Sipariş tamamlandı';
        } else if (data.status === 'failed') {
          statusMessage = 'Sipariş başarısız oldu';
        } else {
          statusMessage = `Durum güncellendi: ${data.status}`;
        }
        
        toast({
          title: "Durum Değişikliği",
          description: statusMessage,
          variant: data.status === 'cancelled' || data.status === 'failed' ? "destructive" : "default",
        });
      }
      
      setSearchedOrder(data);
      setLastUpdated(new Date());
      setIsSearching(false);
    },
    onError: (error) => {
      console.error("Order search error:", error);
      setOrderNotFound(true);
      setSearchedOrder(null);
      setIsSearching(false);
      toast({
        title: "Sipariş bulunamadı",
        description: "Girdiğiniz sipariş ID'si bulunamadı. Lütfen kontrol edip tekrar deneyin.",
        variant: "destructive",
      });
    }
  });

  const onSearch = (data: SearchData) => {
    searchOrderMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium">
            Tamamlandı
          </Badge>
        );
      case 'failed':
      case 'cancelled':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium">
            İptal
          </Badge>
        );
      case 'processing':
      case 'in_progress':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium">
            İşleniyor
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium">
            Sipariş Alındı
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium">
            Kısmi
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium">
            Bilinmiyor
          </Badge>
        );
    }
  };

  // Enhanced Progress Steps Component
  const ProgressSteps = ({ order }: { order: OrderDetails }) => {
    const steps = [
      { key: 'pending', label: 'Sipariş Alındı', icon: CheckCircle2 },
      { key: 'processing', label: 'İşleniyor', icon: Settings },
      { key: 'in_progress', label: 'Devam Ediyor', icon: PlayCircle },
      { key: 'completed', label: 'Tamamlandı', icon: CheckCircle }
    ];

    const getStepStatus = (stepIndex: number, orderStatus: string) => {
      switch (orderStatus) {
        case 'pending':
          return stepIndex === 0 ? 'active' : 'inactive';
        case 'processing':
          return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'active' : 'inactive';
        case 'in_progress':
          return stepIndex <= 1 ? 'completed' : stepIndex === 2 ? 'active' : 'inactive';
        case 'completed':
          return 'completed';
        case 'failed':
        case 'cancelled':
          return stepIndex === 0 ? 'completed' : stepIndex === 1 ? 'failed' : 'inactive';
        case 'partial':
          return stepIndex <= 2 ? 'completed' : 'inactive';
        default:
          return 'inactive';
      }
    };

    const getProgressPercentage = (orderStatus: string) => {
      switch (orderStatus) {
        case 'pending': return 25;
        case 'processing': return 50;
        case 'in_progress': return 75;
        case 'completed': return 100;
        case 'partial': return 75;
        case 'failed':
        case 'cancelled': return 50;
        default: return 0;
      }
    };

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative">
          {/* Progress Line Background */}
          <div className="absolute top-6 left-0 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${getProgressPercentage(order.status)}%` }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(index, order.status);
              
              return (
                <motion.div 
                  key={step.key} 
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  {/* Step Circle */}
                  <motion.div 
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full border-3 z-10 ${
                      status === 'completed' 
                        ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-800' 
                        : status === 'active'
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-800'
                          : status === 'failed'
                            ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-800'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
                  >
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: status === 'active' ? 360 : 0 }}
                      transition={{ 
                        duration: 2, 
                        repeat: status === 'active' ? Infinity : 0, 
                        ease: "linear" 
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                    
                    {/* Pulse effect for active step */}
                    {status === 'active' && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-blue-500 opacity-30"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>

                  {/* Step Label */}
                  <motion.div 
                    className="mt-3 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                  >
                    <p className={`text-sm font-medium transition-colors duration-500 ${
                      status === 'completed' 
                        ? 'text-green-600 dark:text-green-400' 
                        : status === 'active'
                          ? 'text-blue-600 dark:text-blue-400 font-semibold'
                          : status === 'failed'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Progress Percentage */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            <motion.div 
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              İlerleme: {getProgressPercentage(order.status)}%
            </span>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-500">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            className="flex justify-between items-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Sipariş Sorgulama</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 transition-colors duration-300">Sipariş durumunuzu takip edin</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 transition-all duration-500 hover:shadow-3xl">
                <CardContent className="p-8">
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300 flex items-center">
                      <Sparkles className="w-6 h-6 mr-2 text-blue-500" />
                      Sipariş ID
                    </h2>
                  </motion.div>
                  
                  <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <Input
                        placeholder="87963433"
                        className="h-14 text-lg border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 focus:scale-[1.02] focus:shadow-lg"
                        {...searchForm.register("orderId")}
                      />
                      <AnimatePresence>
                        {searchForm.formState.errors.orderId && (
                          <motion.p 
                            className="text-red-500 text-sm mt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {searchForm.formState.errors.orderId.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        disabled={isSearching}
                        className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        {isSearching ? (
                          <motion.div 
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sorgulanıyor...
                          </motion.div>
                        ) : (
                          <motion.div 
                            className="flex items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Search className="w-5 h-5 mr-2" />
                            Sorgula
                          </motion.div>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Success Message */}
                  <AnimatePresence>
                    {searchedOrder && (
                      <motion.div 
                        className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg transition-colors duration-300"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center text-green-800 dark:text-green-200">
                          <CheckCircle className="w-5 h-5 mr-2" />
                          <span className="font-medium">Sipariş bilgileri güncellendi</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Order Details */}
            <AnimatePresence>
              {searchedOrder && (
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 transition-all duration-500 hover:shadow-3xl overflow-hidden">
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {/* Order Header */}
                        <motion.div 
                          className="flex justify-between items-start"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div>
                            <motion.h3 
                              className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4, delay: 0.3 }}
                            >
                              Sipariş ID:
                            </motion.h3>
                            <motion.p 
                              className="text-2xl font-mono text-blue-600 dark:text-blue-400 mt-1 transition-colors duration-300"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.5, delay: 0.4 }}
                            >
                              {searchedOrder.orderId}
                            </motion.p>
                          </div>
                          <motion.div 
                            className="text-right"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          >
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">Durum:</p>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.4, delay: 0.5 }}
                              whileHover={{ scale: 1.05 }}
                            >
                              {getStatusBadge(searchedOrder.status)}
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        {/* Enhanced Progress Steps */}
                        <motion.div 
                          className="my-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: 0.4 }}
                        >
                          <ProgressSteps order={searchedOrder} />
                        </motion.div>

                        {/* Status Text */}
                        <motion.div 
                          className="text-center space-y-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.6 }}
                        >
                          <p className="text-lg text-gray-700 dark:text-gray-300 transition-colors duration-300">
                            Oluşturulma: <span className="font-semibold">
                              {searchedOrder.createdAt 
                                ? new Date(searchedOrder.createdAt).toLocaleString('tr-TR', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Bilinmiyor'
                              }
                            </span>
                          </p>
                          {lastUpdated && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                              Son güncelleme: {lastUpdated.toLocaleString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </p>
                          )}
                          {isAutoRefreshing && (
                            <div className="flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors duration-300">
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              <span className="text-sm">Otomatik yenileniyor...</span>
                            </div>
                          )}
                        </motion.div>

                        {/* Order Details Grid */}
                        <motion.div 
                          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.7 }}
                        >
                          <div className="space-y-4">
                            <motion.div 
                              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                              whileHover={{ scale: 1.02 }}
                            >
                              <Tag className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Kategori:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{searchedOrder.key.category}</p>
                              </div>
                            </motion.div>
                            <motion.div 
                              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                              whileHover={{ scale: 1.02 }}
                            >
                              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Miktar:</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{searchedOrder.quantity}</p>
                              </div>
                            </motion.div>
                          </div>
                          <div className="space-y-4">
                            <motion.div 
                              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                              whileHover={{ scale: 1.02 }}
                            >
                              <Link className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Hedef URL:</p>
                                <p className="font-semibold text-gray-900 dark:text-white text-sm break-all">{searchedOrder.targetUrl}</p>
                              </div>
                            </motion.div>
                            <motion.div 
                              className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                              whileHover={{ scale: 1.02 }}
                            >
                              <CheckCircle2 className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3" />
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Anahtar:</p>
                                <p className="font-semibold text-gray-900 dark:text-white font-mono text-sm">{searchedOrder.key.value}</p>
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>

                        {/* Manual Refresh Button */}
                        <motion.div 
                          className="text-center mt-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.8 }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button 
                              onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId, forceRefresh: true })}
                              disabled={searchOrderMutation.isPending}
                              variant="outline"
                              className="border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
                            >
                              <RefreshCw className={`w-4 h-4 mr-2 ${searchOrderMutation.isPending ? 'animate-spin' : ''}`} />
                              Manuel Yenile
                            </Button>
                          </motion.div>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order Not Found */}
            <AnimatePresence>
              {orderNotFound && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 transition-all duration-500">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
                      >
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        Sipariş Bulunamadı
                      </motion.h3>
                      <motion.p 
                        className="text-gray-600 dark:text-gray-300 transition-colors duration-300"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 }}
                      >
                        Girdiğiniz sipariş ID'si bulunamadı. Lütfen kontrol edip tekrar deneyin.
                      </motion.p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </ThemeProvider>
  );
}