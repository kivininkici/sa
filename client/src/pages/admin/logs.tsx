import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Log } from "@shared/schema";

export default function Logs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/logs"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

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
                      ) : logs?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-slate-400">
                            Log bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        logs?.map((log: Log) => {
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
