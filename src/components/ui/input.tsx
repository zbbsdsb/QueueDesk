import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-lg border border-secondary-300",
          "bg-surface-1 px-3 py-2 text-sm text-slate-900",
          "placeholder:text-slate-400",
          "shadow-sm transition-all duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500",
          "hover:border-secondary-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-700",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
