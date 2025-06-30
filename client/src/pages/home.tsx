import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, Zap, Users, Star, TrendingUp, Activity, LogOut, User, Settings, Crown } from "lucide-react";
import type { User as UserType } from "@shared/schema";

export default function Home() {
  const { user, isLoading } = useAuth();
  const typedUser = user as UserType & { isAdmin?: boolean };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  KeyPanel
                </h1>
                <p className="text-sm text-gray-400">Hoş geldin, {(user as any)?.id || 'Kullanıcı'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                {(user as any)?.profileImageUrl ? (
                  <img 
                    src={(user as any).profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-white font-medium">{(user as any)?.id || 'Kullanıcı'}</span>
              </div>
              <Button 
                onClick={async () => {
                  try {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/';
                  } catch (error) {
                    window.location.href = '/';
                  }
                }}
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-red-500/20 text-white hover:border-red-400/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-full mb-8 backdrop-blur-sm">
            <Crown className="w-5 h-5 text-yellow-400 mr-2" />
            <span className="text-sm font-medium text-white">
              {typedUser?.isAdmin ? 'Admin' : 'Premium Üye'}
            </span>
          </div>
          
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hoş Geldin!
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            KeyPanel premium özelliklerini keşfet ve sosyal medya büyümeni hızlandır
          </p>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/user'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
            >
              <KeyRound className="w-6 h-6 mr-3" />
              Key Kullan
            </Button>
            {typedUser?.isAdmin && (
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
                onClick={() => window.location.href = '/admin/login'}
              >
                <Shield className="w-6 h-6 mr-3" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Service Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 hover:border-blue-300/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">5.847</CardTitle>
                  <p className="text-blue-400 font-medium">Aktif Servis</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-400/30 hover:border-emerald-300/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">%99.8</CardTitle>
                  <p className="text-emerald-400 font-medium">Başarı Oranı</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:border-purple-300/50 transition-all duration-500 hover:scale-105 backdrop-blur-sm">
            <CardHeader className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-white">2-30s</CardTitle>
                  <p className="text-purple-400 font-medium">Teslimat Süresi</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400/50 hover:border-purple-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg group">
            <CardHeader className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-black text-white mb-3">Güvenli Key Sistemi</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <p className="text-lg text-white/90 font-medium leading-relaxed">
                Tek kullanımlık anahtarlar ile maksimum güvenlik ve tam kontrol
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border-emerald-400/50 hover:border-emerald-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg group">
            <CardHeader className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-black text-white mb-3">Anlık Teslimat</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <p className="text-lg text-white/90 font-medium leading-relaxed">
                2-30 saniye içinde işlem tamamlama garantisi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50 hover:border-blue-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg group">
            <CardHeader className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-black text-white mb-3">Çoklu Platform</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <p className="text-lg text-white/90 font-medium leading-relaxed">
                100+ sosyal medya platformu kapsamlı hizmeti
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-400/50 hover:border-amber-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg group">
            <CardHeader className="p-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Star className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-black text-white mb-3">Premium Kalite</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <p className="text-lg text-white/90 font-medium leading-relaxed">
                Yüksek kaliteli servis ve güvenilir hizmet garantisi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-400/30 rounded-2xl p-8 backdrop-blur-sm">
            <h3 className="text-3xl font-bold text-white mb-4">Hemen Başlayın!</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              KeyPanel'in gücünü keşfedin ve sosyal medya hesaplarınızı bir üst seviyeye taşıyın
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/user'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
            >
              <KeyRound className="w-5 h-5 mr-2" />
              Servisleri Keşfet
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}