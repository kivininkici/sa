import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Key, 
  CheckCircle, 
  Settings, 
  TrendingUp, 
  Plus, 
  Cog, 
  List, 
  Download,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import KeyCreationModal from "@/components/admin/key-creation-modal";
import { useState } from "react";

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const mockActivities = [
    {
      id: 1,
      type: "key_created",
      description: "Yeni key oluşturuldu",
      timestamp: "2 dakika önce",
      status: "Başarılı",
      icon: Key,
      iconColor: "bg-blue-600",
    },
    {
      id: 2,
      type: "order_completed",
      description: "Instagram takipçi siparişi tamamlandı",
      timestamp: "5 dakika önce",
      status: "Tamamlandı",
      icon: CheckCircle,
      iconColor: "bg-green-600",
    },
    {
      id: 3,
      type: "admin_added",
      description: "Yeni admin eklendi",
      timestamp: "1 saat önce",
      status: "Aktif",
      icon: Settings,
      iconColor: "bg-amber-600",
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Dashboard" 
          description="Sistem genel durumu ve istatistikler" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Toplam Key"
                value={stats?.totalKeys || 0}
                change="+8.2% son 30 gün"
                changeType="positive"
                icon={Key}
                iconColor="bg-blue-600"
              />
              <StatsCard
                title="Kullanılan Key"
                value={stats?.usedKeys || 0}
                change="+12.1% son 30 gün"
                changeType="positive"
                icon={CheckCircle}
                iconColor="bg-green-600"
              />
              <StatsCard
                title="Aktif Servis"
                value={stats?.activeServices || 0}
                change="Değişiklik yok"
                changeType="neutral"
                icon={Settings}
                iconColor="bg-purple-600"
              />
              <StatsCard
                title="Günlük İşlem"
                value={stats?.dailyTransactions || 0}
                change="-3.1% son 30 gün"
                changeType="negative"
                icon={TrendingUp}
                iconColor="bg-amber-600"
              />
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <div className="lg:col-span-2">
                <Card className="dashboard-card">
                  <CardHeader className="border-b border-slate-700">
                    <CardTitle className="text-lg font-semibold text-slate-50">
                      Son Aktiviteler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {mockActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4">
                        <div className={`w-10 h-10 ${activity.iconColor} rounded-full flex items-center justify-center`}>
                          <activity.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-50 font-medium">
                            {activity.description}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {activity.timestamp}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <Card className="dashboard-card">
                  <CardHeader className="border-b border-slate-700">
                    <CardTitle className="text-lg font-semibold text-slate-50">
                      Hızlı İşlemler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-3">
                    <Button 
                      className="w-full justify-start space-x-3 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowKeyModal(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Yeni Key Oluştur</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start space-x-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Cog className="w-4 h-4" />
                      <span>Servis Ekle</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start space-x-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <List className="w-4 h-4" />
                      <span>Logları Görüntüle</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start space-x-3 border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Download className="w-4 h-4" />
                      <span>Veri Dışa Aktar</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
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
