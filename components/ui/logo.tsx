import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const svgSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export function KasPayLogo({ size = "md", className }: LogoProps) {
  const s = svgSizes[size];
  return (
    <div
      className={cn(
        sizes[size],
        "bg-primary border-2 border-foreground rounded-md flex items-center justify-center shadow-brutal-sm shrink-0",
        className
      )}
    >
      <svg
        width={s * 0.6}
        height={s * 0.6}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Letter K left stroke */}
        <rect x="4" y="3" width="5" height="26" rx="1" fill="currentColor" className="text-primary-foreground" />
        {/* Lightning bolt forming the K's right strokes */}
        <path
          d="M11 15L20 3H26L17 14H24L11 29L15 17H11V15Z"
          fill="currentColor"
          className="text-primary-foreground"
        />
      </svg>
    </div>
  );
}

export function KasPayWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const textSize = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };
  return (
    <div className="flex items-center gap-2.5">
      <KasPayLogo size={size} />
      <span className={cn("font-black tracking-tight", textSize[size])}>
        KasPay
      </span>
    </div>
  );
}
