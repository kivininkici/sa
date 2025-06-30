import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield, Zap, Users, Star, CheckCircle, TrendingUp, Activity, LogIn, UserPlus, Crown, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-pink-400 rounded-full animate-ping delay-1000"></div>
      </div>
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    KeyPanel
                  </h1>
                  <p className="text-sm text-gray-400">Premium Key Yönetimi</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  className="border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                  onClick={() => window.location.href = '/user'}
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Kullanıcı Paneli
                </Button>
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Giriş Yap
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full mb-8 backdrop-blur-sm">
                <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-white">
                  Türkiye'nin #1 Sosyal Medya Paneli
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  KeyPanel
                </span>
                <br />
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Premium Experience
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
                <span className="text-blue-400 font-bold">5000+</span> aktif servis ile Instagram, TikTok, YouTube ve daha fazlası.
                <br />
                <span className="text-emerald-400 font-bold">Anlık teslimat</span> ve 
                <span className="text-purple-400 font-bold"> 7/24 güvenilir</span> hizmet.
              </p>
              
              {/* Live Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-16">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-semibold">5.847 Aktif Servis</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-semibold">%99.8 Başarı Oranı</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">2-30 Sn Teslimat</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
              <Button 
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
              >
                <UserPlus className="w-6 h-6 mr-3" />
                Kayıt Ol / Giriş Yap
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
                onClick={() => window.location.href = '/user'}
              >
                <KeyRound className="w-6 h-6 mr-3" />
                Key Kullan
              </Button>
            </div>

            {/* Floating Service Icons */}
            <div className="relative max-w-4xl mx-auto h-32">
              <div className="absolute -top-4 left-16 w-16 h-16 bg-gradient-to-br from-pink-500/30 to-red-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-pink-400/30 animate-bounce">
                <span className="text-2xl">📷</span>
              </div>
              <div className="absolute top-8 right-20 w-14 h-14 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-400/30 animate-bounce delay-500">
                <span className="text-xl">🎵</span>
              </div>
              <div className="absolute -bottom-2 left-1/3 w-18 h-18 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-red-400/30 animate-bounce delay-1000">
                <span className="text-2xl">📹</span>
              </div>
              <div className="absolute top-4 left-1/2 w-12 h-12 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/30 animate-bounce delay-1500">
                <span className="text-lg">💎</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-full mb-8 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-white">SMMKİWİ</span>
              </div>
              <h3 className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Neden KeyPanel?
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Sektörün en gelişmiş teknolojisi ile sosyal medya büyümenizi hızlandırın
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400/50 hover:border-purple-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Güvenli Key Sistemi</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    Tek kullanımlık anahtarlar ile maksimum güvenlik ve tam kontrol sağlar.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border-emerald-400/50 hover:border-emerald-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Anlık Teslimat</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    2-30 saniye içinde sipariş işleme ve gerçek zamanlı teslimat garantisi.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50 hover:border-blue-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Çoklu Platform</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    Instagram, YouTube, TikTok ve 100+ platform için kapsamlı hizmet.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-400/50 hover:border-amber-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <KeyRound className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Kolay Yönetim</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    Gelişmiş admin paneli ile tam kontrol ve detaylı analitik.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  KeyPanel
                </h3>
              </div>
              <p className="text-gray-400 mb-8">
                Türkiye'nin en güvenilir sosyal medya paneli
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <span>© 2025 KeyPanel</span>
                <span>•</span>
                <span>Tüm hakları saklıdır</span>
                <span>•</span>
                <span>Premium Hizmet</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">KeyPanel'e Hoş Geldin</h3>
              <p className="text-gray-400">Hesabınıza giriş yapın veya yeni hesap oluşturun</p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/auth';
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Kayıt Ol / Giriş Yap
              </Button>
            </div>

            <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-400/30 rounded-xl">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-400 font-semibold">Güvenli Giriş</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hızlı kayıt olun ve güvenli key yönetimi sistemimize erişin
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}