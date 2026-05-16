import React from "react";
import { Icon as CustomIcon } from "@/components/ui/icon";

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  bg: string;
  iconColor: string;
}

export default function StatCard({
  label,
  value,
  change,
  icon,
  bg,
  iconColor,
}: StatCardProps) {
  return (
    <div className="premium-card bg-white dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 rounded-2xl p-6 flex items-start gap-4 hover:border-blue-200 dark:hover:border-blue-700/50">
      <div className={`${bg} rounded-xl p-3.5`}>
        <CustomIcon icon={icon} size="md" className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{change}</p>
      </div>
    </div>
  );
}
