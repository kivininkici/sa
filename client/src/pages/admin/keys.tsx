import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import KeyCreationModal from "@/components/admin/key-creation-modal";
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
  Key, 
  CheckCircle, 
  Clock, 
  Plus, 
  Eye, 
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Key as KeyType } from "@shared/schema";

export default function Keys() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  const { data: keys, isLoading: keysLoading } = useQuery({
    queryKey: ["/api/admin/keys"],
    retry: false,
  });

  const { data: keyStats } = useQuery({
    queryKey: ["/api/admin/keys/stats"],
    retry: false,
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/keys/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Key başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/admin/login";
        return;
      }
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  const filteredKeys = Array.isArray(keys) ? keys.filter((key: KeyType) => {
    const matchesSearch = key.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "used" && key.isUsed) ||
                         (statusFilter === "unused" && !key.isUsed);
    return matchesSearch && matchesStatus;
  }) : [];

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Key Yönetimi" 
          description="Tek kullanımlık key'leri oluşturun ve yönetin" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Key Yönetimi</h2>
                <p className="text-slate-400">Tek kullanımlık key'leri oluşturun ve yönetin</p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowKeyModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Yeni Key Oluştur
              </Button>
            </div>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                title="Toplam Key"
                value={(keyStats as any)?.total || 0}
                icon={Key}
                iconColor="bg-blue-600"
              />
              <StatsCard
                title="Kullanılan"
                value={(keyStats as any)?.used || 0}
                icon={CheckCircle}
                iconColor="bg-green-600"
              />
              <StatsCard
                title="Kullanılmayan"
                value={(keyStats as any)?.unused || 0}
                icon={Clock}
                iconColor="bg-amber-600"
              />
            </div>

            {/* Keys Table */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-50">
                    Key Listesi
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Key ara..."
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
                        <SelectItem value="used">Kullanılmış</SelectItem>
                        <SelectItem value="unused">Kullanılmamış</SelectItem>
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
                        <TableHead className="text-slate-400">Key</TableHead>
                        <TableHead className="text-slate-400">Durum</TableHead>
                        <TableHead className="text-slate-400">Oluşturulma</TableHead>
                        <TableHead className="text-slate-400">Kullanım</TableHead>
                        <TableHead className="text-slate-400">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keysLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400">
                            Yükleniyor...
                          </TableCell>
                        </TableRow>
                      ) : filteredKeys?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-slate-400">
                            Key bulunamadı
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredKeys?.map((key: KeyType) => (
                          <TableRow key={key.id} className="border-slate-700">
                            <TableCell>
                              <code className="px-2 py-1 bg-slate-900 text-blue-400 text-sm rounded font-mono">
                                {key.value}
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
                                {key.isUsed ? "Kullanılmış" : "Kullanılmamış"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {key.createdAt ? new Date(key.createdAt).toLocaleString("tr-TR") : "-"}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {key.usedAt ? new Date(key.usedAt).toLocaleString("tr-TR") : "-"}
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => deleteKeyMutation.mutate(key.id)}
                                  disabled={deleteKeyMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
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

      <KeyCreationModal 
        open={showKeyModal} 
        onOpenChange={setShowKeyModal} 
      />
    </div>
  );
}
