import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Settings,
  RotateCcw,
  CheckCircle2
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
  const [location] = useLocation();
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [orderNotFound, setOrderNotFound] = useState(false);

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

  // Auto-refresh order status every 30 seconds if order is found and not completed
  useEffect(() => {
    if (searchedOrder && !['completed', 'failed', 'cancelled'].includes(searchedOrder.status)) {
      const interval = setInterval(() => {
        searchOrderMutation.mutate({ orderId: searchedOrder.orderId });
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [searchedOrder]);

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
      toast({
        title: "Sipariş bilgileri güncellendi",
        description: `Sipariş durumu: ${getStatusText(data.status)}`,
      });
    },
    onError: (error: Error) => {
      setIsSearching(false);
      setSearchedOrder(null);
      setOrderNotFound(true);
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
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      case 'processing':
        return 'İşleniyor';
      case 'pending':
        return 'Beklemede';
      case 'partial':
        return 'Kısmi Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      default:
        return 'Bilinmiyor';
    }
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
            Beklemede
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium">
            İşleniyor
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

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Sipariş Alındı', icon: CheckCircle2 },
      { key: 'processing', label: 'İşleniyor', icon: Settings },
      { key: 'in_progress', label: 'Devam Ediyor', icon: RotateCcw },
      { key: 'completed', label: 'Tamamlandı', icon: CheckCircle }
    ];

    return steps.map((step, index) => {
      const isActive = 
        (status === 'pending' && index === 0) ||
        (status === 'processing' && index <= 1) ||
        (status === 'in_progress' && index <= 2) ||
        (status === 'completed' && index <= 3) ||
        (status === 'partial' && index <= 2) ||
        (status === 'failed' && index <= 1) ||
        (status === 'cancelled' && index <= 1);

      const isCompleted = 
        (status === 'processing' && index === 0) ||
        (status === 'in_progress' && index <= 1) ||
        (status === 'completed' && index <= 3) ||
        (status === 'partial' && index <= 2);

      const isFailed = (status === 'failed' || status === 'cancelled') && index > 0;

      return {
        ...step,
        isActive,
        isCompleted,
        isFailed
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

        {/* Main Content */}
        <div className="space-y-6">
          {/* Search Form */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Sipariş ID</h2>
              </div>
              
              <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
                <div>
                  <Input
                    placeholder="ord_bfudx3fi3"
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
                  <Search className="w-5 h-5 mr-2" />
                  {isSearching ? "Sorgulanıyor..." : "Sorgula"}
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
                      <p className="text-2xl font-mono text-blue-600 mt-1">
                        {searchedOrder.orderId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mb-2">Durum:</p>
                      {getStatusBadge(searchedOrder.status)}
                    </div>
                  </div>

                  {/* Status Text */}
                  <div className="text-center">
                    <p className="text-lg text-gray-700">
                      Oluşturulma: <span className="font-semibold">Bilinmiyor</span>
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="relative">
                    <div className="flex items-center justify-between relative z-10">
                      {getProgressSteps(searchedOrder.status).map((step, index) => {
                        const StepIcon = step.icon;
                        return (
                          <div key={step.key} className="flex flex-col items-center">
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                              ${step.isCompleted 
                                ? 'bg-blue-600 text-white' 
                                : step.isActive 
                                  ? 'bg-blue-600 text-white' 
                                  : step.isFailed
                                    ? 'bg-gray-300 text-gray-500'
                                    : 'bg-gray-300 text-gray-500'
                              }
                            `}>
                              <StepIcon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-medium text-center ${
                              step.isActive || step.isCompleted ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Progress Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-300">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: searchedOrder.status === 'completed' ? '100%' : 
                                 searchedOrder.status === 'in_progress' || searchedOrder.status === 'partial' ? '66%' :
                                 searchedOrder.status === 'processing' ? '33%' : '0%'
                        }}
                      />
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <div className="text-center pt-4">
                    <Button
                      variant="outline"
                      onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                      disabled={isSearching}
                      className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
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
        </div>
      </div>
    </div>
  );
}