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
    <Card className="glass-card hover:scale-105 transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center glow-effect group-hover:scale-110 transition-all duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        {change && (
          <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
            <span className="mr-1">{changeIcons[changeType]}</span>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
