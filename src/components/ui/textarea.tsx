import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border border-border/50 bg-surface",
            "px-4 py-3 text-sm text-foreground",
            "placeholder:text-muted-foreground/60",
            "shadow-sm transition-all duration-200 ease-out-expo",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50",
            "hover:border-primary/30",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-secondary/30",
            "resize-none",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
