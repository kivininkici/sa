import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/ui/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Search,
  Package,
  ShoppingCart,
  Clock,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const keyValidationSchema = z.object({
  keyValue: z.string().min(1, "Key değeri gerekli"),
});

const orderSchema = z.object({
  keyValue: z.string().min(1),
  serviceId: z.number().min(1),
  quantity: z.number().min(1, "Miktar en az 1 olmalı"),
  targetUrl: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\//.test(val), {
    message: "Geçerli bir URL giriniz"
  }),
});

type KeyValidationData = z.infer<typeof keyValidationSchema>;
type OrderData = z.infer<typeof orderSchema>;

interface ValidatedKey {
  id: number;
  value: string;
  category: string;
  maxQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  service: {
    id: number;
    name: string;
    platform: string;
    type: string;
  };
}

interface OrderHistory {
  id: number;
  orderId: string;
  keyId: number;
  serviceId: number;
  quantity: number;
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
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

function UserInterface() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'key-entry' | 'order-form' | 'order-tracking'>('key-entry');
  const [validatedKey, setValidatedKey] = useState<ValidatedKey | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create-order' | 'order-history'>('create-order');

  // Form configurations
  const keyForm = useForm<KeyValidationData>({
    resolver: zodResolver(keyValidationSchema),
  });

  const orderForm = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
  });

  // Key validation mutation
  const validateKeyMutation = useMutation({
    mutationFn: async (data: KeyValidationData) => {
      const response = await apiRequest(`/api/keys/validate`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setValidatedKey(data);
      setCurrentStep('order-form');
      orderForm.setValue('keyValue', data.value);
      toast({
        title: "Key Doğrulandı",
        description: `${data.service.name} servisi için key başarıyla doğrulandı.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Key Doğrulama Hatası",
        description: error.message || "Key doğrulanırken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderData) => {
      const response = await apiRequest(`/api/orders`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setOrderId(data.orderId);
      setCurrentStep('order-tracking');
      toast({
        title: "Sipariş Oluşturuldu",
        description: `Sipariş ${data.orderId} başarıyla oluşturuldu.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sipariş Hatası",
        description: error.message || "Sipariş oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Order history query
  const { data: orderHistory } = useQuery({
    queryKey: ['/api/orders/user'],
    enabled: isAuthenticated,
  });

  // Order tracking by ID
  const { data: orderTracking } = useQuery({
    queryKey: ['/api/orders/track', orderId],
    enabled: !!orderId && currentStep === 'order-tracking',
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const onKeySubmit = (data: KeyValidationData) => {
    validateKeyMutation.mutate(data);
  };

  const onOrderSubmit = (data: OrderData) => {
    if (!validatedKey) {
      toast({
        title: "Hata",
        description: "Önce bir key doğrulamalısınız.",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      ...data,
      serviceId: validatedKey.service.id,
    });
  };

  const resetForm = () => {
    keyForm.reset();
    orderForm.reset();
    setValidatedKey(null);
    setOrderId(null);
    setCurrentStep('key-entry');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'processing':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'processing':
        return 'İşleniyor';
      case 'pending':
        return 'Bekliyor';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <FloatingOrbs />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none"></div>
      
      {/* Enhanced Header */}
      <motion.header 
        className="bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/50 relative z-10"
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
                <Key className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">KeyPanel</h1>
                <p className="text-slate-400">Sosyal Medya Servis Platformu</p>
              </div>
            </motion.div>
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
                  onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Satın Al
                </Button>
              </motion.div>
              <AnimatePresence>
                {currentStep !== 'key-entry' && activeTab === 'create-order' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700 neo-card"
                    >
                      Yeni Sipariş
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <motion.main 
        className="container mx-auto px-4 py-8 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create-order' | 'order-history')}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <TabsList className="grid w-full grid-cols-2 bg-slate-800/70 border-slate-700/50 backdrop-blur-sm neo-card">
                <TabsTrigger value="create-order" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Sipariş Oluştur
                </TabsTrigger>
                <TabsTrigger value="order-history" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-300">
                  <Clock className="w-4 h-4 mr-2" />
                  Sipariş Geçmişi
                </TabsTrigger>
              </TabsList>
            </motion.div>
            
            <TabsContent value="create-order" className="mt-6">
              {/* Rest of the content remains the same... */}
              <div className="space-y-6">
                <Card className="neo-card bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <p className="text-slate-300 text-center">Sipariş oluşturma formu burada olacak...</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="order-history" className="mt-6">
              <Card className="neo-card bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-50 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-400" />
                    Sipariş Geçmişi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(!orderHistory || orderHistory.length === 0) && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-400 mb-2">
                        Henüz sipariş bulunamadı
                      </h3>
                      <p className="text-slate-500 mb-6">
                        İlk siparişinizi oluşturmak için "Sipariş Oluştur" sekmesini kullanın.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
    </div>
  );
}

export default UserInterface;