import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield, Zap, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">KeyPanel</h1>
                <p className="text-sm text-slate-400">Key Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => window.location.href = '/user'}
              >
                Kullanıcı Paneli
              </Button>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Admin Girişi
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Modern Key Yönetim Sistemi
          </h2>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Sosyal medya servislerinizi güvenli ve etkili bir şekilde yönetin. 
            Tek kullanımlık key'ler ile kontrollü erişim sağlayın.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Admin Paneli
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
              onClick={() => window.location.href = '/user'}
            >
              Servis Kullan
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Özellikler</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Shield className="w-8 h-8 text-blue-500 mb-2" />
                <CardTitle className="text-slate-50">Güvenli Key Sistemi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Tek kullanımlık key'ler ile maksimum güvenlik
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-green-500 mb-2" />
                <CardTitle className="text-slate-50">Hızlı İşlem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Anlık sipariş işleme ve hızlı teslimat
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <Users className="w-8 h-8 text-purple-500 mb-2" />
                <CardTitle className="text-slate-50">Çoklu Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Instagram, YouTube, TikTok ve daha fazlası
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <KeyRound className="w-8 h-8 text-amber-500 mb-2" />
                <CardTitle className="text-slate-50">Kolay Yönetim</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Sezgisel admin paneli ile kolay kontrol
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">
            © 2024 KeyPanel. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
