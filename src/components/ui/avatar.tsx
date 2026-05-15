import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string | null;
  email?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: React.ReactNode;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, name, email, src, size = "md", fallback, ...props }, ref) => {
    const getInitials = () => {
      if (name) {
        return name
          .split(/\s+/)
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
      }
      if (email) {
        return email[0]?.toUpperCase() || "?";
      }
      return "?";
    };

    const sizeClasses = {
      sm: "w-6 h-6 text-xs",
      md: "w-8 h-8 text-sm",
      lg: "w-10 h-10 text-base",
      xl: "w-12 h-12 text-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full bg-accent-600 text-white font-semibold flex-shrink-0 overflow-hidden",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={name || email || "Avatar"}
            className="w-full h-full object-cover"
          />
        ) : (
          fallback || getInitials()
        )}
      </div>
    );
  }
);
Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, children, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleAvatars = max ? childrenArray.slice(0, max) : childrenArray;
    const remaining = max ? childrenArray.length - max : 0;

    return (
      <div
        ref={ref}
        className={cn("flex items-center -space-x-3", className)}
        {...props}
      >
        {visibleAvatars.map((avatar, index) => (
          <div
            key={index}
            className="ring-2 ring-white rounded-full"
          >
            {avatar}
          </div>
        ))}
        {remaining > 0 && (
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-secondary-200 text-secondary-700 font-semibold text-sm ring-2 ring-white">
            +{remaining}
          </div>
        )}
      </div>
    );
  }
);
AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
