import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { Icon } from "@/components/ui/icon";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  dismissible?: boolean;
  onDismiss?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", dismissible = false, onDismiss, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const getIconComponent = () => {
      switch (variant) {
        case "success":
          return CheckCircle;
        case "warning":
          return AlertTriangle;
        case "error":
          return AlertCircle;
        case "info":
        default:
          return Info;
      }
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "success":
          return "border-success-200 bg-success-50 text-success-900 [&>svg]:text-success-600";
        case "warning":
          return "border-warning-200 bg-warning-50 text-warning-900 [&>svg]:text-warning-600";
        case "error":
          return "border-error-200 bg-error-50 text-error-900 [&>svg]:text-error-600";
        case "info":
        default:
          return "border-info-200 bg-info-50 text-info-900 [&>svg]:text-info-600";
      }
    };

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
          "relative flex w-full items-start gap-3 overflow-hidden rounded-xl border p-4 pr-10",
          "transition-all duration-300 ease-out",
          getVariantStyles(),
          className
        )}
        {...props}
      >
        <Icon icon={getIconComponent()} size="md" aria-hidden="true" />
        <div className="flex-1">{children}</div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-md p-1.5 opacity-70 hover:opacity-100 transition-opacity duration-200 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="关闭提示"
          >
            <Icon icon={X} size="sm" />
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
