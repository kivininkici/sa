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
    <header className="bg-background border-b border-border p-6 glass-card">
      <div className="flex items-center justify-between">
        <div className="slide-up">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-4 slide-up" style={{animationDelay: '0.2s'}}>
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full pulse-glow"></span>
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground transition-all duration-300"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
