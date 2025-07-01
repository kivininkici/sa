import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  DollarSign, 
  RefreshCw, 
  Clock,
  TrendingUp,
  Wallet
} from "lucide-react";

interface ApiBalance {
  id: number;
  name: string;
  balance: string;
  lastBalanceCheck: string | null;
}

interface BalanceRefreshResult {
  id: number;
  name: string;
  balance: string | null;
  status: 'success' | 'error';
  error?: string;
}

export default function ApiBalances() {
  const { isAuthenticated } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/admin/login';
    }
  }, [isAuthenticated]);

  // API bakiyelerini getir
  const { data: balances = [], isLoading } = useQuery<ApiBalance[]>({
    queryKey: ["/api/admin/api-balances"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Bakiye yenileme mutation
  const refreshBalancesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/api-balances/refresh", {});
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (error) {
        throw new Error("Response parse error");
      }
    },
    onSuccess: (data: any) => {
      setRefreshing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-balances"] });
      toast({
        title: "Bakiyeler Güncellendi",
        description: `${data.updated || 0} API başarıyla güncellendi, ${data.failed || 0} API'de hata oluştu`,
      });
    },
    onError: (error: Error) => {
      setRefreshing(false);
      toast({
        title: "Bakiye Güncelleme Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefreshBalances = () => {
    setRefreshing(true);
    refreshBalancesMutation.mutate();
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return isNaN(num) ? "0,00" : num.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Hiç güncellenmedi";
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalBalance = () => {
    return (balances as ApiBalance[]).reduce((total: number, balance: ApiBalance) => {
      return total + parseFloat(balance.balance || "0");
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                API Bakiyeleri
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Tüm API sağlayıcılarının bakiye durumunu görüntüleyin
              </p>
            </div>
            <Button
              onClick={handleRefreshBalances}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Güncelleniyor...' : 'Bakiyeleri Yenile'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Bakiye
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ₺{formatBalance(getTotalBalance().toString())}
                </div>
                <p className="text-xs text-muted-foreground">
                  Tüm API'lerin toplam bakiyesi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Aktif API'ler
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {balances.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Bakiye takibi yapılan API sayısı
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Düşük Bakiye
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {(balances as ApiBalance[]).filter(b => parseFloat(b.balance || "0") < 10).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  ₺10'dan az bakiyesi olan API'ler
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balances Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                API Bakiye Listesi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(balances as ApiBalance[]).length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Henüz API bakiyesi bulunmuyor
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    API ayarları ekledikten sonra bakiyeler burada görünecek
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>API Adı</TableHead>
                        <TableHead>Bakiye</TableHead>
                        <TableHead>Son Güncelleme</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(balances as ApiBalance[]).map((balance) => {
                        const balanceAmount = parseFloat(balance.balance || "0");
                        const isLowBalance = balanceAmount < 10;
                        const isZeroBalance = balanceAmount === 0;
                        
                        return (
                          <TableRow key={balance.id}>
                            <TableCell className="font-medium">
                              {balance.name}
                            </TableCell>
                            <TableCell>
                              <span className={`font-semibold ${
                                isZeroBalance 
                                  ? 'text-red-600' 
                                  : isLowBalance 
                                    ? 'text-orange-600' 
                                    : 'text-green-600'
                              }`}>
                                ₺{formatBalance(balance.balance)}
                              </span>
                            </TableCell>
                            <TableCell className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {formatDate(balance.lastBalanceCheck)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                isZeroBalance 
                                  ? "destructive" 
                                  : isLowBalance 
                                    ? "secondary"
                                    : "default"
                              }>
                                {isZeroBalance 
                                  ? "Bakiye Yok" 
                                  : isLowBalance 
                                    ? "Düşük Bakiye" 
                                    : "Normal"
                                }
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}