import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield, Zap, Users, Star, CheckCircle, TrendingUp, Activity } from "lucide-react";
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
        <section className="py-32 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="slide-up">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-full mb-8 backdrop-blur-sm">
                <Star className="w-5 h-5 text-blue-400 mr-2" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Türkiye'nin En Gelişmiş Sosyal Medya Paneli
                </span>
              </div>
              <h2 className="text-7xl md:text-8xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight tracking-tight">
                KeyPanel
                <span className="block text-5xl md:text-6xl mt-4 font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Premium Yönetim
                </span>
              </h2>
              <p className="text-2xl text-muted-foreground mb-12 max-w-5xl mx-auto leading-relaxed">
                <span className="text-blue-400 font-bold">5000+ servis</span> ile Instagram, TikTok, YouTube ve daha fazlası.
                <br className="hidden md:block" />
                <span className="text-emerald-400 font-bold">Anlık teslimat</span> ve 
                <span className="text-purple-400 font-bold"> 7/24 güvenilir</span> hizmet.
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-16">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-semibold text-foreground">5000+ Aktif Servis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-semibold text-foreground">%99 Başarı Oranı</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-semibold text-foreground">Anlık Teslimat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-8 mb-20 slide-up">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/admin/login'}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white hover:scale-110 transition-all duration-500 px-12 py-6 text-xl font-bold rounded-3xl shadow-[0_20px_50px_rgba(59,130,246,0.3)] hover:shadow-[0_25px_60px_rgba(59,130,246,0.4)] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Shield className="w-7 h-7 mr-3 relative z-10" />
                <span className="relative z-10">Admin Paneli</span>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-3 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 hover:from-emerald-500/20 hover:to-cyan-500/20 text-emerald-400 hover:text-emerald-300 hover:border-emerald-400/70 hover:scale-110 transition-all duration-500 px-12 py-6 text-xl font-bold rounded-3xl backdrop-blur-xl shadow-[0_20px_50px_rgba(16,185,129,0.2)] hover:shadow-[0_25px_60px_rgba(16,185,129,0.3)] relative overflow-hidden group"
                onClick={() => window.location.href = '/user'}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <KeyRound className="w-7 h-7 mr-3 relative z-10" />
                <span className="relative z-10">Servis Kullan</span>
              </Button>
            </div>

            {/* Floating Elements */}
            <div className="relative max-w-6xl mx-auto h-32">
              <div className="floating-animation absolute -top-8 left-16 w-20 h-20 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-blue-400/30">
                <Shield className="w-10 h-10 text-blue-400" />
              </div>
              <div className="floating-animation absolute top-8 right-20 w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-emerald-400/30" style={{animationDelay: '2s'}}>
                <Zap className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="floating-animation absolute -bottom-4 left-1/3 w-18 h-18 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-purple-400/30" style={{animationDelay: '4s'}}>
                <Users className="w-9 h-9 text-purple-400" />
              </div>
              <div className="floating-animation absolute top-4 left-1/2 w-14 h-14 bg-gradient-to-br from-pink-500/30 to-rose-500/30 rounded-xl flex items-center justify-center backdrop-blur-xl border border-pink-400/30" style={{animationDelay: '6s'}}>
                <Star className="w-7 h-7 text-pink-400" />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 bg-gradient-to-b from-blue-500/5 via-purple-500/10 to-pink-500/5 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20 slide-up">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-emerald-500/30 rounded-full mb-8 backdrop-blur-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-sm font-medium bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Premium Özellikler
                </span>
              </div>
              <h3 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Neden KeyPanel?
              </h3>
              <p className="text-2xl text-muted-foreground max-w-4xl mx-auto">
                Sektörün en gelişmiş teknolojisi ile sosyal medya büyümenizi hızlandırın
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400/50 transition-all duration-700 hover:scale-110 hover:shadow-[0_25px_50px_rgba(168,85,247,0.4)] backdrop-blur-xl">
                <CardHeader className="relative z-10 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground mb-3">Güvenli Key Sistemi</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Tek kullanımlık anahtarlar ile maksimum güvenlik ve kontrol. Her key özel şifreleme ile korunur.
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-700 hover:scale-110 hover:shadow-[0_25px_50px_rgba(16,185,129,0.4)] backdrop-blur-xl" style={{animationDelay: '0.1s'}}>
                <CardHeader className="relative z-10 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground mb-3">Anlık Teslimat</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Saniyeler içinde sipariş işleme ve gerçek zamanlı teslimat garantisi.
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/50 transition-all duration-700 hover:scale-110 hover:shadow-[0_25px_50px_rgba(59,130,246,0.4)] backdrop-blur-xl" style={{animationDelay: '0.2s'}}>
                <CardHeader className="relative z-10 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground mb-3">Çoklu Platform</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Instagram, YouTube, TikTok ve 100+ platform için kapsamlı servis desteği.
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </Card>

              <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400/50 transition-all duration-700 hover:scale-110 hover:shadow-[0_25px_50px_rgba(245,158,11,0.4)] backdrop-blur-xl" style={{animationDelay: '0.3s'}}>
                <CardHeader className="relative z-10 p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                    <KeyRound className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground mb-3">Kolay Yönetim</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 p-8 pt-0">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Sezgisel admin paneli ile gelişmiş analitik ve tam kontrol.
                  </p>
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 to-orange-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative overflow-hidden border-t border-purple-500/30 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 py-16">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-pink-600/10"></div>
            <div className="absolute top-10 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-black bg-gradient-to-r from-purple-400 via-blue-400 to-pink-400 bg-clip-text text-transparent">
                  KeyPanel
                </span>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Sosyal medya büyümenizin en güvenilir partneri
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">5000+</div>
                  <div className="text-sm text-muted-foreground">Aktif Servis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">%99</div>
                  <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Destek</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-purple-400 bg-clip-text text-transparent mb-2">1M+</div>
                  <div className="text-sm text-muted-foreground">Mutlu Müşteri</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-purple-500/20">
              <p className="text-muted-foreground text-center mb-4 md:mb-0">
                © 2025 KeyPanel. Tüm hakları saklıdır. Profesyonel sosyal medya çözümleri.
              </p>
              <div className="flex items-center space-x-6">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-300">
                  Gizlilik Politikası
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all duration-300">
                  Kullanım Şartları
                </Button>
                <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-all duration-300">
                  İletişim
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}