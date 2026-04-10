import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, ArrowRight, Loader2 } from "lucide-react";

interface Suggestion {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface SuggestionData {
  pattern: string;
  suggestions: Suggestion[];
}

interface SuggestionsPanelProps {
  problem: string;
  onSelectSuggestion: (title: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Medium: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  Hard: "text-red-400 bg-red-400/10 border-red-400/20",
};

export function SuggestionsPanel({ problem, onSelectSuggestion }: SuggestionsPanelProps) {
  const [data, setData] = useState<SuggestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setLoading(true);
    setError(false);

    fetch("/api/dsa/suggest", {
      method: "POST",
      body: JSON.stringify({ problem }),
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((res: SuggestionData) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [problem]);

  if (error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full glass-card rounded-xl border border-white/5 p-6 flex flex-col gap-5"
    >
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">What to solve next</h3>
        {data?.pattern && (
          <span className="ml-2 text-xs font-mono text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5">
            {data.pattern}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-sm text-white/40 py-2"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            Finding similar problems…
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {data?.suggestions.map((s, i) => (
              <motion.button
                key={s.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => onSelectSuggestion(s.title)}
                className="group flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/7 hover:border-white/15 transition-all duration-200 text-left"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors leading-snug truncate">
                    {s.title}
                  </span>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-full border w-fit ${DIFFICULTY_COLORS[s.difficulty] ?? "text-white/50 bg-white/5 border-white/10"}`}>
                    {s.difficulty}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-white/25 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
