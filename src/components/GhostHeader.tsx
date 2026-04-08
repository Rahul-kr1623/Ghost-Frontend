import { Ghost } from "lucide-react";

interface GhostHeaderProps {
  ghostId: string;
  alias: string;
}

const GhostHeader = ({ ghostId, alias }: GhostHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border">
      <div className="container max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Ghost className="w-8 h-8 text-primary neon-text ghost-float" />
            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-neon-green border-2 border-background" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Ghost Protocol
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              The Pulse
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
          <span className="text-xs text-primary font-mono font-medium">{alias}</span>
          <span className="text-[10px] text-muted-foreground font-mono">#{ghostId}</span>
        </div>
      </div>
    </header>
  );
};

export default GhostHeader;
