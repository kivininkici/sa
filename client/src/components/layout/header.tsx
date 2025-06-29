import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  description: string;
}

export default function Header({ title, description }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 p-6 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5"></div>
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-slate-400 mt-1 text-lg">{description}</p>
        </div>
        <div className="flex items-center space-x-3 animate-fade-in delay-200">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-3 hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all duration-300 rounded-xl"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-3 hover:bg-slate-800/50 text-slate-400 hover:text-cyan-400 transition-all duration-300 rounded-xl"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
