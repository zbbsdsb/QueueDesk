
import React from "react";

type AvatarProps = {
  name?: string | null;
  email?: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "w-6 h-6 text-xs",
  md: "w-8 h-8 text-sm",
  lg: "w-10 h-10 text-base",
  xl: "w-12 h-12 text-lg",
};

export default function Avatar({
  name,
  email,
  imageUrl,
  size = "md",
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

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-violet-600
        text-white
        font-semibold
        flex
        items-center
        justify-center
        flex-shrink-0
        ${className}
      `}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || email || "Avatar"}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
