import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Icon } from "@/components/ui/icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      loading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
          "transition-all duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Primary variant
          variant === "primary" &&
            "bg-primary-600 text-white shadow-md hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500",
          // Secondary variant
          variant === "secondary" &&
            "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 focus-visible:ring-secondary-400",
          // Outline variant
          variant === "outline" &&
            "border-2 border-secondary-300 bg-transparent text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100 focus-visible:ring-primary-500",
          // Ghost variant
          variant === "ghost" &&
            "bg-transparent text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-primary-500",
          // Link variant
          variant === "link" &&
            "bg-transparent text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 focus-visible:ring-primary-500",
          // Destructive variant
          variant === "destructive" &&
            "bg-error-600 text-white shadow-md hover:bg-error-700 active:bg-error-800 focus-visible:ring-error-500",
          // Sizes
          size === "xs" && "h-7 px-2 text-xs rounded-md",
          size === "sm" && "h-8 px-3 text-sm rounded-md",
          size === "default" && "h-9 px-4 text-sm rounded-md",
          size === "lg" && "h-11 px-6 text-base rounded-lg",
          size === "icon" && "h-9 w-9 rounded-md",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Icon icon={Loader2} size="sm" className="animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
