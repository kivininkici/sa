import { Link, useLocation } from "wouter";
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
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Key Yönetimi", href: "/keys", icon: Key },
  { name: "Servisler", href: "/services", icon: Settings },
  { name: "API Yönetimi", href: "/api-management", icon: Download },
  { name: "Kullanıcılar", href: "/users", icon: Users },
  { name: "Loglar", href: "/logs", icon: FileText },
  { name: "Ayarlar", href: "/settings", icon: Cog },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-background border-r border-border flex flex-col backdrop-blur-xl">
      {/* Logo & Brand */}
      <div className="sidebar-brand">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center glow-effect">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              KeyPanel
            </h1>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a className={`nav-link glass-card transition-all duration-300 ${
                isActive 
                  ? 'bg-primary/20 text-primary border-primary/30 shadow-lg glow-effect' 
                  : 'bg-background/30 text-muted-foreground border-border/30 hover:bg-accent/50 hover:text-foreground hover:border-accent'
              }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border glass-card">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-primary/20">
            <AvatarImage src={(user as any)?.profileImageUrl || ""} alt="Admin" />
            <AvatarFallback className="bg-primary/20 text-primary">
              {(user as any)?.firstName?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {(user as any)?.firstName || "Admin User"}
            </p>
            <p className="text-xs text-muted-foreground">Yönetici</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-300"
            onClick={() => window.location.href = "/api/logout"}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}