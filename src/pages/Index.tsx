import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { io } from "socket.io-client";

import GhostHeader from "@/components/GhostHeader";
import PostCard from "@/components/PostCard";
import SpillInput from "@/components/SpillInput";
import GhostChat from "@/components/GhostChat";
import SplashScreen from "@/components/SplashScreen";
import MoodFilter from "@/components/MoodFilter";
import {
  generateGhostId, generateAlias, Mood, Visibility, Post,
} from "@/lib/ghost";

// Connect to backend URL (Change port if needed)
const socket = io("http://localhost:5000");

const Index = () => {
  const [ghostId] = useState(() => generateGhostId());
  const [alias] = useState(() => generateAlias());
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeChatPostId, setActiveChatPostId] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [activeMood, setActiveMood] = useState<Mood | "all">("all");

  const activePost = useMemo(
    () => posts.find((p) => p.id === activeChatPostId),
    [posts, activeChatPostId]
  );

  const filteredPosts = useMemo(
    () => activeMood === "all" ? posts : posts.filter((p) => p.mood === activeMood),
    [posts, activeMood]
  );

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  // Fetch initial posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/posts");
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      }
    };
    fetchPosts();
  }, []);

  // Listen for new posts via socket
  useEffect(() => {
    socket.on("new_post", (newPost: Post) => {
      setPosts((prev) => [newPost, ...prev]);
    });
    return () => {
      socket.off("new_post");
    };
  }, []);

  // Prune expired posts locally
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
      // Send to backend
      await axios.post("http://localhost:5000/api/posts", newPost);
      // We don't need to manually update local state here because the socket "new_post" event will handle it
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
    // Note: To make echoes live, you'd add an API/Socket call here
  };

  const handleReport = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, reported: true } : p))
    );
    toast("Report received", {
      description: "Our ghost moderators will review this.",
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showSplash && (
        <SplashScreen ghostId={ghostId} alias={alias} onComplete={handleSplashComplete} />
      )}

      <GhostHeader ghostId={ghostId} alias={alias} />

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-6 pb-36 space-y-4">
        <MoodFilter activeMood={activeMood} onMoodChange={setActiveMood} />

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
          socket={socket} // Pass socket to Chat
        />
      )}
    </div>
  );
};

export default Index;