import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, Zap, Users, Activity, LogOut, User, Search, ShoppingCart, Crown, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/ui/animated-background";

export default function HomeModern() {
  const { user, isLoading: userLoading } = useAuth();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        <FloatingOrbs />
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
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <KeyRound className="w-10 h-10 text-white" />
          </motion.div>
          <p className="text-white text-xl gradient-text">Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  const featureCards = [
    {
      title: "Hızlı İşlem",
      description: "Key kodunuzu girin ve hemen sosyal medya hizmetlerinize başlayın. Anında işlem garantisi.",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      delay: 0.1
    },
    {
      title: "Güvenilir Hizmet", 
      description: "Instagram, YouTube, Twitter ve daha fazla platform için güvenli ve kaliteli hizmetler.",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      delay: 0.2
    },
    {
      title: "Canlı Takip",
      description: "Siparişlerinizi gerçek zamanlı olarak takip edin ve durumunu anında öğrenin.",
      icon: Activity,
      color: "from-emerald-500 to-green-500", 
      delay: 0.3
    }
  ];

  const stats = [
    { value: "100+", label: "Aktif Servis", color: "text-blue-400", delay: 0.1 },
    { value: "50K+", label: "Tamamlanan Sipariş", color: "text-purple-400", delay: 0.2 },
    { value: "24/7", label: "Destek", color: "text-emerald-400", delay: 0.3 },
    { value: "⭐ 4.9", label: "Müşteri Memnuniyeti", color: "text-yellow-400", delay: 0.4 }
  ];

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
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Satın Al
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm neo-card"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{user?.username || 'Kullanıcı'}</span>
              </motion.div>
              
              {/* Admin Panel Button - Only for users who are admins */}
              <AnimatePresence>
                {user?.isAdmin && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      variant="outline"
                      className="border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 neo-card"
                      onClick={() => window.location.href = '/admin'}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
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
                  className="border-red-400/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 neo-card"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.main 
        className="container mx-auto px-4 py-16 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h2 
            className="text-6xl font-bold mb-6 gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Sosyal Medya Hizmetleriniz
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Key kodunuzu kullanarak sosyal medya hizmetlerinden yararlanın ve siparişlerinizi takip edin
          </motion.p>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                className="cyber-button text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl"
                onClick={() => window.location.href = '/user'}
              >
                <KeyRound className="w-6 h-6 mr-3" />
                Key Kullan
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm neo-card"
                onClick={() => window.location.href = '/order-search'}
              >
                <Search className="w-6 h-6 mr-3" />
                Sipariş Sorgula
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: card.delay,
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
              <Card className="neo-card bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500 group">
                <CardHeader>
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ 
                      rotate: [0, -10, 10, 0],
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <card.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-xl font-bold text-white group-hover:gradient-text transition-all duration-300">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 group-hover:text-white transition-colors duration-300">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Service Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 neo-card bg-white/5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: stat.delay }}
              whileHover={{ 
                scale: 1.05,
                y: -5,
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className={`text-4xl font-bold ${stat.color} mb-2`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: stat.delay + 0.2 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-gray-300 group-hover:text-white transition-colors duration-300">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.main>
    </div>
  );
}