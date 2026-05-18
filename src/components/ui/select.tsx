"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ElementType;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, icon: Icon, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex w-full rounded-xl border border-border/50 bg-surface",
            "px-4 py-2.5 text-sm text-foreground",
            "appearance-none cursor-pointer",
            "shadow-sm transition-all duration-200 ease-out-expo",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50",
            "hover:border-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary/30",
            Icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
