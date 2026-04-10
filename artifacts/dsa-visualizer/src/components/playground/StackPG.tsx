import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Msg({ text, type }: { text: string; type: "push" | "pop" | "peek" | "" }) {
  if (!text) return null;
  const color =
    type === "push" ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
    : type === "pop" ? "text-red-300 bg-red-900/20 border-red-500/20"
    : type === "peek" ? "text-amber-300 bg-amber-900/20 border-amber-500/20"
    : "text-white/50 bg-white/5 border-white/10";
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-lg px-3 py-2 border ${color}`}>{text}</motion.div>
  );
}

export function StackPG() {
  const [stack, setStack] = useState<number[]>([3, 7, 1]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"push" | "pop" | "peek" | "">("");

  function notify(text: string, type: "push" | "pop" | "peek" | "") {
    setMsg(text); setMsgType(type);
  }

  function handlePush() {
    const val = parseInt(input);
    if (isNaN(val)) return;
    setStack(s => [...s, val]);
    notify(`Pushed ${val} onto the stack`, "push");
    setInput("");
  }

  function handlePop() {
    if (stack.length === 0) { notify("Stack is empty!", ""); return; }
    const top = stack[stack.length - 1];
    setStack(s => s.slice(0, -1));
    notify(`Popped ${top} from the top`, "pop");
  }

  function handlePeek() {
    if (stack.length === 0) { notify("Stack is empty!", ""); return; }
    notify(`Top element is ${stack[stack.length - 1]}`, "peek");
  }

  function handleReset() { setStack([]); setMsg(""); }

  return (
    <div className="flex flex-col gap-4">
      <Msg text={msg} type={msgType} />

      {/* Stack visual */}
      <div className="flex flex-col items-center gap-1 min-h-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-white/30 font-mono">← TOP</span>
        </div>
        <AnimatePresence mode="popLayout">
          {stack.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 text-sm italic mt-8">Stack is empty</motion.div>
          )}
          {[...stack].reverse().map((val, ri) => {
            const isTop = ri === 0;
            return (
              <motion.div key={`${stack.length - 1 - ri}-${val}`}
                layout
                initial={{ x: -40, opacity: 0, scale: 0.85 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: 40, opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                className={`w-56 h-12 flex items-center justify-between px-4 rounded-lg border-2 font-mono font-bold text-base
                  ${isTop
                    ? "bg-blue-900/40 border-blue-400/70 text-blue-100 shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                    : "bg-[#0b1628] border-slate-700/50 text-white/70"}`}
              >
                <span className="text-xs font-normal text-white/25">{stack.length - 1 - ri}</span>
                <span>{val}</span>
                {isTop && <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">TOP</span>}
                {!isTop && <span className="w-8" />}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div className="w-56 h-2 rounded-full bg-slate-700/40 mt-1" />
        <span className="text-xs text-white/20 font-mono mt-1">BOTTOM</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handlePush()}
          placeholder="Value"
          className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40"
        />
        <button onClick={handlePush}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
          Push
        </button>
        <button onClick={handlePop}
          className="px-4 py-2 rounded-lg bg-red-600/70 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
          Pop
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
        LIFO — Last In, First Out. Elements are pushed and popped from the same end (top).
      </div>
    </div>
  );
}
