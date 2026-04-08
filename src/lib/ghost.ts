const adjectives = [
  "Shadow", "Phantom", "Silent", "Neon", "Void", "Spectral", "Glitch", "Cyber",
  "Hollow", "Fading", "Drift", "Echo", "Flux", "Haze", "Pulse", "Whisper",
  "Cryptic", "Lunar", "Nova", "Pixel", "Static", "Zenith", "Astral", "Rogue"
];

const nouns = [
  "Ghost", "Wraith", "Specter", "Shade", "Spirit", "Phantom", "Revenant",
  "Wisp", "Apparition", "Banshee", "Cipher", "Glimmer", "Spark", "Enigma",
  "Oracle", "Nomad", "Drifter", "Walker", "Weaver", "Seeker", "Watcher"
];

export function generateGhostId(): string {
  return `GH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

export function generateAlias(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

export type Mood = "venting" | "secret" | "helping" | "spontaneous";

export const moodConfig: Record<Mood, { emoji: string; label: string; color: string }> = {
  venting: { emoji: "😤", label: "Venting", color: "neon-orange" },
  secret: { emoji: "🤫", label: "Secret", color: "neon-purple" },
  helping: { emoji: "🤝", label: "Helping", color: "neon-green" },
  spontaneous: { emoji: "⚡", label: "Spontaneous", color: "neon-cyan" },
};

export type Visibility = "campus" | "nearby";

export interface Post {
  id: string;
  ghostId: string;
  alias: string;
  content: string;
  mood: Mood;
  visibility: Visibility;
  createdAt: number;
  lifespanMs: number;
  echoes: string[];
  reported: boolean;
}

export interface ChatMessage {
  id: string;
  ghostId: string;
  alias: string;
  content: string;
  timestamp: number;
}

export const echoReactions = ["👻", "💀", "🔥", "💫", "🌊", "⚡"];

export function getTimeRemaining(post: Post): number {
  const elapsed = Date.now() - post.createdAt;
  return Math.max(0, post.lifespanMs - elapsed);
}

export function getLifespanPercent(post: Post): number {
  const remaining = getTimeRemaining(post);
  return (remaining / post.lifespanMs) * 100;
}

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const minutes = Math.floor(ms / 60000);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
}

const toxicWords = ["hate", "kill", "die", "stupid", "idiot"];

export function checkToxicity(text: string): boolean {
  const lower = text.toLowerCase();
  return toxicWords.some(w => lower.includes(w));
}

export function createMockPosts(count: number): Post[] {
  const contents = [
    "Anyone else feel like the library is haunted at 3am? The vibes are immaculate though 👻",
    "Just aced my exam without studying. Is this what peak performance feels like?",
    "The dining hall mystery meat hit different today. Not in a good way.",
    "Looking for someone to study calc with. No judgment zone, I promise 🤝",
    "That campus sunset right now... step outside if you can ✨",
    "Confession: I've been pretending to understand blockchain for 3 semesters",
    "Free coffee in the engineering building lobby. You're welcome.",
    "Is it just me or does the wifi only work when you don't need it?",
    "Hot take: 8am classes should be illegal",
    "Found a cat near the science building. She's very polite.",
  ];
  const moods: Mood[] = ["venting", "secret", "helping", "spontaneous"];
  
  return contents.slice(0, count).map((content, i) => ({
    id: `post-${i}`,
    ghostId: generateGhostId(),
    alias: generateAlias(),
    content,
    mood: moods[i % moods.length],
    visibility: i % 3 === 0 ? "nearby" : "campus",
    createdAt: Date.now() - Math.random() * 3600000,
    lifespanMs: 7200000,
    echoes: echoReactions.slice(0, Math.floor(Math.random() * 4)),
    reported: false,
  }));
}
