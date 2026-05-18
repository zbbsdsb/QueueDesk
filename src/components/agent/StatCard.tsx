import React from "react";
import { Icon as CustomIcon } from "@/components/ui/icon";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "neutral" | "up" | "down";
  icon: React.ElementType;
  accentColor?: "blue" | "violet" | "emerald" | "amber" | "rose";
}

const accentStyles = {
  blue: {
    gradient: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    glow: "hover:shadow-blue-500/10",
  },
  violet: {
    gradient: "from-violet-500/10 to-violet-600/5",
    iconBg: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    glow: "hover:shadow-violet-500/10",
  },
  emerald: {
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    glow: "hover:shadow-emerald-500/10",
  },
  amber: {
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    glow: "hover:shadow-amber-500/10",
  },
  rose: {
    gradient: "from-rose-500/10 to-rose-600/5",
    iconBg: "bg-rose-100 dark:bg-rose-900/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    glow: "hover:shadow-rose-500/10",
  },
};

const changeColors = {
  neutral: "text-muted-foreground",
  up: "text-emerald-600 dark:text-emerald-400",
  down: "text-rose-600 dark:text-rose-400",
};

export default function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  accentColor = "blue",
}: StatCardProps) {
  const style = accentStyles[accentColor];
  
  return (
    <div 
      className={`
        group relative overflow-hidden
        bg-surface border border-border/50 rounded-2xl p-6
        transition-all duration-300 ease-out-expo
        hover:border-primary/20 hover:shadow-lg ${style.glow}
        hover:-translate-y-0.5
      `}
    >
      {/* Background Gradient Decoration */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${style.gradient} 
        opacity-0 group-hover:opacity-100 
        transition-opacity duration-500
      `} />
      
      {/* Top Right Decorative Element */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-primary/5 to-accent/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start gap-4">
        {/* Icon Container */}
        <div className={`
          relative flex items-center justify-center w-14 h-14 rounded-2xl
          ${style.iconBg}
          transition-transform duration-300 ease-out-expo
          group-hover:scale-110
        `}>
          <CustomIcon icon={icon} size="lg" className={style.iconColor} />
          
          {/* Icon Glow Effect */}
          <div className={`
            absolute inset-0 rounded-2xl ${style.iconColor.replace('text-', 'bg-').replace('/600', '/20').replace('/400', '/20')}
            blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
          `} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            <span className="text-lg font-semibold text-foreground/60">+</span>
          </div>
          
          {change && (
            <div className={`flex items-center gap-1 mt-2`}>
              {changeType === "up" && (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
              {changeType === "down" && (
                <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              )}
              <p className={`text-xs font-medium ${changeColors[changeType]}`}>
                {change}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Border Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
