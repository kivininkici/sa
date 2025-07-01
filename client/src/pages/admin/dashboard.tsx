
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
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
  const { isAuthenticated, isLoading, admin } = useAdminAuth();
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Giriş Gerekli",
        description: "Admin paneline erişmek için giriş yapmalısınız",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: dashboardStats }: { data?: { totalKeys: number; usedKeys: number; activeServices: number; dailyTransactions: number } } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: recentKeys } = useQuery({
    queryKey: ["/api/admin/keys"],
    retry: false,
    enabled: isAuthenticated,
  });

  const { data: recentOrders } = useQuery({
    queryKey: ["/api/admin/orders"],
    retry: false,
    enabled: isAuthenticated,
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
  const recentKeysData = Array.isArray(recentKeys) ? recentKeys.slice(0, 5) : [];
  const recentOrdersData = Array.isArray(recentOrders) ? recentOrders.slice(0, 5) : [];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative md:ml-0 ml-0">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <Header 
          title="Dashboard" 
          description="Sistem genel bakış ve istatistikler" 
        />
        
        <div className="content-area relative z-10">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 md:p-6 border border-blue-500/20 gap-4">
              <div className="flex-1">
                <h2 className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-extrabold text-2xl md:text-[32px]">
                  Hoş Geldiniz!{admin?.username ? ` ${admin.username}` : ''}
                </h2>
                <p className="text-slate-400 mt-2 text-sm md:text-base">Sistemin genel durumunu buradan takip edebilir ve yeni key'ler oluşturabilirsiniz</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 w-full md:w-auto"
                onClick={() => setShowKeyModal(true)}
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Hızlı Key Oluştur
              </Button>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatsCard
                title="Toplam Key"
                value={dashboardStats?.totalKeys || 0}
                icon={Key}
                iconColor="bg-blue-600"
                change="+12% bu ay"
                changeType="positive"
              />
              <StatsCard
                title="Kullanılmış Key"
                value={dashboardStats?.usedKeys || 0}
                icon={Users}
                iconColor="bg-green-600"
                change="+8% bu hafta"
                changeType="positive"
              />
              <StatsCard
                title="Aktif Servis"
                value={dashboardStats?.activeServices || 0}
                icon={ShoppingCart}
                iconColor="bg-cyan-600"
                change="5 servis aktif"
                changeType="neutral"
              />
              <StatsCard
                title="Günlük İşlem"
                value={dashboardStats?.dailyTransactions || 0}
                icon={Activity}
                iconColor="bg-emerald-600"
                change="+25% dün"
                changeType="positive"
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
