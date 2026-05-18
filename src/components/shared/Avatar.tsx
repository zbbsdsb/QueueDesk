import React from "react";

type AvatarProps = {
  name?: string | null;
  email?: string;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "away" | "offline";
  className?: string;
};

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

const statusSizeClasses = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
  xl: "w-3.5 h-3.5",
};

const statusColors = {
  online: "bg-emerald-500",
  away: "bg-amber-500",
  offline: "bg-slate-400",
};

function getGradientClass(initials: string): string {
  const gradients = [
    "from-blue-500 to-violet-500",
    "from-violet-500 to-pink-500",
    "from-emerald-500 to-cyan-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-red-500",
    "from-cyan-500 to-blue-500",
  ];
  
  const charCodeSum = initials.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return gradients[charCodeSum % gradients.length];
}

export default function Avatar({
  name,
  email,
  imageUrl,
  size = "md",
  status,
  className = "",
}: AvatarProps) {
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

  const initials = getInitials();
  const gradient = getGradientClass(initials);

  return (
    <div className={`relative inline-flex ${className}`}>
      {imageUrl ? (
        <div className={`
          ${sizeClasses[size]}
          rounded-xl
          overflow-hidden
          ring-2 ring-background
          shadow-lg
        `}>
          <img
            src={imageUrl}
            alt={name || email || "Avatar"}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`
          ${sizeClasses[size]}
          rounded-xl
          bg-gradient-to-br ${gradient}
          text-white
          font-bold
          flex
          items-center
          justify-center
          flex-shrink-0
          shadow-lg
          ring-2 ring-white/20
          transition-transform duration-200
          hover:scale-105
        `}>
          {initials}
        </div>
      )}
      
      {status && (
        <span 
          className={`
            absolute bottom-0 right-0 
            ${statusSizeClasses[size]}
            ${statusColors[status]}
            rounded-full 
            ring-2 ring-background
            animate-pulse
          `} 
        />
      )}
    </div>
  );
}
