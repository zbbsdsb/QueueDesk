import * as React from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon, LucideProps } from "lucide-react";

export interface IconProps extends Omit<LucideProps, "className"> {
  icon: LucideIcon;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: string;
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
};

export function Icon({ icon: LucideIcon, size = "md", className, color, ...props }: IconProps) {
  return (
    <LucideIcon
      className={cn(
        sizeClasses[size as keyof typeof sizeClasses],
        "transition-all duration-200 ease-in-out",
        className
      )}
      color={color}
      {...props}
    />
  );
}
