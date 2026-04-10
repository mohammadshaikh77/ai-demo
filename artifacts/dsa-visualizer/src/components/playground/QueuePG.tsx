import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Msg({ text, type }: { text: string; type: "enqueue" | "dequeue" | "peek" | "" }) {
  if (!text) return null;
  const color =
    type === "enqueue" ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
    : type === "dequeue" ? "text-red-300 bg-red-900/20 border-red-500/20"
    : type === "peek" ? "text-amber-300 bg-amber-900/20 border-amber-500/20"
    : "text-white/50 bg-white/5 border-white/10";
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-lg px-3 py-2 border ${color}`}>{text}</motion.div>
  );
}

let idCounter = 10;

export function QueuePG() {
  const [queue, setQueue] = useState<{ id: number; val: number }[]>([
    { id: 1, val: 4 }, { id: 2, val: 9 }, { id: 3, val: 2 },
  ]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"enqueue" | "dequeue" | "peek" | "">("");

  function notify(text: string, type: "enqueue" | "dequeue" | "peek" | "") {
    setMsg(text); setMsgType(type);
  }

  function handleEnqueue() {
    const val = parseInt(input);
    if (isNaN(val)) return;
    setQueue(q => [...q, { id: ++idCounter, val }]);
    notify(`Enqueued ${val} at the rear`, "enqueue");
    setInput("");
  }

  function handleDequeue() {
    if (queue.length === 0) { notify("Queue is empty!", ""); return; }
    notify(`Dequeued ${queue[0].val} from the front`, "dequeue");
    setQueue(q => q.slice(1));
  }

  function handlePeek() {
    if (queue.length === 0) { notify("Queue is empty!", ""); return; }
    notify(`Front element is ${queue[0].val}`, "peek");
  }

  function handleReset() { setQueue([]); setMsg(""); }

  return (
    <div className="flex flex-col gap-4">
      <Msg text={msg} type={msgType} />

      {/* Labels */}
      <div className="flex justify-between px-1 text-xs font-mono text-white/30">
        <span>FRONT (dequeue)</span>
        <span>(enqueue) REAR</span>
      </div>

      {/* Queue visual */}
      <div className="min-h-[80px] flex items-center gap-1.5 overflow-x-auto pb-2">
        <AnimatePresence mode="popLayout">
          {queue.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 text-sm italic mx-auto">Queue is empty</motion.div>
          )}
          {queue.map((item, i) => {
            const isFront = i === 0;
            const isRear = i === queue.length - 1;
            return (
              <motion.div key={item.id}
                layout
                initial={{ y: -30, opacity: 0, scale: 0.85 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 30, opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <div className={`w-14 h-14 flex items-center justify-center rounded-xl border-2 font-mono font-bold text-lg
                  ${isFront
                    ? "bg-red-900/30 border-red-400/60 text-red-100 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    : isRear
                    ? "bg-emerald-900/30 border-emerald-400/60 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                    : "bg-[#0b1628] border-slate-700/50 text-white/70"}`}
                >{item.val}</div>
                <span className={`text-[9px] font-bold uppercase tracking-wide
                  ${isFront ? "text-red-400" : isRear ? "text-emerald-400" : "text-white/20"}`}>
                  {isFront ? "FRONT" : isRear ? "REAR" : ""}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Arrow between items */}
      {queue.length > 1 && (
        <div className="flex items-center gap-1.5 px-1">
          {queue.map((_, i) => i < queue.length - 1 && (
            <div key={i} className="flex items-center gap-1.5" style={{ width: `calc(100% / ${queue.length - 1})` }}>
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-white/20 text-xs">→</span>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleEnqueue()}
          placeholder="Value"
          className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40"
        />
        <button onClick={handleEnqueue}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
          Enqueue
        </button>
        <button onClick={handleDequeue}
          className="px-4 py-2 rounded-lg bg-red-600/70 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
          Dequeue
        </button>
        <button onClick={handlePeek}
          className="px-4 py-2 rounded-lg bg-amber-600/70 hover:bg-amber-600 text-white text-sm font-semibold transition-colors">
          Peek
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80 text-sm transition-colors ml-auto">
          Reset
        </button>
      </div>

      <div className="text-xs text-white/20 border-t border-white/5 pt-3">
        FIFO — First In, First Out. Elements enqueue at rear and dequeue from front.
      </div>
    </div>
  );
}
