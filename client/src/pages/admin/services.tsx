import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Service } from "@shared/schema";

export default function Services() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/admin/services/all"],
    retry: false,
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Servis başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
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

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Servis Yönetimi" 
          description="Sosyal medya servislerini yapılandırın" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-50">Servis Yönetimi</h2>
                <p className="text-slate-400">Sosyal medya servislerini yapılandırın</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Servis Ekle
              </Button>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesLoading ? (
                <div className="col-span-full text-center text-slate-400">
                  Yükleniyor...
                </div>
              ) : !services || services.length === 0 ? (
                <div className="col-span-full text-center text-slate-400">
                  Henüz servis eklenmemiş
                </div>
              ) : (
                (services || []).map((service: Service) => (
                  <Card key={service.id} className="dashboard-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Settings className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-slate-50 text-sm">
                              {service.name}
                            </CardTitle>
                            <p className="text-xs text-slate-400">
                              {service.platform}
                            </p>
                          </div>
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
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-slate-400 mb-4">
                        {service.type}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Düzenle
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-400 border-red-800 hover:bg-red-900"
                          onClick={() => deleteServiceMutation.mutate(service.id)}
                          disabled={deleteServiceMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Add Default Services Button */}
            {(!services || services.length === 0) && (
              <Card className="dashboard-card">
                <CardContent className="p-8 text-center">
                  <Settings className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-50 mb-2">
                    Henüz Servis Yok
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Başlamak için varsayılan servisleri ekleyin
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Varsayılan Servisleri Ekle
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
