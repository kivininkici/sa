import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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
    <Card className="group relative overflow-hidden neo-card bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-slate-700/50 hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/25">
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <motion.p 
              className="text-slate-400 text-sm font-medium tracking-wide uppercase"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.p>
            <motion.p 
              className="text-3xl font-bold gradient-text"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {value}
            </motion.p>
          </div>
          <motion.div 
            className={`w-16 h-16 ${iconColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
            whileHover={{ 
              scale: 1.1, 
              rotate: [0, -5, 5, 0],
            }}
            transition={{ duration: 0.3 }}
          >
            <Icon className="w-8 h-8 text-white drop-shadow-lg" />
          </motion.div>
        </div>
        {change && (
          <motion.div 
            className="mt-4 pt-3 border-t border-slate-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-semibold ${changeColors[changeType]}`}>
                {changeIcons[changeType]}
              </span>
              <span className={`text-xs font-medium ${changeColors[changeType]}`}>
                {change}
              </span>
            </div>
          </motion.div>
        )}
      </CardContent>
      
      {/* Animated background gradient */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        whileHover={{
          background: [
            "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))",
            "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
            "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
      </div>
    </Card>
  );
}
