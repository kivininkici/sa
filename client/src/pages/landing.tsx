import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield, Zap, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border backdrop-blur-xl bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 slide-up">
                <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center glow-effect">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    KeyPanel
                  </h1>
                  <p className="text-sm text-muted-foreground">Modern Key Yönetim Sistemi</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 slide-up">
                <Button 
                  variant="outline" 
                  className="border-border bg-background backdrop-blur-sm hover:bg-accent transition-all duration-300"
                  onClick={() => window.location.href = '/user'}
                >
                  Kullanıcı Paneli
                </Button>
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="gradient-bg hover:scale-105 transition-all duration-300 pulse-glow"
                >
                  Admin Girişi
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="slide-up">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
                Modern Key Yönetim Sistemi
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Sosyal medya servislerinizi güvenli ve etkili bir şekilde yönetin. 
                Tek kullanımlık key'ler ile kontrollü erişim sağlayın ve işlemlerinizi kolaylaştırın.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 slide-up">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                className="gradient-bg hover:scale-105 transition-all duration-300 pulse-glow px-8 py-4 text-lg"
              >
                <Shield className="w-5 h-5 mr-2" />
                Admin Paneli
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-border bg-background backdrop-blur-sm hover:bg-accent transition-all duration-300 px-8 py-4 text-lg"
                onClick={() => window.location.href = '/user'}
              >
                <KeyRound className="w-5 h-5 mr-2" />
                Servis Kullan
              </Button>
            </div>

            {/* Floating Icons */}
            <div className="relative max-w-4xl mx-auto">
              <div className="floating-animation absolute top-0 left-10 w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div className="floating-animation absolute top-20 right-10 w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center" style={{animationDelay: '2s'}}>
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <div className="floating-animation absolute bottom-10 left-1/4 w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center" style={{animationDelay: '4s'}}>
                <Users className="w-7 h-7 text-purple-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-accent/20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12 slide-up">Özellikler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="glass-card slide-up hover:scale-105 transition-all duration-300">
                <CardHeader>
                  <Shield className="w-8 h-8 text-primary mb-2" />
                  <CardTitle className="text-foreground">Güvenli Key Sistemi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Tek kullanımlık key'ler ile maksimum güvenlik
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card slide-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.1s'}}>
                <CardHeader>
                  <Zap className="w-8 h-8 text-green-500 mb-2" />
                  <CardTitle className="text-foreground">Hızlı İşlem</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anlık sipariş işleme ve hızlı teslimat
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card slide-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.2s'}}>
                <CardHeader>
                  <Users className="w-8 h-8 text-purple-500 mb-2" />
                  <CardTitle className="text-foreground">Çoklu Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Instagram, YouTube, TikTok ve daha fazlası
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card slide-up hover:scale-105 transition-all duration-300" style={{animationDelay: '0.3s'}}>
                <CardHeader>
                  <KeyRound className="w-8 h-8 text-amber-500 mb-2" />
                  <CardTitle className="text-foreground">Kolay Yönetim</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sezgisel admin paneli ile kolay kontrol
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              © 2024 KeyPanel. Tüm hakları saklıdır.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}