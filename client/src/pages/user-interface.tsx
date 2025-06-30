import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Key, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Search,
  Package,
  ShoppingCart
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

export default function UserInterface() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'key-entry' | 'order-form' | 'order-tracking'>('key-entry');
  const [validatedKey, setValidatedKey] = useState<ValidatedKey | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const keyForm = useForm<KeyValidationData>({
    resolver: zodResolver(keyValidationSchema),
    defaultValues: {
      keyValue: "",
    },
  });

  const orderForm = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      targetUrl: "",
    },
  });

  // Key validation mutation
  const validateKeyMutation = useMutation({
    mutationFn: async (data: KeyValidationData) => {
      const response = await apiRequest("POST", "/api/validate-key", { key: data.keyValue });
      return response.json();
    },
    onSuccess: (data: ValidatedKey) => {
      setValidatedKey(data);
      orderForm.setValue("keyValue", data.value);
      orderForm.setValue("quantity", Math.min(data.remainingQuantity || 1, 1));
      setCurrentStep('order-form');
      toast({
        title: "Key Doğrulandı",
        description: "Sipariş verebilirsiniz",
      });
    },
    onError: (error: Error) => {
      // Check if it's maintenance mode error
      if (error.message.includes("bakım modunda")) {
        toast({
          title: "Bakım Modu",
          description: "Sistem şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Key Doğrulama Hatası",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderData) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: (data: { orderId: string }) => {
      setOrderId(data.orderId);
      setCurrentStep('order-tracking');
      toast({
        title: "Sipariş Oluşturuldu",
        description: `Sipariş ID: ${data.orderId}`,
      });
    },
    onError: (error: Error) => {
      // Check if it's maintenance mode error
      if (error.message.includes("bakım modunda")) {
        toast({
          title: "Bakım Modu",
          description: "Sistem şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sipariş Oluşturma Hatası",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Type for order status response
  interface OrderStatus {
    orderId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    createdAt: string;
    completedAt?: string;
  }

  // Order status query
  const { data: orderStatus, isLoading: orderStatusLoading } = useQuery<OrderStatus>({
    queryKey: ["/api/orders/status", orderId],
    enabled: !!orderId && currentStep === 'order-tracking',
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const onKeySubmit = (data: KeyValidationData) => {
    validateKeyMutation.mutate(data);
  };

  const onOrderSubmit = (data: OrderData) => {
    if (!validatedKey) return;
    
    // Check remaining quantity
    const maxAllowed = validatedKey.remainingQuantity || validatedKey.maxQuantity;
    if (data.quantity > maxAllowed) {
      toast({
        title: "Miktar Hatası",
        description: `Maksimum ${maxAllowed} sipariş verebilirsiniz`,
        variant: "destructive",
      });
      return;
    }
    
    // Send order with serviceId from validated key
    createOrderMutation.mutate({
      keyValue: validatedKey.value,
      serviceId: validatedKey.service.id,
      quantity: data.quantity,
      targetUrl: data.targetUrl
    });
  };

  const resetForm = () => {
    setCurrentStep('key-entry');
    setValidatedKey(null);
    setOrderId(null);
    keyForm.reset();
    orderForm.reset();
  };

  // Login required check
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Giriş Gerekli</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-300">
              Key kullanmak için önce hesabınıza giriş yapmalısınız.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Giriş Yap
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Ana Sayfaya Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Key className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-slate-950/50 backdrop-blur-sm border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-50">KeyPanel</h1>
                <p className="text-slate-400">Sosyal Medya Servis Platformu</p>
              </div>
            </div>
            {currentStep !== 'key-entry' && (
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Yeni Sipariş
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'key-entry' ? 'text-blue-400' : 'text-green-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'key-entry' ? 'bg-blue-600' : 'bg-green-600'}`}>
                  {currentStep === 'key-entry' ? '1' : <CheckCircle className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium">Key Girişi</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className={`flex items-center space-x-2 ${currentStep === 'order-form' ? 'text-blue-400' : currentStep === 'order-tracking' ? 'text-green-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'order-form' ? 'bg-blue-600' : currentStep === 'order-tracking' ? 'bg-green-600' : 'bg-slate-600'}`}>
                  {currentStep === 'order-tracking' ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-sm font-medium">Sipariş</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className={`flex items-center space-x-2 ${currentStep === 'order-tracking' ? 'text-blue-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'order-tracking' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Takip</span>
              </div>
            </div>
          </div>

          {/* Step 1: Key Entry */}
          {currentStep === 'key-entry' && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader className="text-center">
                <CardTitle className="text-slate-50 flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Key Doğrulama</span>
                </CardTitle>
                <p className="text-slate-400">Servis key'inizi girin</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={keyForm.handleSubmit(onKeySubmit)} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Key değerini giriniz..."
                      className="bg-slate-700 border-slate-600 text-slate-50 text-center text-lg h-12"
                      {...keyForm.register("keyValue")}
                    />
                    {keyForm.formState.errors.keyValue && (
                      <p className="text-red-400 text-sm mt-1 text-center">
                        {keyForm.formState.errors.keyValue.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={validateKeyMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                  >
                    {validateKeyMutation.isPending ? "Doğrulanıyor..." : "Key Doğrula"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Order Form */}
          {currentStep === 'order-form' && validatedKey && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Sipariş Detayları</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-4">
                  <div>
                    <label className="text-slate-200 text-sm font-medium mb-2 block">
                      Miktar (1-{validatedKey.remainingQuantity || validatedKey.maxQuantity})
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={validatedKey.remainingQuantity || validatedKey.maxQuantity}
                      className="bg-slate-700 border-slate-600 text-slate-50"
                      {...orderForm.register("quantity", { 
                        valueAsNumber: true,
                        min: 1,
                        max: validatedKey.remainingQuantity || validatedKey.maxQuantity 
                      })}
                    />
                    {orderForm.formState.errors.quantity && (
                      <p className="text-red-400 text-sm mt-1">
                        {orderForm.formState.errors.quantity.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-200 text-sm font-medium mb-2 block">
                      Hedef URL (isteğe bağlı)
                    </label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-slate-50"
                      {...orderForm.register("targetUrl")}
                    />
                    {orderForm.formState.errors.targetUrl && (
                      <p className="text-red-400 text-sm mt-1">
                        {orderForm.formState.errors.targetUrl.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={createOrderMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 h-12"
                  >
                    {createOrderMutation.isPending ? "Sipariş Oluşturuluyor..." : "Siparişi Oluştur"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Order Tracking */}
          {currentStep === 'order-tracking' && orderId && (
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-50 flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Sipariş Takibi</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-mono text-blue-400 mb-2">
                    #{orderId}
                  </div>
                  <p className="text-slate-400">Sipariş Numarası</p>
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-3">
                  {orderStatusLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-slate-400">Sipariş durumu kontrol ediliyor...</p>
                    </div>
                  ) : orderStatus ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Durum:</span>
                        <Badge variant={orderStatus.status === 'completed' ? 'default' : 'secondary'}>
                          {orderStatus.status === 'pending' && 'Beklemede'}
                          {orderStatus.status === 'processing' && 'İşleniyor'}
                          {orderStatus.status === 'completed' && 'Tamamlandı'}
                          {orderStatus.status === 'failed' && 'Başarısız'}
                        </Badge>
                      </div>
                      {orderStatus.message && (
                        <div className="bg-slate-700/50 rounded p-3">
                          <p className="text-slate-300 text-sm">{orderStatus.message}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                      <p className="text-slate-400">Sipariş durumu alınamadı</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}