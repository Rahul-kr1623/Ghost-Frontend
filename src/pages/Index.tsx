import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { io } from "socket.io-client";
import { BookOpen } from "lucide-react"; // 🔥 For Stealth Mode UI

import GhostHeader from "@/components/GhostHeader";
import PostCard from "@/components/PostCard";
import SpillInput from "@/components/SpillInput";
import GhostChat from "@/components/GhostChat";
import SplashScreen from "@/components/SplashScreen";
import MoodFilter from "@/components/MoodFilter";
import {
  generateGhostId, generateAlias, Mood, Visibility, Post,
} from "@/lib/ghost";

const socket = io("https://ghost-backend-ngbg.onrender.com");

const Index = () => {
  const [ghostId] = useState(() => {
    const saved = sessionStorage.getItem('ghostId');
    if (saved) return saved;
    const newId = generateGhostId();
    sessionStorage.setItem('ghostId', newId);
    return newId;
  });

  const [alias] = useState(() => {
    const saved = sessionStorage.getItem('alias');
    if (saved) return saved;
    const newAlias = generateAlias();
    sessionStorage.setItem('alias', newAlias);
    return newAlias;
  });

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeChatPostId, setActiveChatPostId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [activeMood, setActiveMood] = useState<Mood | "all">("all");

  // 🔥 NEW STATES: Stealth Mode & Live Stats
  const [isStealth, setIsStealth] = useState(false);
  const [liveGhosts, setLiveGhosts] = useState(1);

  // 🔥 EFFECT: Boss Key (Stealth Mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsStealth(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 🔥 EFFECT: Live Stats Listener
  useEffect(() => {
    socket.on('stats_update', (data) => {
      setLiveGhosts(data.onlineGhosts);
    });
    return () => {
      socket.off('stats_update');
    };
  }, []);

  const activePost = useMemo(
    () => posts.find((p) => p.id === activeChatPostId),
    [posts, activeChatPostId]
  );

  const filteredPosts = useMemo(
    () => activeMood === "all" ? posts : posts.filter((p) => p.mood === activeMood),
    [posts, activeMood]
  );

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("https://ghost-backend-ngbg.onrender.com/api/posts");
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    socket.on("new_post", (newPost: Post) => {
      setPosts((prev) => [newPost, ...prev]);
    });
    return () => {
      socket.off("new_post");
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosts((prev) =>
        prev.filter((p) => Date.now() - p.createdAt < p.lifespanMs)
      );
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSpill = async (content: string, mood: Mood, visibility: Visibility) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      ghostId,
      alias,
      content,
      mood,
      visibility,
      createdAt: Date.now(),
      lifespanMs: 7200000,
      echoes: [],
      reported: false,
    };

    try {
      await axios.post("https://ghost-backend-ngbg.onrender.com/api/posts", newPost);
      toast("Spilled into the void 👻", {
        description: "Your post will fade in 2 hours.",
      });
    } catch (error) {
      toast.error("Failed to spill. The void is closed.");
    }
  };

  const handleEcho = (postId: string, echo: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, echoes: [...p.echoes, echo] } : p
      )
    );
  };

  const handleReport = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))
    );
    toast("Report received", {
      description: "Our ghost moderators will review this.",
    });
  };

  // 🔥 STEALTH MODE UI RETURN
  if (isStealth) {
    return (
      <div className="min-h-screen bg-white text-black p-8 font-serif">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 border-b pb-4 mb-6">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-normal text-gray-700">Google Scholar</h1>
          </div>
          <input type="text" className="w-full border border-gray-300 rounded p-3 mb-6" placeholder="Search scholarly articles..." />
          <p className="text-sm text-gray-500">Articles · Case law · Recommended for you</p>
          <div className="mt-20 text-center text-xs text-gray-400">Press 'Esc' to return to the void</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showSplash && (
        <SplashScreen ghostId={ghostId} alias={alias} onComplete={handleSplashComplete} />
      )}

      <GhostHeader ghostId={ghostId} alias={alias} />

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6 pb-36 space-y-4">
        
        {/* 🔥 LIVE STATS HEADER */}
        <div className="flex items-center justify-between mb-2">
           <MoodFilter activeMood={activeMood} onMoodChange={setActiveMood} />
           <div className="glass px-3 py-1.5 rounded-full text-xs font-mono text-primary animate-pulse flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-primary" />
             {liveGhosts} Ghosts in the Void
           </div>
        </div>

        {filteredPosts.map((post, i) => (
          <div
            key={post.id}
            style={{ animation: `fade-up 0.4s ease-out ${i * 0.05}s both` }}
          >
            <PostCard
              post={post}
              onOpenChat={setActiveChatPostId}
              onEcho={handleEcho}
              onReport={handleReport}
              currentGhostId={ghostId}
            />
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-4xl mb-3">👻</p>
            <p className="font-mono text-sm">
              {activeMood === "all"
                ? "The void is empty. Be the first to spill."
                : `No ${activeMood} posts yet. Spill one!`}
            </p>
          </div>
        )}
      </main>

      <SpillInput onSubmit={handleSpill} />

      {activePost && (
        <GhostChat
          post={activePost}
          currentGhostId={ghostId}
          currentAlias={alias}
          onClose={() => setActiveChatPostId(null)}
          socket={socket}
        />
      )}
    </div>
  );
};

export default Index;