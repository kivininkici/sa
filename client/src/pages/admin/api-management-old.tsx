
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
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function ApiManagement() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [fetchedServices, setFetchedServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services/all"],
    retry: false,
  });

  const fetchServicesMutation = useMutation({
    mutationFn: async ({ apiUrl, apiKey }: { apiUrl: string; apiKey?: string }) => {
      const response = await apiRequest("POST", "/api/admin/fetch-services", { apiUrl, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      setFetchedServices(data);
      toast({
        title: "Başarılı",
        description: `${data.length} servis bulundu`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      queryClient.invalidateQueries({ queryKey: ["/api/services/all"] });
      setIsDialogOpen(false);
      setFetchedServices([]);
      setSelectedServices([]);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
    fetchServicesMutation.mutate({ apiUrl, apiKey });
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="apiUrl">API URL</Label>
                        <Input
                          id="apiUrl"
                          placeholder="https://api.example.com/services"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="apiKey">API Key (Opsiyonel)</Label>
                        <Input
                          id="apiKey"
                          type="password"
                          placeholder="API anahtarı"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleFetchServices}
                      disabled={fetchServicesMutation.isPending}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {fetchServicesMutation.isPending ? "Getiriliyor..." : "Servisleri Getir"}
                    </Button>

                    {fetchedServices.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Bulunan Servisler</h3>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedServices(fetchedServices.map((_, i) => i))}
                            >
                              Tümünü Seç
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                          {fetchedServices.map((service: any, index) => (
                            <Card 
                              key={index} 
                              className={`cursor-pointer transition-all ${
                                selectedServices.includes(index) 
                                  ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' 
                                  : ''
                              }`}
                              onClick={() => toggleServiceSelection(index)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{service.name}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {service.platform} - {service.type}
                                    </p>
                                  </div>
                                  {selectedServices.includes(index) && (
                                    <CheckCircle className="w-5 h-5 text-blue-500" />
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
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

            {/* Current Services */}
            <Card className="dashboard-card">
              <CardHeader className="border-b border-slate-700">
                <CardTitle className="text-lg font-semibold text-slate-50">
                  Mevcut Servisler
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {servicesLoading ? (
                    <div className="col-span-full text-center text-slate-400">
                      Yükleniyor...
                    </div>
                  ) : !Array.isArray(services) || services.length === 0 ? (
                    <div className="col-span-full text-center text-slate-400">
                      Henüz servis eklenmemiş
                    </div>
                  ) : (
                    Array.isArray(services) && services.map((service: any) => (
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
