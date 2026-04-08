import { useState } from "react";
import { Send, Globe, MapPin, AlertTriangle } from "lucide-react";
import { Mood, Visibility, moodConfig, checkToxicity } from "@/lib/ghost";

interface SpillInputProps {
  onSubmit: (content: string, mood: Mood, visibility: Visibility) => void;
}

const SpillInput = ({ onSubmit }: SpillInputProps) => {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("spontaneous");
  const [visibility, setVisibility] = useState<Visibility>("campus");
  const [isToxic, setIsToxic] = useState(false);

  const handleContentChange = (value: string) => {
    setContent(value);
    setIsToxic(checkToxicity(value));
  };

  const handleSubmit = () => {
    if (!content.trim() || isToxic) return;
    onSubmit(content.trim(), mood, visibility);
    setContent("");
    setIsToxic(false);
  };

  return (
    <div className="sticky bottom-0 z-40 glass border-t border-border">
      <div className="container max-w-2xl mx-auto px-4 py-3 space-y-2">
        {/* Toxic filter warning */}
        {isToxic && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>This message may violate community guidelines. Please revise.</span>
          </div>
        )}

        {/* Mood selectors */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {(Object.entries(moodConfig) as [Mood, typeof moodConfig[Mood]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setMood(key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  mood === key
                    ? "glass neon-glow text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span className="mr-1">{config.emoji}</span>
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            ))}
          </div>

          {/* Visibility toggle */}
          <button
            onClick={() => setVisibility(v => v === "campus" ? "nearby" : "campus")}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors glass"
          >
            {visibility === "campus" ? (
              <><Globe className="w-3.5 h-3.5" /> Campus</>
            ) : (
              <><MapPin className="w-3.5 h-3.5 text-neon-green" /> Nearby</>
            )}
          </button>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Spill something..."
            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
            maxLength={280}
          />
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isToxic}
            className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpillInput;
