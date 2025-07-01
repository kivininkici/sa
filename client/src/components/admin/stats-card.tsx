import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor,
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-slate-400",
  };

  const changeIcons = {
    positive: "↑",
    negative: "↓",
    neutral: "—",
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-purple-500/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-slate-400 text-sm font-medium tracking-wide">{title}</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {value}
            </p>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
        {change && (
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            
          </div>
        )}
      </CardContent>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </Card>
  );
}
