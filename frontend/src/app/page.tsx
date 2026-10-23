"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  Loader2,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─── Types ───────────────────────────────────────────────────────────────────

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  dateAdded: string;
};

type Message = {
  sender: "user" | "ai";
  text: string;
  items?: InventoryItem[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_FILTERS = [
  "All",
  "Apparel",
  "Tech & Gadgets",
  "Home & Living",
  "Fitness & Lifestyle",
];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
// ─── Sub-components ───────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
  if (stock > 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        In Stock ({stock})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-red-50 text-red-600 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Out of Stock
    </span>
  );
}

function ProductCard({
  item,
  compact = false,
}: {
  item: InventoryItem;
  compact?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-zinc-100 shrink-0 ${compact ? "h-32" : "h-48"}`}
      >
        {item.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`object-cover w-full ${compact ? "h-32" : "h-48"} group-hover:scale-105 transition-transform duration-500`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-zinc-300" />
          </div>
        )}
        {/* Stock overlay for out-of-stock */}
        {item.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-xs font-semibold text-zinc-500 tracking-widest uppercase">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
          {item.category}
        </span>
        <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-2">
          {item.name}
        </h3>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100">
          <span className="text-lg font-bold text-zinc-900 tracking-tight">
            ৳{item.price.toLocaleString("en-BD")}
          </span>
          <StockBadge stock={item.stock} />
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-zinc-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-zinc-100 rounded-full" />
        <div className="h-4 w-3/4 bg-zinc-100 rounded-full" />
        <div className="h-4 w-1/2 bg-zinc-100 rounded-full" />
        <div className="flex justify-between items-center pt-3 border-t border-zinc-100">
          <div className="h-6 w-24 bg-zinc-100 rounded-full" />
          <div className="h-5 w-20 bg-zinc-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Home() {
  // Product state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [aiResults, setAiResults] = useState<InventoryItem[] | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "সালাম! I'm your AI personal shopper. Ask me anything about our collection, pricing, or availability!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Fetch inventory on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch(`${API_URL}/ai/inventory`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: InventoryItem[] = await res.json();
        setInventory(data);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoadingInventory(false);
      }
    }
    fetchInventory();
  }, []);

  // ── Auto-scroll chat ──────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingChat]);

  // ── Filtered products ─────────────────────────────────────────────────────
  const categoryInventory =
    activeCategory === "All"
      ? inventory
      : inventory.filter((item) => item.category === activeCategory);

  // If the AI searched, show its results; otherwise show the normal category view
  const filteredInventory = aiResults ?? categoryInventory;

  // ── Chat handler ──────────────────────────────────────────────────────────
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loadingChat) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoadingChat(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const aiText: string =
        data.response ||
        data.message ||
        (typeof data === "string" ? data : JSON.stringify(data));

      setMessages((prev) => [...prev, { sender: "ai", text: aiText }]);

      // Show the matched products in the main grid
      if (Array.isArray(data.items)) {
        setAiResults(data.items);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I ran into an error. Please try again." },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-screen w-full bg-white overflow-hidden text-zinc-900"
      style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* ── LEFT: Product Catalog ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-[#F7F7F7]">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-[#F7F7F7]/90 backdrop-blur-md border-b border-zinc-200/60 px-8 lg:px-12 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              MINIMALIST CO.
            </h1>
            <p className="text-[11px] text-zinc-400 tracking-widest uppercase mt-0.5">
              Premium Bangladeshi Storefront
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{filteredInventory.length} items</span>
          </div>
        </header>

        <div className="px-8 lg:px-12 py-8">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setAiResults(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeCategory === cat
                    ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                    : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* AI results banner */}
          {aiResults && (
            <div className="flex items-center justify-between mb-6 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm">
              <span>
                Showing {aiResults.length} result
                {aiResults.length === 1 ? "" : "s"} from your AI assistant
              </span>
              <button
                onClick={() => setAiResults(null)}
                className="text-xs underline underline-offset-2 hover:text-zinc-300"
              >
                Show all
              </button>
            </div>
          )}
          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingInventory ? (
              Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            ) : filteredInventory.length > 0 ? (
              filteredInventory.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-24 text-zinc-400">
                <ShoppingBag className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-medium">No items in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── RIGHT: AI Chat Sidebar ────────────────────────────────────────── */}
      <div className="w-full lg:w-[400px] xl:w-[440px] flex flex-col bg-white border-l border-zinc-200 h-full shrink-0 z-10">
        {/* Chat Header */}
        <div className="px-6 py-5 border-b border-zinc-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-zinc-900">
                AI Personal Shopper
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] text-zinc-400">
                  Online • Powered by Gemini
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 bg-zinc-50/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                  msg.sender === "user"
                    ? "bg-zinc-900 text-white rounded-br-sm"
                    : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-sm"
                }`}
              >
                {msg.sender === "user" ? (
                  msg.text
                ) : (
                  <ReactMarkdown
                    components={{
                      p: ({ ...props }) => (
                        <p className="mb-2 last:mb-0" {...props} />
                      ),
                      ul: ({ ...props }) => (
                        <ul
                          className="list-disc pl-5 mb-2 space-y-1"
                          {...props}
                        />
                      ),
                      ol: ({ ...props }) => (
                        <ol
                          className="list-decimal pl-5 mb-2 space-y-1"
                          {...props}
                        />
                      ),
                      li: ({ ...props }) => <li {...props} />,
                      strong: ({ ...props }) => (
                        <strong
                          className="font-semibold text-zinc-900"
                          {...props}
                        />
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {loadingChat && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-200 rounded-2xl rounded-bl-sm px-4 py-3 text-[14px] flex items-center gap-2.5 shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                <span className="text-zinc-400">Assistant is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-5 py-5 bg-white border-t border-zinc-100">
          {/* Suggestion Pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              "Check out-of-stock items",
              "Items under ৳2,000",
              "Show Apparel collection",
              "Best value picks",
            ].map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-[12px] bg-zinc-50 hover:bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-full border border-zinc-200 hover:border-zinc-300 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loadingChat}
              placeholder="Ask about a product..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-full pl-5 pr-14 py-3.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:opacity-50 transition-all"
            />
            <button
              type="submit"
              disabled={loadingChat || !input.trim()}
              className="absolute right-2 p-2.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
