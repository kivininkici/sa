import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield, Zap, Users, Star, CheckCircle, TrendingUp, Activity, LogIn, UserPlus, Crown, Sparkles, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedBackground, FloatingOrbs } from "@/components/ui/animated-background";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Advanced Animated Background */}
      <AnimatedBackground />
      <FloatingOrbs />
      
      {/* Enhanced Mouse tracking effect */}
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
      
      {/* Additional floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-32 w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            x: [0, 10, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-32 left-1/3 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
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
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Satın Al
                </Button>
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
              <motion.div 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-full mb-8 backdrop-blur-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                </motion.div>
                <span className="text-sm font-medium text-white">
                  Türkiye'nin #1 Sosyal Medya Paneli
                </span>
              </motion.div>
              
              <motion.h2 
                className="text-6xl md:text-8xl font-black mb-8 leading-tight"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              >
                <motion.span 
                  className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent gradient-text"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  KeyPanel
                </motion.span>
                <br />
                <motion.span 
                  className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Premium Experience
                </motion.span>
              </motion.h2>
              
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

            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-6 mb-20"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button 
                  size="lg"
                  onClick={() => setShowAuthModal(true)}
                  className="cyber-button text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/40 relative overflow-hidden"
                >
                  <UserPlus className="w-6 h-6 mr-3" />
                  Kayıt Ol / Giriş Yap
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm relative overflow-hidden neo-card"
                  onClick={() => window.location.href = '/user'}
                >
                  <KeyRound className="w-6 h-6 mr-3" />
                  Key Kullan
                </Button>
              </motion.div>
            </motion.div>

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
              {[
                {
                  icon: Shield,
                  title: "Güvenli Key Sistemi", 
                  description: "Tek kullanımlık anahtarlar ile maksimum güvenlik ve tam kontrol sağlar.",
                  colors: "from-purple-500/30 to-pink-500/30 border-purple-400/50 hover:border-purple-300/70",
                  iconColors: "from-purple-500 to-pink-500",
                  delay: 0
                },
                {
                  icon: Zap,
                  title: "Anlık Teslimat", 
                  description: "2-30 saniye içinde sipariş işleme ve gerçek zamanlı teslimat garantisi.",
                  colors: "from-emerald-500/30 to-cyan-500/30 border-emerald-400/50 hover:border-emerald-300/70",
                  iconColors: "from-emerald-500 to-cyan-500",
                  delay: 0.1
                },
                {
                  icon: Users,
                  title: "Çoklu Platform", 
                  description: "Instagram, YouTube, TikTok ve 100+ platform için kapsamlı hizmet.",
                  colors: "from-blue-500/30 to-cyan-500/30 border-blue-400/50 hover:border-blue-300/70",
                  iconColors: "from-blue-500 to-cyan-500",
                  delay: 0.2
                },
                {
                  icon: KeyRound,
                  title: "Kolay Yönetim", 
                  description: "Gelişmiş admin paneli ile tam kontrol ve detaylı analitik.",
                  colors: "from-amber-500/30 to-orange-500/30 border-amber-400/50 hover:border-amber-300/70",
                  iconColors: "from-amber-500 to-orange-500",
                  delay: 0.3
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, rotateY: -15 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: feature.delay,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    rotateY: 5,
                    transition: { duration: 0.3 }
                  }}
                  className="perspective-1000"
                >
                  <Card className={`neo-card bg-gradient-to-br ${feature.colors} transition-all duration-500 backdrop-blur-sm shadow-lg hover:shadow-2xl group`}>
                    <CardHeader className="p-8">
                      <motion.div 
                        className={`w-20 h-20 bg-gradient-to-br ${feature.iconColors} rounded-3xl flex items-center justify-center mb-6 shadow-lg`}
                        whileHover={{ 
                          rotate: [0, -10, 10, 0],
                          scale: 1.1
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <feature.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      <CardTitle className="text-2xl font-black text-white mb-3 group-hover:gradient-text transition-all duration-300">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <p className="text-lg font-medium leading-relaxed text-gray-300 group-hover:text-white transition-colors duration-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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