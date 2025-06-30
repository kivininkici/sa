import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Settings,
  RotateCcw,
  CheckCircle2,
  Package,
  Loader2
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

export default function OrderSearch() {
  const { toast } = useToast();
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const searchForm = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      orderId: ""
    }
  });

  // Auto-refresh effect for real-time updates
  useEffect(() => {
    if (searchedOrder && autoRefresh && (searchedOrder.status === 'pending' || searchedOrder.status === 'processing' || searchedOrder.status === 'in_progress')) {
      const interval = setInterval(() => {
        searchOrderMutation.mutate({ orderId: searchedOrder.orderId });
      }, 10000); // Refresh every 10 seconds

      return () => clearInterval(interval);
    }
  }, [searchedOrder, autoRefresh]);

  // Search order mutation
  const searchOrderMutation = useMutation({
    mutationFn: async (data: SearchData) => {
      setIsSearching(true);
      setOrderNotFound(false);
      const response = await apiRequest("GET", `/api/orders/search/${data.orderId}`);
      return response.json();
    },
    onSuccess: (data: OrderDetails) => {
      setSearchedOrder(data);
      setIsSearching(false);
      setOrderNotFound(false);
      setAutoRefresh(true); // Enable auto-refresh when order is found
      
      // Show appropriate message based on status
      const statusMessage = getStatusText(data.status);
      toast({
        title: "Sipariş bilgileri güncellendi",
        description: `Sipariş durumu: ${statusMessage}`,
      });
    },
    onError: (error: Error) => {
      setIsSearching(false);
      setSearchedOrder(null);
      setOrderNotFound(true);
      setAutoRefresh(false);
      toast({
        title: "Sipariş bulunamadı",
        description: "Lütfen sipariş ID'nizi kontrol edin",
        variant: "destructive",
      });
    },
  });

  const onSearch = (data: SearchData) => {
    searchOrderMutation.mutate(data);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'complete':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
      case 'canceled':
        return 'İptal Edildi';
      case 'processing':
      case 'in_progress':
        return 'İşleniyor';
      case 'pending':
        return 'Beklemede';
      case 'partial':
        return 'Kısmen Tamamlandı';
      default:
        return status || 'Bilinmiyor';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'complete':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium">
            Tamamlandı
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium">
            Başarısız
          </Badge>
        );
      case 'cancelled':
      case 'canceled':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium">
            İptal Edildi
          </Badge>
        );
      case 'processing':
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium animate-pulse">
            İşleniyor
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium">
            Beklemede
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium">
            Kısmen Tamamlandı
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium">
            {status || 'Bilinmiyor'}
          </Badge>
        );
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Sipariş Alındı', icon: Package },
      { key: 'processing', label: 'İşleniyor', icon: Settings },
      { key: 'in_progress', label: 'Devam Ediyor', icon: RotateCcw },
      { key: 'completed', label: 'Tamamlandı', icon: CheckCircle }
    ];

    const getCurrentStepIndex = (currentStatus: string) => {
      switch (currentStatus) {
        case 'pending':
          return 0;
        case 'processing':
          return 1;
        case 'in_progress':
          return 2;
        case 'completed':
        case 'complete':
          return 3;
        case 'partial':
          return 2; // Partial is between processing and completed
        case 'failed':
        case 'cancelled':
        case 'canceled':
          return 1; // Failed at processing stage
        default:
          return 0;
      }
    };

    const currentStep = getCurrentStepIndex(status);
    const isFailed = status === 'failed' || status === 'cancelled' || status === 'canceled';

    return steps.map((step, index) => {
      const isCompleted = !isFailed && index < currentStep;
      const isActive = index === currentStep;
      const isFailedStep = isFailed && index > currentStep;

      return {
        ...step,
        isActive,
        isCompleted,
        isFailed: isFailedStep
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Ürün Anahtarınızı Giriniz
          </h1>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="create">Sipariş Oluştur</TabsTrigger>
            <TabsTrigger value="search">Sipariş Sorgula</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search Form */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Sipariş ID</h2>
                </div>
                
                <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Sipariş ID'nizi giriniz"
                      className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500"
                      {...searchForm.register("orderId")}
                    />
                    {searchForm.formState.errors.orderId && (
                      <p className="text-red-500 text-sm mt-2">
                        {searchForm.formState.errors.orderId.message}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSearching}
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sorgulanıyor...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5 mr-2" />
                        Sorgula
                      </>
                    )}
                  </Button>
                </form>

                {/* Success Message */}
                {searchedOrder && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Sipariş bilgileri güncellendi</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Details */}
            {searchedOrder && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Order Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Sipariş ID:</h3>
                        <p className="text-2xl font-mono text-blue-600 mt-1 break-all">
                          {searchedOrder.orderId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-2">Durum:</p>
                        {getStatusBadge(searchedOrder.status)}
                      </div>
                    </div>

                    {/* Current Status Display */}
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-800 mb-2">
                        {getStatusText(searchedOrder.status)}
                      </p>
                      {searchedOrder.message && (
                        <p className="text-sm text-gray-600">{searchedOrder.message}</p>
                      )}
                      {autoRefresh && (searchedOrder.status === 'pending' || searchedOrder.status === 'processing' || searchedOrder.status === 'in_progress') && (
                        <p className="text-xs text-blue-600 mt-2 flex items-center justify-center">
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Otomatik güncelleniyor...
                        </p>
                      )}
                    </div>

                    {/* Progress Steps */}
                    <div className="py-8">
                      <div className="flex items-center justify-between relative">
                        {getProgressSteps(searchedOrder.status).map((step, index) => {
                          const StepIcon = step.icon;
                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                              <div className={`
                                w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-500 shadow-lg
                                ${step.isCompleted 
                                  ? 'bg-green-500 text-white scale-110' 
                                  : step.isActive 
                                    ? 'bg-blue-600 text-white scale-110 animate-pulse' 
                                    : step.isFailed
                                      ? 'bg-red-400 text-white'
                                      : 'bg-gray-300 text-gray-500'
                                }
                              `}>
                                <StepIcon className="w-8 h-8" />
                              </div>
                              <span className={`text-sm font-semibold text-center px-2 ${
                                step.isActive 
                                  ? 'text-blue-600' 
                                  : step.isCompleted 
                                    ? 'text-green-600' 
                                    : step.isFailed
                                      ? 'text-red-500'
                                      : 'text-gray-500'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                        
                        {/* Progress Line */}
                        <div className="absolute top-8 left-8 right-8 h-1 bg-gray-200 rounded">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded transition-all duration-1000 ease-in-out"
                            style={{
                              width: 
                                searchedOrder.status === 'completed' || searchedOrder.status === 'complete' ? '100%' : 
                                searchedOrder.status === 'in_progress' || searchedOrder.status === 'partial' ? '66%' :
                                searchedOrder.status === 'processing' ? '33%' : 
                                searchedOrder.status === 'pending' ? '0%' : '33%'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Servis</h4>
                        <p className="text-gray-600">{searchedOrder.service.name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Miktar</h4>
                        <p className="text-gray-600">{searchedOrder.quantity.toLocaleString()}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Hedef URL</h4>
                        <p className="text-gray-600 text-sm break-all">{searchedOrder.targetUrl}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Oluşturma Tarihi</h4>
                        <p className="text-gray-600 text-sm">{new Date(searchedOrder.createdAt).toLocaleString('tr-TR')}</p>
                      </div>
                    </div>

                    {/* Refresh Button */}
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                        disabled={isSearching}
                        className="px-8 py-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 hover:border-blue-400 font-medium"
                      >
                        {isSearching ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        Yenile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Not Found */}
            {orderNotFound && (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Sipariş Bulunamadı</h3>
                  <p className="text-gray-500">
                    Aradığınız sipariş ID'si bulunamadı. Lütfen doğru ID'yi girdiğinizden emin olun.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Sipariş Oluştur</h3>
                <p className="text-gray-500">
                  Sipariş oluşturma özelliği yakında eklenecek...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}