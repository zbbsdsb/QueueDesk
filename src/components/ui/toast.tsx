import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Icon } from "@/components/ui/icon";

type ToastVariant = "default" | "destructive" | "success" | "warning" | "info";

interface ToastProps extends React.ComponentProps<"div"> {
  variant?: ToastVariant;
}

type ToastActionElement = React.ReactElement;

const ToastProvider = ({ children }: { children: React.ReactNode }) => children;

const ToastViewport = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4",
      "sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const getIconComponent = () => {
      switch (variant) {
        case "success":
          return CheckCircle;
        case "warning":
        case "destructive":
          return AlertCircle;
        case "info":
          return Info;
        default:
          return null;
      }
    };

    const getVariantStyles = () => {
      switch (variant) {
        case "success":
          return "border-success-200 bg-success-50 text-success-900";
        case "warning":
          return "border-warning-200 bg-warning-50 text-warning-900";
        case "info":
          return "border-info-200 bg-info-50 text-info-900";
        case "destructive":
          return "border-error-200 bg-error-50 text-error-900";
        default:
          return "border-secondary-200 bg-surface-1 text-slate-900";
      }
    };

    const IconComponent = getIconComponent();

    return (
      <div
        ref={ref}
        role="status"
        aria-live={variant === "destructive" ? "assertive" : "polite"}
        className={cn(
          "group pointer-events-auto relative flex w-full items-start gap-3",
          "overflow-hidden rounded-xl border p-4 pr-8 shadow-lg",
          "transition-all duration-300 ease-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full",
          "data-[state=open]:slide-in-from-bottom-full",
          getVariantStyles(),
          className
        )}
        {...props}
      >
        {IconComponent && (
          <Icon icon={IconComponent} size="md" />
        )}
        <div className="flex-1">{props.children}</div>
      </div>
    );
  }
);
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-80 leading-relaxed mt-1", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1.5 opacity-0 transition-all duration-200",
      "hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400",
      "group-hover:opacity-100 hover:bg-black/10",
      className
    )}
    aria-label="关闭通知"
    {...props}
  >
    <Icon icon={X} size="sm" />
  </button>
));
ToastClose.displayName = "ToastClose";

export {
  type ToastProps,
  type ToastActionElement,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastProvider,
  ToastViewport,
};
