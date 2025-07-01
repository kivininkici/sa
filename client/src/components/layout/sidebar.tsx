import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  Key,
  Settings,
  Users,
  Activity,
  Server,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShoppingCart,
  FileText,
  Cog,
  Download,
  Search,
  BarChart3,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Key Yönetimi", href: "/admin/keys", icon: Key },
  { name: "Servisler", href: "/admin/services", icon: Settings },
  { name: "API Yönetimi", href: "/admin/api-management", icon: Download },
  { name: "API Bakiyeleri", href: "/admin/api-balances", icon: DollarSign },
  { name: "Siparişler", href: "/admin/orders", icon: ShoppingCart },
  { name: "Kullanıcılar", href: "/admin/users", icon: Users },
  { name: "Loglar", href: "/admin/logs", icon: FileText },
  { name: "Sipariş Sorgula", href: "/admin/order-search", icon: Search },
  { name: "Key İstatistikleri", href: "/admin/key-stats", icon: BarChart3 },
  { name: "Ayarlar", href: "/admin/settings", icon: Cog },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { admin, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 text-white hover:bg-slate-800"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 flex flex-col relative z-40 fixed md:relative inset-y-0 left-0 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-cyan-500/5"></div>
      
      {/* Logo & Brand */}
      <div className="relative z-10 p-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 relative group">
            <Key className="w-6 h-6 text-white" />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              KeyPanel
            </h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 relative z-10">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer group relative ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50'
              }`}>
                <item.icon className={`w-5 h-5 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-cyan-400'
                }`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute right-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700/50 relative z-10">
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/30 backdrop-blur-sm">
          <Avatar className="w-10 h-10 border-2 border-blue-500/30">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold">
              {admin?.username?.[0]?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-100">
              {admin?.username || "Admin User"}
            </p>
            <p className="text-xs text-slate-400">Yönetici</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-300 rounded-lg"
            onClick={() => logout()}
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
    </>
  );
}