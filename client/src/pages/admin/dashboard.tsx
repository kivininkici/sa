
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import KeyCreationModal from "@/components/admin/key-creation-modal";
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
  Key,
  Users,
  ShoppingCart,
  Activity,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Key as KeyType } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: recentKeys } = useQuery({
    queryKey: ["/api/keys"],
    retry: false,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Get recent 5 keys and orders
  const recentKeysData = recentKeys?.slice(0, 5) || [];
  const recentOrdersData = recentOrders?.slice(0, 5) || [];

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Dashboard" 
          description="Sistem genel bakış ve istatistikler" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Hoş Geldiniz</h2>
                <p className="text-slate-400">Sistemin genel durumunu buradan takip edebilirsiniz</p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowKeyModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Hızlı Key Oluştur
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                title="Toplam Key"
                value={dashboardStats?.totalKeys || 0}
                icon={Key}
                iconColor="bg-blue-600"
                subtitle="Oluşturulmuş"
              />
              <StatsCard
                title="Aktif Kullanıcı"
                value={dashboardStats?.totalUsers || 0}
                icon={Users}
                iconColor="bg-green-600"
                subtitle="Kayıtlı"
              />
              <StatsCard
                title="Toplam Sipariş"
                value={dashboardStats?.totalOrders || 0}
                icon={ShoppingCart}
                iconColor="bg-purple-600"
                subtitle="İşlem"
              />
              <StatsCard
                title="Sistem Durumu"
                value="Aktif"
                icon={Activity}
                iconColor="bg-emerald-600"
                subtitle="Çalışıyor"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Keys */}
              <Card className="dashboard-card">
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-50 flex items-center">
                      <Key className="w-5 h-5 mr-2 text-blue-400" />
                      Son Oluşturulan Key'ler
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => window.location.href = '/admin/keys'}
                    >
                      Tümünü Gör
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-900">
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-400">Key</TableHead>
                          <TableHead className="text-slate-400">Durum</TableHead>
                          <TableHead className="text-slate-400">Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentKeysData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                              <Key className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                              Henüz key oluşturulmamış
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentKeysData.map((key: KeyType) => (
                            <TableRow key={key.id} className="border-slate-700">
                              <TableCell>
                                <code className="px-2 py-1 bg-slate-900 text-blue-400 text-xs rounded font-mono">
                                  {key.value.substring(0, 8)}...
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={key.isUsed ? "default" : "secondary"}
                                  className={key.isUsed 
                                    ? "bg-green-900 text-green-300" 
                                    : "bg-amber-900 text-amber-300"
                                  }
                                >
                                  {key.isUsed ? (
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                  ) : (
                                    <Clock className="w-3 h-3 mr-1" />
                                  )}
                                  {key.isUsed ? "Kullanılmış" : "Bekliyor"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300 text-sm">
                                {key.createdAt ? new Date(key.createdAt).toLocaleDateString("tr-TR") : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="dashboard-card">
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-50 flex items-center">
                      <ShoppingCart className="w-5 h-5 mr-2 text-purple-400" />
                      Son Siparişler
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      onClick={() => window.location.href = '/admin/orders'}
                    >
                      Tümünü Gör
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-900">
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-400">Sipariş</TableHead>
                          <TableHead className="text-slate-400">Durum</TableHead>
                          <TableHead className="text-slate-400">Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentOrdersData.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-slate-400 py-8">
                              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                              Henüz sipariş bulunmuyor
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentOrdersData.map((order: any) => (
                            <TableRow key={order.id} className="border-slate-700">
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-slate-300 text-sm font-medium">
                                    #{order.id}
                                  </span>
                                  <span className="text-slate-500 text-xs">
                                    {order.quantity} adet
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={
                                    order.status === "completed" 
                                      ? "bg-green-900 text-green-300 border-green-600" 
                                      : order.status === "failed"
                                      ? "bg-red-900 text-red-300 border-red-600"
                                      : "bg-amber-900 text-amber-300 border-amber-600"
                                  }
                                >
                                  {order.status === "completed" && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {order.status === "failed" && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {order.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                                  {order.status === "completed" ? "Tamamlandı" : 
                                   order.status === "failed" ? "Başarısız" : "Bekliyor"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300 text-sm">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString("tr-TR") : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50">
                  Hızlı İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 border-slate-600 text-slate-300 hover:bg-slate-700 flex flex-col items-center justify-center"
                    onClick={() => window.location.href = '/admin/keys'}
                  >
                    <Key className="w-6 h-6 mb-1" />
                    Key Yönetimi
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 border-slate-600 text-slate-300 hover:bg-slate-700 flex flex-col items-center justify-center"
                    onClick={() => window.location.href = '/admin/services'}
                  >
                    <Activity className="w-6 h-6 mb-1" />
                    Servis Yönetimi
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 border-slate-600 text-slate-300 hover:bg-slate-700 flex flex-col items-center justify-center"
                    onClick={() => window.location.href = '/admin/logs'}
                  >
                    <Eye className="w-6 h-6 mb-1" />
                    Sistem Logları
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <KeyCreationModal 
        open={showKeyModal} 
        onOpenChange={setShowKeyModal} 
      />
    </div>
  );
}
