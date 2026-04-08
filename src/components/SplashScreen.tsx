import { useState, useEffect } from "react";

interface SplashScreenProps {
  ghostId: string;
  alias: string;
  onComplete: () => void;
}

const SplashScreen = ({ ghostId, alias, onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"logo" | "glitch" | "identity" | "done">("logo");

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("glitch"), 1200),
      setTimeout(() => setPhase("identity"), 2200),
      setTimeout(() => setPhase("done"), 3800),
      setTimeout(onComplete, 4200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${
        phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
      </div>

      {/* Logo */}
      <div
        className={`relative transition-all duration-700 ${
          phase === "logo" ? "scale-100 opacity-100" : ""
        } ${phase === "glitch" ? "splash-glitch" : ""} ${
          phase === "identity" || phase === "done" ? "scale-75 opacity-60 -translate-y-12" : ""
        }`}
      >
        <span className="text-7xl ghost-float">👻</span>
      </div>

      <h1
        className={`font-mono text-2xl font-bold tracking-widest mt-6 transition-all duration-700 ${
          phase === "logo"
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0 neon-text text-primary"
        } ${phase === "glitch" ? "splash-glitch" : ""} ${
          phase === "identity" || phase === "done" ? "scale-90 -translate-y-8" : ""
        }`}
      >
        GHOST PROTOCOL
      </h1>

      <p
        className={`font-mono text-xs text-muted-foreground mt-2 tracking-[0.3em] transition-all duration-500 ${
          phase === "glitch" ? "opacity-100" : phase === "logo" ? "opacity-0" : "opacity-0"
        }`}
      >
        INITIALIZING ANONYMOUS SESSION...
      </p>

      {/* Identity reveal */}
      <div
        className={`mt-8 flex flex-col items-center gap-3 transition-all duration-700 ${
          phase === "identity" || phase === "done"
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-90"
        }`}
      >
        <div className="glass rounded-xl px-6 py-4 neon-glow text-center space-y-2">
          <p className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
            Your Ghost Identity
          </p>
          <p className="text-lg font-mono font-bold text-primary neon-text">{alias}</p>
          <p className="text-xs font-mono text-muted-foreground">{ghostId}</p>
        </div>
        <p className="text-xs font-mono text-muted-foreground/50 animate-pulse">
          Entering the void...
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
