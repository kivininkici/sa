import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Download, 
  Trash2, 
  Settings,
  CheckCircle,
  AlertCircle,
  Edit2,
  Power,
  PowerOff,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";

export default function ApiManagement() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [apiName, setApiName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fetchedServices, setFetchedServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // 50 servis per page for better performance
  const [servicesCurrentPage, setServicesCurrentPage] = useState(1);
  const [servicesItemsPerPage] = useState(50); // 50 services per page
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // API creation mutation with auto-import
  const createApiMutation = useMutation({
    mutationFn: async ({ name, apiUrl, apiKey }: { name: string; apiUrl: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/api-settings", { name, apiUrl, apiKey, isActive: true });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.autoImport?.success) {
        toast({
          title: "Başarılı",
          description: `API eklendi ve ${data.autoImport.imported} servis otomatik içe aktarıldı`,
        });
      } else {
        toast({
          title: "API Eklendi",
          description: data.autoImport?.message || "API eklendi ama servisler çekilemedi",
          variant: data.autoImport ? "destructive" : "default",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-settings"] });
      setIsDialogOpen(false);
      setApiName("");
      setApiUrl("");
      setApiKey("");
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

  // API deletion mutation
  const deleteApiMutation = useMutation({
    mutationFn: async (apiId: number) => {
      console.log(`Attempting to delete API with ID: ${apiId}`);
      
      // Use fetch directly to avoid apiRequest throwing on errors
      const response = await fetch(`/api/admin/api-settings/${apiId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete error response:', errorText);
        throw new Error(errorText || `Failed to delete API (${response.status})`);
      }
      
      const data = await response.json();
      console.log('Delete response data:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Delete success:', data);
      toast({
        title: "Başarılı",
        description: data.message || `API silindi ve ${data.deletedServices || 0} servis kaldırıldı`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
    },
    onError: (error) => {
      console.error('Delete error:', error);
      if (isUnauthorizedError(error)) {
        window.location.href = "/admin/login";
        return;
      }
      toast({
        title: "Hata",
        description: error.message || "API silme işlemi başarısız",
        variant: "destructive",
      });
    },
  });

  // Maintenance mode toggle mutation
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiRequest("POST", "/api/admin/maintenance-mode", { enabled });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/maintenance-mode"] });
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

  // Fetch services from specific API mutation
  const fetchServicesFromApiMutation = useMutation({
    mutationFn: async ({ apiUrl, apiKey }: { apiUrl: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/fetch-services", { apiUrl, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      // API'den gelen veri object olabilir, array'e çevir
      let servicesArray = [];
      if (Array.isArray(data)) {
        servicesArray = data;
      } else if (data && typeof data === 'object') {
        // Object'in value'larını kontrol et
        const values = Object.values(data);
        if (values.length > 0 && typeof values[0] === 'object') {
          servicesArray = values;
        }
      }
      
      setFetchedServices(servicesArray);
      toast({
        title: "Başarılı",
        description: `${servicesArray.length} servis bulundu`,
      });
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

  // Auto fetch and import services for existing API
  const autoFetchServicesMutation = useMutation({
    mutationFn: async ({ apiUrl, apiKey }: { apiUrl: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/fetch-and-import-services", { apiUrl, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: `${data.imported || 0} servis otomatik içe aktarıldı`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
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

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/admin/services/all"],
    retry: false,
  });

  // Fetch API settings
  const { data: apiSettings, isLoading: apiSettingsLoading } = useQuery({
    queryKey: ["/api/admin/api-settings"],
    retry: false,
  });

  // Fetch maintenance mode status
  const { data: maintenanceMode, isLoading: maintenanceModeLoading } = useQuery({
    queryKey: ["/api/admin/maintenance-mode"],
    retry: false,
  });

  const fetchServicesMutation = useMutation({
    mutationFn: async ({ apiUrl, apiKey }: { apiUrl: string; apiKey?: string }) => {
      const response = await apiRequest("POST", "/api/admin/fetch-services", { apiUrl, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      // Backend returns array directly or in different formats
      const servicesArray = Array.isArray(data) ? data : Object.values(data);
      setFetchedServices(servicesArray);
      toast({
        title: "Başarılı", 
        description: `${servicesArray.length} servis bulundu`,
      });
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

  const importServicesMutation = useMutation({
    mutationFn: async (services: any[]) => {
      const response = await apiRequest("POST", "/api/admin/import-services", { services });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: `${data.imported} servis içe aktarıldı`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
      setIsDialogOpen(false);
      setFetchedServices([]);
      setSelectedServices([]);
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

  const handleFetchServices = () => {
    if (!apiUrl) {
      toast({
        title: "Hata",
        description: "API URL gereklidir",
        variant: "destructive",
      });
      return;
    }
    if (!apiKey) {
      toast({
        title: "Hata",
        description: "API Key zorunludur",
        variant: "destructive",
      });
      return;
    }
    fetchServicesMutation.mutate({ apiUrl, apiKey });
  };

  const handleCreateApi = () => {
    if (!apiName) {
      toast({
        title: "Hata",
        description: "API adı gereklidir",
        variant: "destructive",
      });
      return;
    }
    
    if (!apiUrl) {
      toast({
        title: "Hata",
        description: "API URL gereklidir",
        variant: "destructive",
      });
      return;
    }
    
    if (!apiKey) {
      toast({
        title: "Hata",
        description: "API Key zorunludur",
        variant: "destructive",
      });
      return;
    }
    
    createApiMutation.mutate({ name: apiName, apiUrl, apiKey });
  };

  const handleImportServices = () => {
    const servicesToImport = fetchedServices.filter((_, index) => 
      selectedServices.includes(index)
    );

    if (servicesToImport.length === 0) {
      toast({
        title: "Hata",
        description: "En az bir servis seçmelisiniz",
        variant: "destructive",
      });
      return;
    }

    importServicesMutation.mutate(servicesToImport);
  };

  // Filter and paginate services - ensure fetchedServices is always an array
  const servicesArray = Array.isArray(fetchedServices) ? fetchedServices : [];
  const filteredServices = servicesArray.filter((service: any) =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  const toggleServiceSelection = (index: number) => {
    setSelectedServices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  const servicesList = Array.isArray(services) ? services : [];
  
  // Pagination for main services list
  const servicesTotalPages = Math.ceil(servicesList.length / servicesItemsPerPage);
  const servicesStartIndex = (servicesCurrentPage - 1) * servicesItemsPerPage;
  const servicesEndIndex = servicesStartIndex + servicesItemsPerPage;
  const paginatedServicesList = servicesList.slice(servicesStartIndex, servicesEndIndex);
  const apiSettingsList = Array.isArray(apiSettings) ? apiSettings : [];
  const maintenanceModeStatus = maintenanceMode as { maintenanceMode: boolean } | undefined;

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="API Yönetimi" 
          description="Harici API'lerden servis içe aktarın" 
        />

        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">API Yönetimi</h2>
                <p className="text-slate-400">Harici API'lerden servis içe aktarın ve yönetin</p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    API Ekle
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>API'den Servis İçe Aktar</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Quick Add Popular APIs */}
                    <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
                      <Label className="text-sm font-semibold mb-3 block">Popüler API'ler - Hızlı Ekle</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          className="h-auto p-4 text-left"
                          onClick={() => {
                            setApiName("MedyaBayim");
                            setApiUrl("https://medyabayim.com/api/v2");
                            setApiKey("");
                          }}
                        >
                          <div>
                            <div className="font-semibold">MedyaBayim</div>
                            <div className="text-xs text-muted-foreground">medyabayim.com/api/v2</div>
                          </div>
                        </Button>
                        <Button
                          variant="outline"
                          className="h-auto p-4 text-left"
                          onClick={() => {
                            setApiName("ResellerProvider");
                            setApiUrl("https://resellerprovider.ru/api/v2");
                            setApiKey("");
                          }}
                        >
                          <div>
                            <div className="font-semibold">ResellerProvider</div>
                            <div className="text-xs text-muted-foreground">resellerprovider.ru/api/v2</div>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="apiName">API Adı</Label>
                        <Input
                          id="apiName"
                          placeholder="ResellerProvider"
                          value={apiName}
                          onChange={(e) => setApiName(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="apiUrl">API URL</Label>
                        <Input
                          id="apiUrl"
                          placeholder="https://example.com/api/v2"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="apiKey">API Key (Zorunlu)</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="1555c7dc7e6367f1bd1039305671f2e1"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleFetchServices}
                        disabled={fetchServicesMutation.isPending}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {fetchServicesMutation.isPending ? "Getiriliyor..." : "Servisleri Getir"}
                      </Button>
                      
                      <Button 
                        onClick={handleCreateApi}
                        disabled={createApiMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {createApiMutation.isPending ? "Ekleniyor..." : "API Ekle ve Servisleri İçe Aktar"}
                      </Button>
                    </div>

                    {fetchedServices.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Bulunan Servisler ({filteredServices.length}/{fetchedServices.length})
                          </h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedServices(fetchedServices.map((_, i) => i))}
                            >
                              Tümünü Seç ({fetchedServices.length})
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedServices([])}
                            >
                              Seçimi Temizle
                            </Button>
                          </div>
                        </div>

                        {/* Search and pagination controls */}
                        <div className="flex items-center justify-between gap-4">
                          <Input
                            placeholder="Servis ara..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1); // Reset to first page when searching
                            }}
                            className="max-w-xs"
                          />
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            Sayfa {currentPage} / {totalPages} - 
                            Seçilen: {selectedServices.length}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {paginatedServices.map((service: any, index) => {
                            const originalIndex = startIndex + index;
                            return (
                            <Card 
                              key={originalIndex} 
                              className={`cursor-pointer transition-all ${
                                selectedServices.includes(originalIndex) 
                                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                                  : ''
                              }`}
                              onClick={() => toggleServiceSelection(originalIndex)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{service.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {service.platform} - {service.type}
                                    </p>
                                  </div>
                                  {selectedServices.includes(originalIndex) && (
                                    <CheckCircle className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                            );
                          })}
                        </div>

                        {/* Pagination controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              Önceki
                            </Button>
                            <span className="text-sm text-slate-500">
                              {currentPage} / {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Sonraki
                            </Button>
                          </div>
                        )}

                        <Button 
                          onClick={handleImportServices}
                          disabled={importServicesMutation.isPending || selectedServices.length === 0}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          {importServicesMutation.isPending ? "İçe Aktarılıyor..." : `${selectedServices.length} Servisi İçe Aktar`}
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Maintenance Mode Control */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50 flex items-center justify-between">
                  <span>Bakım Modu</span>
                  {maintenanceModeLoading ? (
                    <div className="text-sm text-slate-400">Yükleniyor...</div>
                  ) : (
                    <Button
                      onClick={() => toggleMaintenanceMutation.mutate(!maintenanceModeStatus?.maintenanceMode)}
                      disabled={toggleMaintenanceMutation.isPending}
                      variant={maintenanceModeStatus?.maintenanceMode ? "destructive" : "default"}
                      size="sm"
                    >
                      {maintenanceModeStatus?.maintenanceMode ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-2" />
                          Bakım Modunu Kapat
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-2" />
                          Bakım Modunu Aç
                        </>
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    maintenanceModeStatus?.maintenanceMode ? 'bg-red-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-slate-50 font-medium">
                      {maintenanceModeStatus?.maintenanceMode ? 'Bakım Modu Aktif' : 'Normal Çalışma Modu'}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {maintenanceModeStatus?.maintenanceMode 
                        ? 'Sadece adminler key kullanabilir' 
                        : 'Tüm kullanıcılar key kullanabilir'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active APIs */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50">
                  Aktif API'ler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {apiSettingsLoading ? (
                  <div className="text-center text-slate-400">Yükleniyor...</div>
                ) : !apiSettingsList || apiSettingsList.length === 0 ? (
                  <div className="text-center text-slate-400">Henüz API eklenmemiş</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apiSettingsList.map((api: any) => (
                      <Card key={api.id} className="dashboard-card relative">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Settings className="w-4 h-4 text-blue-400" />
                              <h4 className="font-semibold text-slate-50">{api.name}</h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={api.isActive ? "default" : "secondary"}
                                className={api.isActive 
                                  ? "bg-green-900 text-green-300" 
                                  : "bg-slate-700 text-slate-400"
                                }
                              >
                                {api.isActive ? "Aktif" : "Pasif"}
                              </Badge>
                              <Button
                                onClick={() => setDeleteConfirmId(api.id)}
                                disabled={deleteApiMutation.isPending}
                                variant="destructive"
                                size="sm"
                                className="w-8 h-8 p-0"
                                title="API'yi sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 truncate mb-2">
                            {api.apiUrl}
                          </p>
                          <p className="text-xs text-slate-400 mb-3">
                            Oluşturulma: {new Date(api.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                          <Button
                            onClick={() => autoFetchServicesMutation.mutate({ apiUrl: api.apiUrl, apiKey: api.apiKey })}
                            disabled={autoFetchServicesMutation.isPending}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${autoFetchServicesMutation.isPending ? 'animate-spin' : ''}`} />
                            {autoFetchServicesMutation.isPending ? "Çekiliyor..." : "Servisleri Çek"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Services */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-50">
                    Mevcut Servisler
                  </CardTitle>
                  {servicesTotalPages > 1 && (
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      Sayfa {servicesCurrentPage} / {servicesTotalPages}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {servicesLoading ? (
                    <div className="col-span-full text-center text-slate-400">
                      Yükleniyor...
                    </div>
                  ) : servicesList.length === 0 ? (
                    <div className="col-span-full text-center text-slate-400">
                      Henüz servis eklenmemiş
                    </div>
                  ) : (
                    paginatedServicesList.map((service: any) => (
                      <Card key={service.id} className="dashboard-card">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Settings className="w-4 h-4 text-blue-400" />
                              <h4 className="font-semibold text-slate-50">{service.name}</h4>
                            </div>
                            <Badge 
                              variant={service.isActive ? "default" : "secondary"}
                              className={service.isActive 
                                ? "bg-green-900 text-green-300" 
                                : "bg-slate-700 text-slate-400"
                              }
                            >
                              {service.isActive ? "Aktif" : "Pasif"}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 mb-2">
                            {service.platform} - {service.type}
                          </p>
                          {service.apiEndpoint && (
                            <p className="text-xs text-slate-500 truncate">
                              {service.apiEndpoint}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                
                {/* Pagination Controls */}
                {servicesTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServicesCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={servicesCurrentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Önceki
                    </Button>
                    
                    <div className="flex items-center gap-2 px-4">
                      <span className="text-sm text-slate-400">
                        {servicesCurrentPage} / {servicesTotalPages}
                      </span>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServicesCurrentPage(prev => Math.min(prev + 1, servicesTotalPages))}
                      disabled={servicesCurrentPage === servicesTotalPages}
                      className="flex items-center gap-1"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-50">API'yi Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bu API'yi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve 
              bu API'ye bağlı tüm servisler de silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteConfirmId(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  deleteApiMutation.mutate(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}