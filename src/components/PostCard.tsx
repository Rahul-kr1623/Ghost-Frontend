import { useState, useEffect } from "react";
import { Flag, MessageCircle, Clock } from "lucide-react";
import { Post, moodConfig, getLifespanPercent, getTimeRemaining, formatTimeRemaining, echoReactions } from "@/lib/ghost";

interface PostCardProps {
  post: Post;
  onOpenChat: (postId: string) => void;
  onEcho: (postId: string, echo: string) => void;
  onReport: (postId: string) => void;
  currentGhostId: string;
}

const PostCard = ({ post, onOpenChat, onEcho, onReport, currentGhostId }: PostCardProps) => {
  const [lifePercent, setLifePercent] = useState(getLifespanPercent(post));
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(post));
  const [showEchoes, setShowEchoes] = useState(false);
  const [reported, setReported] = useState(post.reported);

  const mood = moodConfig[post.mood];

  useEffect(() => {
    const interval = setInterval(() => {
      setLifePercent(getLifespanPercent(post));
      setTimeLeft(getTimeRemaining(post));
    }, 10000);
    return () => clearInterval(interval);
  }, [post]);

  const glowOpacity = Math.max(0.05, lifePercent / 100 * 0.4);

  const moodColorMap: Record<string, string> = {
    "neon-orange": "shadow-neon-orange/20",
    "neon-purple": "shadow-neon-purple/20",
    "neon-green": "shadow-neon-green/20",
    "neon-cyan": "shadow-primary/20",
  };

  return (
    <div
      className="glass rounded-xl p-4 transition-all duration-500 hover:border-primary/20 group"
      style={{
        boxShadow: `0 0 ${20 + lifePercent * 0.3}px hsla(var(--neon-glow) / ${glowOpacity})`,
        opacity: Math.max(0.4, lifePercent / 100),
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{mood.emoji}</span>
          <span className="text-xs font-mono text-muted-foreground">{post.alias}</span>
          {post.visibility === "nearby" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-mono">
              NEARBY
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span className="text-[11px] font-mono">{formatTimeRemaining(timeLeft)}</span>
        </div>
      </div>

      {/* Lifespan bar */}
      <div className="w-full h-0.5 bg-muted rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-1000"
          style={{ width: `${lifePercent}%` }}
        />
      </div>

      {/* Content */}
      <p className="text-sm text-foreground/90 leading-relaxed mb-4">
        {post.content}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Echo reactions */}
          <div className="relative">
            <button
              onClick={() => setShowEchoes(!showEchoes)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <span>👻</span>
              <span className="font-mono">{post.echoes.length}</span>
            </button>
            {showEchoes && (
              <div className="absolute bottom-full left-0 mb-1 flex gap-0.5 glass rounded-lg p-1 z-10">
                {echoReactions.map((echo) => (
                  <button
                    key={echo}
                    onClick={() => { onEcho(post.id, echo); setShowEchoes(false); }}
                    className="w-7 h-7 rounded-md hover:bg-muted/80 flex items-center justify-center transition-colors text-sm"
                  >
                    {echo}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat */}
          <button
            onClick={() => onOpenChat(post.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="font-mono">Enter</span>
          </button>
        </div>

        {/* Report */}
        <button
          onClick={() => { onReport(post.id); setReported(true); }}
          className={`p-1.5 rounded-lg transition-colors ${
            reported
              ? "text-destructive/50 cursor-not-allowed"
              : "text-muted-foreground/40 hover:text-destructive/70"
          }`}
          disabled={reported}
          title="Report"
        >
          <Flag className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
