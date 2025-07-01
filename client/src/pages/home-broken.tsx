import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, Zap, Users, Star, TrendingUp, Activity, LogOut, User, ExternalLink, Search, ShoppingCart, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/ui/animated-background";

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const { admin } = useAdminAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse tracking effect
  useEffect(() => {
    let rafId: number;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        setMousePosition({
          x: e.clientX,
          y: e.clientY,
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative">
        {/* Mouse tracking effect */}
        <motion.div
          className="fixed w-36 h-36 bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-slate-400/10 rounded-full blur-xl pointer-events-none z-10"
          style={{
            x: mousePosition.x - 72,
            y: mousePosition.y - 72,
          }}
          initial={{ opacity: 1 }}
        />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <FloatingOrbs />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-cyan-500/5 pointer-events-none"></div>
      
      {/* Advanced Mouse tracking effect */}
      <motion.div
        className="fixed w-48 h-48 bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-cyan-400/15 rounded-full blur-2xl pointer-events-none z-10"
        style={{
          x: mousePosition.x - 96,
          y: mousePosition.y - 96,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Enhanced Header */}
      <motion.header 
        className="border-b border-white/10 backdrop-blur-xl bg-black/30 relative z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <motion.div 
                className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg relative"
                whileHover={{ 
                  scale: 1.1, 
                  rotate: [0, -10, 10, 0],
                  boxShadow: "0 20px 40px rgba(139, 92, 246, 0.4)"
                }}
                transition={{ duration: 0.5 }}
              >
                <KeyRound className="w-8 h-8 text-white drop-shadow-lg" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-0"
                  whileHover={{ opacity: 0.3 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">KeyPanel</h1>
                <p className="text-blue-200 text-sm">Sosyal Medya Hizmetleri</p>
              </div>
            </motion.div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Satın Al
              </Button>
              
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{user?.username || 'Kullanıcı'}</span>
              </div>
              
              {/* Admin Panel Button - Only for users who are admins */}
              {user?.isAdmin && (
                <Button 
                  variant="outline"
                  className="border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              
              <Button 
                onClick={async () => {
                  try {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/auth';
                  } catch (error) {
                    window.location.href = '/auth';
                  }
                }}
                variant="outline"
                size="sm"
                className="border-red-400/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sosyal Medya Hizmetleriniz
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Key kodunuzu kullanarak sosyal medya hizmetlerinden yararlanın ve siparişlerinizi takip edin
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/user'}
            >
              <KeyRound className="w-6 h-6 mr-3" />
              Key Kullan
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/order-search'}
            >
              <Search className="w-6 h-6 mr-3" />
              Sipariş Sorgula
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-400">
                <Zap className="w-6 h-6 mr-2" />
                Hızlı İşlem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Key kodunuzu girin ve hemen sosyal medya hizmetlerinize başlayın. Anında işlem garantisi.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-400">
                <Users className="w-6 h-6 mr-2" />
                Güvenilir Hizmet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Instagram, YouTube, Twitter ve daha fazla platform için güvenli ve kaliteli hizmetler.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-400">
                <Activity className="w-6 h-6 mr-2" />
                Canlı Takip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Siparişlerinizi gerçek zamanlı olarak takip edin ve durumunu anında öğrenin.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Service Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-blue-400 mb-2">100+</div>
            <div className="text-gray-300">Aktif Servis</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-purple-400 mb-2">50K+</div>
            <div className="text-gray-300">Tamamlanan Sipariş</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
            <div className="text-gray-300">Destek</div>
          </div>
          <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
            <div className="text-3xl font-bold text-yellow-400 mb-2">⭐ 4.9</div>
            <div className="text-gray-300">Müşteri Memnuniyeti</div>
          </div>
        </div>
      </main>
    </div>
  );
}