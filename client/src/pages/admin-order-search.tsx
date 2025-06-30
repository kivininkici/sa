import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  RefreshCw, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";

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

export default function AdminOrderSearch() {
  const { toast } = useToast();
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchForm = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
  });

  // Search order mutation
  const searchOrderMutation = useMutation({
    mutationFn: async (data: SearchData) => {
      setIsSearching(true);
      const response = await apiRequest("GET", `/api/admin/orders/search/${data.orderId}`);
      return response.json();
    },
    onSuccess: (data: OrderDetails) => {
      setSearchedOrder(data);
      setIsSearching(false);
      toast({
        title: "Sipariş Bulundu",
        description: `Sipariş #${data.orderId} detayları görüntüleniyor`,
      });
    },
    onError: (error: Error) => {
      setIsSearching(false);
      setSearchedOrder(null);
      toast({
        title: "Sipariş Bulunamadı",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resend order mutation
  const resendOrderMutation = useMutation({
    mutationFn: async () => {
      if (!searchedOrder) throw new Error("Sipariş bulunamadı");
      
      const response = await apiRequest("POST", "/api/admin/orders/resend", {
        orderId: searchedOrder.orderId,
        serviceId: searchedOrder.serviceId,
        quantity: searchedOrder.quantity,
        targetUrl: searchedOrder.targetUrl
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sipariş Tekrar Gönderildi",
        description: `Yeni sipariş ID: #${data.orderId}`,
      });
      // Refresh the searched order
      if (searchedOrder) {
        searchOrderMutation.mutate({ orderId: searchedOrder.orderId });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sipariş Gönderilemedi",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSearch = (data: SearchData) => {
    searchOrderMutation.mutate(data);
  };

  const onResend = () => {
    if (!searchedOrder) return;
    resendOrderMutation.mutate();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Tamamlandı</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Başarısız</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />İptal</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />İşleniyor</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Sipariş Sorgula"
        description="Sipariş ID ile sipariş detaylarını görüntüleyin ve tekrar gönderin"
      />
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Sipariş Ara</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchForm.handleSubmit(onSearch)} className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Sipariş ID girin (ör: 458485)"
                className="h-12"
                {...searchForm.register("orderId")}
              />
              {searchForm.formState.errors.orderId && (
                <p className="text-red-500 text-sm mt-1">
                  {searchForm.formState.errors.orderId.message}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              disabled={isSearching}
              className="h-12 px-8"
            >
              {isSearching ? "Aranıyor..." : "Ara"}
            </Button>
          </form>
        </CardContent>
      </Card>
      {/* Order Details */}
      {searchedOrder && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Sipariş Detayları</span>
              </div>
              <div className="text-2xl font-mono text-blue-600">
                #{searchedOrder.orderId}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Durum:</span>
              {getStatusBadge(searchedOrder.status)}
            </div>

            <Separator />

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Servis</label>
                  <p className="font-semibold">{searchedOrder.service.name}</p>
                  <p className="text-sm text-gray-500">{searchedOrder.service.platform}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Miktar</label>
                  <p className="font-semibold">{searchedOrder.quantity}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Hedef URL</label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all text-[#030711]">
                    {searchedOrder.targetUrl || "Belirtilmemiş"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Key Bilgisi</label>
                  <p className="font-semibold">{searchedOrder.key.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{searchedOrder.key.value}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Oluşturulma Tarihi</label>
                  <p className="font-semibold">
                    {new Date(searchedOrder.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>

                {searchedOrder.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tamamlanma Tarihi</label>
                    <p className="font-semibold">
                      {new Date(searchedOrder.completedAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            {searchedOrder.message && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-gray-600">Mesaj</label>
                  <p className="mt-1 p-3 bg-gray-100 rounded text-sm">
                    {searchedOrder.message}
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            <Separator />
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                disabled={isSearching}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Yenile
              </Button>
              
              <Button
                onClick={onResend}
                disabled={resendOrderMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {resendOrderMutation.isPending ? "Gönderiliyor..." : "Tekrar Gönder"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* No results message */}
      {!searchedOrder && !isSearching && searchForm.formState.isSubmitted && (
        <Card>
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
  );
}