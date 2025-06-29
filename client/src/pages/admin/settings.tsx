import { useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  if (isLoading || !admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Header 
          title="Sistem Ayarları" 
          description="Uygulama ayarlarını yapılandırın" 
        />
        
        <div className="content-area">
          <div className="p-6 space-y-6">
            <Card className="dashboard-card">
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-50 mb-2">
                  Sistem Ayarları
                </h3>
                <p className="text-slate-400">
                  Bu bölüm yakında gelecek
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
