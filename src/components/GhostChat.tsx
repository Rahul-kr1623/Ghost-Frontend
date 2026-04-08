import { useState, useEffect, useRef } from "react";
import { X, Users, AlertTriangle, Send, Skull } from "lucide-react";
import { ChatMessage, Post } from "@/lib/ghost";

interface GhostChatProps {
  post: Post;
  currentGhostId: string;
  currentAlias: string;
  onClose: () => void;
  socket: any;
}

const GhostChat = ({ post, currentGhostId, currentAlias, onClose, socket }: GhostChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "original",
      ghostId: post.ghostId,
      alias: post.alias,
      content: post.content,
      timestamp: post.createdAt,
    },
  ]);
  const [input, setInput] = useState("");
  const [ghostCount, setGhostCount] = useState(2);
  const [selfDestructWarning, setSelfDestructWarning] = useState(true);
  const [isKilling, setIsKilling] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 UPDATED: Socket logic with History
  useEffect(() => {
    if (!socket) return;

    socket.emit("join_thread", post.id);

    const handleChatHistory = (history: ChatMessage[]) => {
      setMessages((prev) => {
        const newMessages = history.filter(h => !prev.some(p => p.id === h.id));
        return [...prev, ...newMessages];
      });
    };

    const handleReceiveMessage = (messageData: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some(msg => msg.id === messageData.id)) return prev;
        return [...prev, messageData];
      });
    };

    socket.on("chat_history", handleChatHistory);
    socket.on("receive_message", handleReceiveMessage);

    return () => {
      socket.emit("leave_thread", post.id);
      socket.off("chat_history", handleChatHistory);
      socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, post.id]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      ghostId: currentGhostId,
      alias: currentAlias,
      content: input.trim(),
      timestamp: Date.now(),
    };

    socket.emit("send_message", {
      roomId: post.id,
      ...newMessage
    });

    setInput("");
  };

  const handleKillSwitch = () => {
    setIsKilling(true);
    setTimeout(onClose, 600);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-background flex flex-col transition-all duration-500 ${
      isKilling ? "opacity-0 scale-95" : "opacity-100 scale-100"
    }`}
    style={{ animation: "slide-up 0.3s ease-out" }}
    >
      <div className="glass border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-medium text-foreground">Anonymous Thread</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span className="font-mono">{ghostCount} Ghosts</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleKillSwitch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium hover:bg-destructive/20 transition-all kill-switch-glow"
        >
          <Skull className="w-3.5 h-3.5" />
          Kill Switch
        </button>
      </div>

      {selfDestructWarning && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-orange/5 border border-neon-orange/20 text-neon-orange text-xs">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>This chat self-destructs when all ghosts leave. Nothing is saved.</span>
          <button onClick={() => setSelfDestructWarning(false)} className="ml-auto text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.ghostId === currentGhostId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isMe
                  ? "bg-primary/10 border border-primary/20 text-foreground"
                  : "glass text-foreground"
              }`}>
                {!isMe && (
                  <p className="text-[10px] font-mono text-muted-foreground mb-1">{msg.alias}</p>
                )}
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className="text-[10px] font-mono text-muted-foreground/50 mt-1 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Whisper to the void..."
            className="flex-1 bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default GhostChat;