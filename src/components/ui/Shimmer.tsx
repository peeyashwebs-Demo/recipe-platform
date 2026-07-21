"use client";

interface ShimmerProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string;
  height?: string;
}

export default function Shimmer({
  className = "",
  variant = "rectangular",
  width,
  height,
}: ShimmerProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
