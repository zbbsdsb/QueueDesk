import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success" | "warning" | "info";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
}

const variantStyles = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-secondary/10 text-muted-foreground border-secondary/20",
  outline: "bg-transparent text-foreground border-border",
  destructive: "bg-error/10 text-error border-error/20",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  info: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
};

const dotColors = {
  default: "bg-primary",
  secondary: "bg-muted-foreground",
  outline: "bg-foreground",
  destructive: "bg-error",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  info: "bg-cyan-500",
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "md", dot = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200",
          "border",
          variantStyles[variant],
          size === "sm" && "px-2 py-0.5 text-[10px]",
          size === "md" && "px-2.5 py-1 text-xs",
          size === "lg" && "px-3 py-1.5 text-sm",
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
        )}
        {props.children}
      </div>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
