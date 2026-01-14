import { cn } from "@/lib/utils";

interface LobbyLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

const LobbyLogo = ({ size = "md", showSubtitle = true, className, animate = false }: LobbyLogoProps) => {
  const sizeClasses = {
    sm: {
      icon: "w-6 h-6",
      lobby: "text-2xl",
      quattro: "text-sm",
      subtitle: "text-[9px]",
      gap: "gap-0.5",
    },
    md: {
      icon: "w-10 h-10",
      lobby: "text-4xl",
      quattro: "text-lg",
      subtitle: "text-[10px]",
      gap: "gap-0.5",
    },
    lg: {
      icon: "w-14 h-14",
      lobby: "text-5xl",
      quattro: "text-xl",
      subtitle: "text-xs",
      gap: "gap-1",
    },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Icon - 4 squares representing "Quattro" */}
      <div className={cn("grid grid-cols-2 mb-3", s.gap, s.icon, animate && "animate-fade-up")}>
        <div className="rounded-sm bg-gradient-to-br from-primary to-primary/70 shadow-lg animate-pulse" style={{ animationDelay: "0ms", animationDuration: "3s" }} />
        <div className="rounded-sm bg-gradient-to-br from-primary/80 to-primary/50 shadow-lg animate-pulse" style={{ animationDelay: "150ms", animationDuration: "3s" }} />
        <div className="rounded-sm bg-gradient-to-br from-primary/60 to-primary/40 shadow-lg animate-pulse" style={{ animationDelay: "300ms", animationDuration: "3s" }} />
        <div className="rounded-sm bg-gradient-to-br from-primary/90 to-primary/60 shadow-lg animate-pulse" style={{ animationDelay: "450ms", animationDuration: "3s" }} />
      </div>
      
      {/* Text with hierarchy */}
      <div className={cn("flex flex-col items-center", animate && "animate-fade-up")}>
        <span className={cn("font-bold tracking-tight text-foreground", s.lobby)}>
          LOBBY
        </span>
        <span className={cn(
          "font-semibold tracking-[0.2em] text-gradient-gold -mt-1",
          s.quattro
        )}>
          QUATTRO
        </span>
      </div>
      
      {/* Discrete subtitle */}
      {showSubtitle && (
        <p className={cn(
          "text-muted-foreground/60 mt-4 tracking-[0.2em] uppercase font-light",
          s.subtitle,
          animate && "animate-fade-up animation-delay-200"
        )}>
          by Studio Quattro 9 — Ads & Social
        </p>
      )}
    </div>
  );
};

export default LobbyLogo;
