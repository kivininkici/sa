import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Key, 
  Settings, 
  Users, 
  FileText, 
  Cog,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Key Yönetimi", href: "/keys", icon: Key },
  { name: "Servisler", href: "/services", icon: Settings },
  { name: "Kullanıcılar", href: "/users", icon: Users },
  { name: "Loglar", href: "/logs", icon: FileText },
  { name: "Ayarlar", href: "/settings", icon: Cog },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
      {/* Logo & Brand */}
      <div className="sidebar-brand">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-50">KeyPanel</h1>
            <p className="text-xs text-slate-400">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a className={`nav-link ${isActive ? 'active' : ''}`}>
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || ""} alt="Admin" />
            <AvatarFallback className="bg-slate-700 text-slate-300">
              {user?.firstName?.[0] || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-50">
              {user?.firstName || "Admin User"}
            </p>
            <p className="text-xs text-slate-400">Yönetici</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-300"
            onClick={() => window.location.href = "/api/logout"}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
