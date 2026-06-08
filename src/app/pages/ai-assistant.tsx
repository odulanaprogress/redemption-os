import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  ArrowLeft, Brain, Send, Mic, MapPin, Users, Zap, MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { aiService, AIMessage } from "../../services/ai.service";
import { isMockMode } from "../../config/firebase.config";

const QUICK_ACTIONS = [
  { icon: MapPin, label: "Navigation", query: "Where is Hall B?" },
  { icon: Users, label: "Crowd Info", query: "Which area is least crowded?" },
  { icon: MessageSquare, label: "Lost Child", query: "My child is lost, what do I do?" },
  { icon: Zap, label: "Emergency", query: "Where is the nearest medical centre?" },
];

export function AIAssistant() {
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant for Redemption OS. I can help with navigation, emergency guidance, child safety, marketplace orders, and more. How can I help you today?",
      suggestions: [
        "Where is Hall B?",
        "Which gate is least crowded?",
        "How do I register my child?",
        "Where is the medical centre?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: AIMessage = { role: "user", content: text };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setIsTyping(true);

    try {
      const response = await aiService.chat(updated);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
          suggestions: ["Try again", "Find emergency help", "Go back to dashboard"],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#0f1420] to-[#0a1628] flex flex-col">
      {/* Header */}
      <div className="bg-[#1a1f2e]/80 backdrop-blur-lg border-b border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="text-white/60 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="rounded-lg bg-[#0ea5e9]/10 p-2">
              <Brain className="h-5 w-5 text-[#0ea5e9]" />
            </div>
            <div>
              <h1 className="text-lg text-white">AI Assistant</h1>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${aiService.apiAvailable ? 'bg-[#10b981]' : 'bg-amber-400'} animate-pulse`} />
                <span className="text-xs text-white/60">
                  {aiService.apiAvailable ? 'OpenAI Connected' : isMockMode ? 'Smart Fallback Mode' : 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(({ icon: Icon, label, query }) => (
            <button
              key={label}
              onClick={() => sendMessage(query)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#1a1f2e]/80 border border-white/10 hover:border-[#0ea5e9]/40 hover:bg-[#0ea5e9]/5 transition-all"
            >
              <Icon className="h-4 w-4 text-[#0ea5e9]" />
              <span className="text-xs text-white/70">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[82%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                {message.role === "assistant" && (
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className="rounded-full bg-[#0ea5e9]/10 p-1">
                      <Brain className="h-3 w-3 text-[#0ea5e9]" />
                    </div>
                    <span className="text-xs text-white/50">AI Assistant</span>
                  </div>
                )}

                <Card className={`p-4 ${
                  message.role === "user"
                    ? "bg-gradient-to-br from-[#0ea5e9] to-[#10b981] border-none"
                    : "bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10"
                }`}>
                  <p className="text-sm text-white leading-relaxed">{message.content}</p>
                </Card>

                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.suggestions.map((s, i) => (
                      <Badge
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="cursor-pointer bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/30 hover:bg-[#0ea5e9]/20 transition-colors"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <Card className="bg-[#1a1f2e]/80 backdrop-blur-lg border-white/10 p-4">
              <div className="flex gap-1 items-center">
                <div className="h-2 w-2 rounded-full bg-[#0ea5e9] animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="h-2 w-2 rounded-full bg-[#0ea5e9] animate-bounce" style={{ animationDelay: "0.4s" }} />
              </div>
            </Card>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-[#1a1f2e]/95 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white/40 hover:text-white/70 shrink-0">
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask me anything..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 flex-1"
            disabled={isTyping}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="bg-gradient-to-r from-[#0ea5e9] to-[#10b981] hover:opacity-90 text-white shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
