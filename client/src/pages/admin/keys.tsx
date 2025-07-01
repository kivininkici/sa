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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  EyeOff,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [hiddenKeys, setHiddenKeys] = useState<Set<number>>(new Set());
  const [selectedKeys, setSelectedKeys] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedExportCategory, setSelectedExportCategory] = useState("");

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

  // Pagination calculations
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopyalandı",
      description: "Key panoya kopyalandı",
    });
  };

  const toggleKeyVisibility = (keyId: number) => {
    setHiddenKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (keyValue: string) => {
    if (keyValue.length <= 8) return keyValue;
    const prefix = keyValue.substring(0, 4);
    const suffix = keyValue.substring(keyValue.length - 4);
    const middleLength = keyValue.length - 8;
    const masked = "*".repeat(middleLength);
    return `${prefix}${masked}${suffix}`;
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedKeys(new Set());
      setSelectAll(false);
    } else {
      const allKeyIds = new Set(paginatedKeys.map(key => key.id));
      setSelectedKeys(allKeyIds);
      setSelectAll(true);
    }
  };

  const toggleKeySelection = (keyId: number) => {
    setSelectedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      
      // Update selectAll state based on current selection
      setSelectAll(newSet.size === paginatedKeys.length && paginatedKeys.length > 0);
      
      return newSet;
    });
  };

  const deleteSelectedKeys = async () => {
    if (selectedKeys.size === 0) return;
    
    try {
      // Delete all selected keys
      await Promise.all(
        Array.from(selectedKeys).map(keyId => 
          apiRequest("DELETE", `/api/admin/keys/${keyId}`)
        )
      );
      
      toast({
        title: "Başarılı",
        description: `${selectedKeys.size} key başarıyla silindi`,
      });
      
      setSelectedKeys(new Set());
      setSelectAll(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/stats"] });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Keyler silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const toggleSelectedKeysVisibility = () => {
    if (selectedKeys.size === 0) return;
    
    setHiddenKeys(prev => {
      const newSet = new Set(prev);
      const allSelectedHidden = Array.from(selectedKeys).every(id => newSet.has(id));
      
      if (allSelectedHidden) {
        // If all selected keys are hidden, show them
        Array.from(selectedKeys).forEach(id => newSet.delete(id));
        toast({
          title: "Başarılı",
          description: `${selectedKeys.size} key gösterildi`,
        });
      } else {
        // Hide all selected keys
        Array.from(selectedKeys).forEach(id => newSet.add(id));
        toast({
          title: "Başarılı",
          description: `${selectedKeys.size} key gizlendi`,
        });
      }
      
      return newSet;
    });
    
    setSelectedKeys(new Set());
    setSelectAll(false);
  };

  // Get unique categories from keys
  const getUniqueCategories = () => {
    if (!Array.isArray(keys)) return [];
    const categories = Array.from(new Set(keys.map((key: KeyType) => key.category).filter(Boolean)));
    return categories.sort();
  };

  // Export keys by category
  const exportKeysByCategory = async () => {
    if (!selectedExportCategory) {
      toast({
        title: "Hata",
        description: "Lütfen bir kategori seçin",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/keys/export/${selectedExportCategory}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Export failed');
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedExportCategory}_keys.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Başarılı",
        description: `${selectedExportCategory} kategorisi key'leri indirildi`,
      });

      setShowExportModal(false);
      setSelectedExportCategory("");
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Export failed",
        variant: "destructive",
      });
    }
  };

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
                <p className="text-slate-400">
                  Toplam {filteredKeys.length} key • Sayfa {currentPage}/{totalPages}
                </p>
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
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg font-semibold text-slate-50">
                      Key Listesi
                    </CardTitle>
                    <Button 
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                      onClick={() => setShowExportModal(true)}
                    >
                      Toplu Key.txt
                    </Button>
                  </div>
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
                    <TableHeader className="bg-slate-900/50">
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-600" 
                              checked={selectAll}
                              onChange={toggleSelectAll}
                            />
                            <span>Key</span>
                            {selectedKeys.size > 0 && (
                              <div className="flex items-center gap-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 text-blue-400 hover:text-blue-300"
                                  onClick={toggleSelectedKeysVisibility}
                                  title="Seçili key'leri gizle/göster"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-6 h-6 p-0 text-red-400 hover:text-red-300"
                                  onClick={deleteSelectedKeys}
                                  title="Seçili key'leri sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                          Oluşturma Tarihi
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                          Durum
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                          Kullanım
                        </TableHead>
                        <TableHead className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                          İşlemler
                        </TableHead>
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
                        paginatedKeys?.map((key: KeyType) => (
                          <TableRow key={key.id} className="border-slate-700 hover:bg-slate-900/30">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-slate-600" 
                                  checked={selectedKeys.has(key.id)}
                                  onChange={() => toggleKeySelection(key.id)}
                                />
                                <div className="flex items-center gap-2">
                                  <code className="px-3 py-2 text-blue-400 rounded-lg font-mono border border-slate-600 text-[14px] font-extrabold bg-[#0b0b0f] whitespace-nowrap">
                                    {hiddenKeys.has(key.id) ? maskKey(key.value) : key.value}
                                  </code>
                                  {key.name && (
                                    <span className="text-xs text-slate-400">({key.name})</span>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                                    onClick={() => copyToClipboard(key.value)}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {key.createdAt ? new Date(key.createdAt).toLocaleDateString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit", 
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={key.isUsed ? "default" : "secondary"}
                                className={key.isUsed 
                                  ? "bg-red-900/20 text-red-400 border-red-800" 
                                  : "bg-green-900/20 text-green-400 border-green-800"
                                }
                              >
                                {key.isUsed ? "Kullanılmış" : "Kullanılmamış"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-slate-300 text-sm">
                                  {key.usedQuantity || 0} / {key.maxQuantity || 0}
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-1.5">
                                  <div 
                                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ 
                                      width: `${key.maxQuantity ? ((key.usedQuantity || 0) / key.maxQuantity) * 100 : 0}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 text-slate-400 hover:text-blue-400"
                                  onClick={() => toggleKeyVisibility(key.id)}
                                >
                                  {hiddenKeys.has(key.id) ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-8 h-8 p-0 text-slate-400 hover:text-red-400"
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Önceki
                    </Button>
                    
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm text-slate-400">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      Sonraki
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <KeyCreationModal 
        open={showKeyModal} 
        onOpenChange={setShowKeyModal} 
      />

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-slate-50">Key Kategorisi Seç</DialogTitle>
            <DialogDescription className="text-slate-400">
              İndirmek istediğiniz key kategorisini seçiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Select value={selectedExportCategory} onValueChange={setSelectedExportCategory}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-50">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {getUniqueCategories().map((category: string) => (
                  <SelectItem key={category} value={category} className="text-slate-50">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              İptal
            </Button>
            <Button
              onClick={exportKeysByCategory}
              disabled={!selectedExportCategory}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
