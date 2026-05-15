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
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`${bg} rounded-xl p-3`}>
        <CustomIcon icon={icon} size="md" className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{change}</p>
      </div>
    </div>
  );
}
