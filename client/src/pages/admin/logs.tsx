import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { 
  FileText, 
  Search, 
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap
} from "lucide-react";
import { Log } from "@shared/schema";

export default function Logs() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs"],
    retry: false,
  });

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  const filteredLogs = Array.isArray(logs) ? logs.filter((log: Log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.userId && log.userId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    return matchesSearch && matchesType;
  }) : [];

  const logTypes = Array.isArray(logs) ? Array.from(new Set(logs.map((log: Log) => log.type))) : [];
  const totalLogs = Array.isArray(logs) ? logs.length : 0;
  const todayLogs = Array.isArray(logs) ? logs.filter((log: Log) => {
    const today = new Date();
    const logDate = new Date(log.createdAt || '');
    return logDate.toDateString() === today.toDateString();
  }).length : 0;

  const getLogTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      key_created: { label: "Key Oluşturuldu", className: "bg-blue-900 text-blue-300" },
      key_deleted: { label: "Key Silindi", className: "bg-red-900 text-red-300" },
      order_created: { label: "Sipariş Oluşturuldu", className: "bg-amber-900 text-amber-300" },
      order_completed: { label: "Sipariş Tamamlandı", className: "bg-green-900 text-green-300" },
      order_failed: { label: "Sipariş Başarısız", className: "bg-red-900 text-red-300" },
    };
    
    return types[type] || { label: type, className: "bg-slate-700 text-slate-300" };
  };

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Sistem Logları" 
          description="Sistem aktivitelerini görüntüleyin" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Sistem Logları</h2>
                <p className="text-slate-400">Sistem aktivitelerini takip edin</p>
              </div>
            </div>

            {/* Log Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Toplam Log"
                value={totalLogs}
                icon={FileText}
                iconColor="bg-blue-600"
              />
              <StatsCard
                title="Bugünkü Loglar"
                value={todayLogs}
                icon={Clock}
                iconColor="bg-green-600"
              />
              <StatsCard
                title="Log Türleri"
                value={logTypes.length}
                icon={Zap}
                iconColor="bg-purple-600"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Log ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-600 text-slate-50"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 bg-slate-900 border-slate-600 text-slate-50">
                  <SelectValue placeholder="Log türü" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-600">
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  {logTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getLogTypeBadge(type).label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Logs Table */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50">
                  Sistem Logları
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-900">
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Tür</TableHead>
                        <TableHead className="text-slate-400">Mesaj</TableHead>
                        <TableHead className="text-slate-400">Kullanıcı</TableHead>
                        <TableHead className="text-slate-400">Tarih</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400">
                            Yükleniyor...
                          </TableCell>
                        </TableRow>
                      ) : filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400">
                            Log bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log: Log) => {
                          const typeBadge = getLogTypeBadge(log.type);
                          return (
                            <TableRow key={log.id} className="border-slate-700">
                              <TableCell>
                                <Badge className={typeBadge.className}>
                                  {typeBadge.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {log.message}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {log.userId || "-"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {log.createdAt ? new Date(log.createdAt).toLocaleString("tr-TR") : "-"}
                              </TableCell>
                            </TableRow>
                          );
                        })
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
