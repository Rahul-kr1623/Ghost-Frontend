import { Mood, moodConfig } from "@/lib/ghost";

interface MoodFilterProps {
  activeMood: Mood | "all";
  onMoodChange: (mood: Mood | "all") => void;
}

const MoodFilter = ({ activeMood, onMoodChange }: MoodFilterProps) => {
  const moods: (Mood | "all")[] = ["all", "venting", "secret", "helping", "spontaneous"];

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
      {moods.map((mood) => {
        const isActive = activeMood === mood;
        const config = mood !== "all" ? moodConfig[mood] : null;

        return (
          <button
            key={mood}
            onClick={() => onMoodChange(mood)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 ${
              isActive
                ? "glass neon-glow text-primary scale-105"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {isActive && (
              <span className="absolute inset-0 rounded-xl bg-primary/5 animate-pulse" />
            )}
            <span className="relative">
              {config ? config.emoji : "🌀"}
            </span>
            <span className="relative font-mono">
              {config ? config.label : "All"}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default MoodFilter;
