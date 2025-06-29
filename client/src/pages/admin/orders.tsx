
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  ExternalLink,
  Calendar
} from "lucide-react";

export default function Orders() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    retry: false,
  });

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  // Calculate stats
  const ordersArray = Array.isArray(orders) ? orders : [];
  const orderStats = {
    total: ordersArray.length,
    completed: ordersArray.filter((order: any) => order.status === "completed").length,
    pending: ordersArray.filter((order: any) => order.status === "pending").length,
    failed: ordersArray.filter((order: any) => order.status === "failed").length,
  };

  const filteredOrders = ordersArray.filter((order: any) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.targetUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-900 text-green-300 border-green-600";
      case "failed":
        return "bg-red-900 text-red-300 border-red-600";
      case "pending":
        return "bg-amber-900 text-amber-300 border-amber-600";
      default:
        return "bg-slate-900 text-slate-300 border-slate-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case "failed":
        return <AlertCircle className="w-3 h-3 mr-1" />;
      case "pending":
        return <Clock className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "failed":
        return "Başarısız";
      case "pending":
        return "Bekliyor";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Sipariş Yönetimi" 
          description="Sistem siparişlerini görüntüleyin ve yönetin" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Sipariş Yönetimi</h2>
                <p className="text-slate-400">Sistem siparişlerini görüntüleyin ve yönetin</p>
              </div>
            </div>

            {/* Order Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatsCard
                title="Toplam Sipariş"
                value={orderStats.total}
                icon={ShoppingCart}
                iconColor="bg-blue-600"
              />
              <StatsCard
                title="Tamamlanan"
                value={orderStats.completed}
                icon={CheckCircle}
                iconColor="bg-green-600"
              />
              <StatsCard
                title="Bekleyen"
                value={orderStats.pending}
                icon={Clock}
                iconColor="bg-amber-600"
              />
              <StatsCard
                title="Başarısız"
                value={orderStats.failed}
                icon={AlertCircle}
                iconColor="bg-red-600"
              />
            </div>

            {/* Orders Table */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-50">
                    Sipariş Listesi
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Sipariş ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 bg-slate-900 border-slate-600 text-slate-50"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48 bg-slate-900 border-slate-600 text-slate-50">
                        <SelectValue placeholder="Durum filtresi" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-600">
                        <SelectItem value="all">Tüm Durumlar</SelectItem>
                        <SelectItem value="completed">Tamamlanan</SelectItem>
                        <SelectItem value="pending">Bekleyen</SelectItem>
                        <SelectItem value="failed">Başarısız</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-900">
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Sipariş ID</TableHead>
                        <TableHead className="text-slate-400">Hedef URL</TableHead>
                        <TableHead className="text-slate-400">Miktar</TableHead>
                        <TableHead className="text-slate-400">Durum</TableHead>
                        <TableHead className="text-slate-400">Tarih</TableHead>
                        <TableHead className="text-slate-400">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400">
                            Yükleniyor...
                          </TableCell>
                        </TableRow>
                      ) : filteredOrders?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400">
                            Sipariş bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders?.map((order: any) => (
                          <TableRow key={order.id} className="border-slate-700">
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-slate-300 font-medium">#{order.id}</span>
                                <span className="text-slate-500 text-xs">
                                  Key: {order.key?.value?.substring(0, 8)}...
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2 max-w-xs">
                                <span className="text-slate-300 truncate">
                                  {order.targetUrl}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  onClick={() => window.open(order.targetUrl, '_blank')}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {order.quantity}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                className={getStatusColor(order.status)}
                              >
                                {getStatusIcon(order.status)}
                                {getStatusText(order.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3 text-slate-500" />
                                <span className="text-sm">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleString("tr-TR") : "-"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </div>
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
        </div>
      </main>
    </div>
  );
}
