import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  info: {
    container: "bg-cyan-500/10 border-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    icon: "text-cyan-600 dark:text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
  success: {
    container: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    icon: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  warning: {
    container: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  error: {
    container: "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-300",
    icon: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10",
  },
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", dismissible = false, onDismiss, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
    };

    const IconComponent = icons[variant];
    const styles = variantStyles[variant];

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        role="alert"
        aria-live={variant === "error" ? "assertive" : "polite"}
        className={cn(
          "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4",
          "transition-all duration-300 ease-out-expo",
          styles.container,
          className
        )}
        {...props}
      >
        <div className={cn("shrink-0 flex items-center justify-center w-10 h-10 rounded-xl", styles.iconBg)}>
          <IconComponent className={cn("w-5 h-5", styles.icon)} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1.5 opacity-60 hover:opacity-100 transition-opacity duration-200 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn("text-sm font-semibold leading-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm opacity-90 leading-relaxed mt-1", className)}
      {...props}
    />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
