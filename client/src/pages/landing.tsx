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
                  onClick={() => window.location.href = '/admin/login'}
                  className="gradient-bg hover:scale-105 transition-all duration-300 pulse-glow"
                >
                  Admin Girişi
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="slide-up">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full mb-8">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🚀 Profesyonel Sosyal Medya Yönetimi
                </span>
              </div>
              <h2 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent leading-tight">
                KeyPanel
                <span className="block text-4xl md:text-5xl mt-2">Yönetim Sistemi</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-16 max-w-4xl mx-auto leading-relaxed">
                Sosyal medya servislerinizi profesyonel düzeyde yönetin. Güvenli key sistemi ile 
                <span className="text-blue-500 font-semibold"> otomatik sipariş yönetimi</span> ve 
                <span className="text-emerald-500 font-semibold"> gelişmiş analitik</span> özellikleri.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20 slide-up">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/admin-login'}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white hover:scale-105 transition-all duration-500 px-10 py-5 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-blue-500/25"
              >
                <Shield className="w-6 h-6 mr-3" />
                Admin Paneli
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 hover:from-blue-500/10 hover:to-cyan-500/10 text-blue-400 hover:text-blue-300 hover:border-blue-400/50 transition-all duration-500 px-10 py-5 text-lg font-semibold rounded-2xl backdrop-blur-xl"
                onClick={() => window.location.href = '/user'}
              >
                <KeyRound className="w-6 h-6 mr-3" />
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
        <section className="py-24 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 slide-up">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Güçlü Özellikler
              </h3>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Profesyonel sosyal medya yönetimi için ihtiyacınız olan her şey
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Güvenli Key Sistemi</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground leading-relaxed">
                    Tek kullanımlık anahtarlar ile maksimum güvenlik ve kontrol
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 hover:border-green-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20" style={{animationDelay: '0.1s'}}>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Hızlı İşlem</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground leading-relaxed">
                    Anlık sipariş işleme ve gerçek zamanlı teslimat
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20" style={{animationDelay: '0.2s'}}>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Çoklu Platform</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground leading-relaxed">
                    Instagram, YouTube, TikTok ve 100+ platform desteği
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20" style={{animationDelay: '0.3s'}}>
                <CardHeader className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <KeyRound className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Kolay Yönetim</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground leading-relaxed">
                    Sezgisel admin paneli ile gelişmiş analitik ve kontrol
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative overflow-hidden border-t border-blue-500/20 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 py-12">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  KeyPanel
                </span>
              </div>
              <p className="text-muted-foreground text-center">
                © 2025 KeyPanel. Profesyonel sosyal medya yönetimi.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  Gizlilik
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  Şartlar
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}