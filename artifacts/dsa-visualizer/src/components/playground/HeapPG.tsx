import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Msg({ text, type }: { text: string; type: "insert" | "extract" | "" }) {
  if (!text) return null;
  const color =
    type === "insert" ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
    : type === "extract" ? "text-red-300 bg-red-900/20 border-red-500/20"
    : "text-white/50 bg-white/5 border-white/10";
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-lg px-3 py-2 border ${color}`}>{text}</motion.div>
  );
}

function swimUp(heap: number[], i: number): number[] {
  const h = [...heap];
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (h[parent] > h[i]) { [h[parent], h[i]] = [h[i], h[parent]]; i = parent; }
    else break;
  }
  return h;
}

function sinkDown(heap: number[], i: number): number[] {
  const h = [...heap];
  const n = h.length;
  while (true) {
    let smallest = i;
    const l = 2 * i + 1, r = 2 * i + 2;
    if (l < n && h[l] < h[smallest]) smallest = l;
    if (r < n && h[r] < h[smallest]) smallest = r;
    if (smallest !== i) { [h[smallest], h[i]] = [h[i], h[smallest]]; i = smallest; }
    else break;
  }
  return h;
}

function TreeNode({ heap, i, highlighted }: { heap: number[]; i: number; highlighted: number | null }) {
  if (i >= heap.length) return null;
  const l = 2 * i + 1, r = 2 * i + 2;
  const isMin = i === 0;
  return (
    <div className="flex flex-col items-center">
      <motion.div
        layout
        animate={{ scale: highlighted === i ? 1.15 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-mono font-bold text-sm mb-1
          ${isMin
            ? "bg-blue-900/50 border-blue-400 text-blue-100 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            : highlighted === i
            ? "bg-emerald-900/40 border-emerald-400/70 text-emerald-100"
            : "bg-[#0b1628] border-slate-700/50 text-white/70"}`}
      >
        {heap[i]}
      </motion.div>
      {isMin && <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wide mb-1">MIN</span>}
      {(l < heap.length || r < heap.length) && (
        <div className="flex gap-6 mt-1">
          {l < heap.length && (
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-white/15" />
              <TreeNode heap={heap} i={l} highlighted={highlighted} />
            </div>
          )}
          {r < heap.length && (
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-white/15" />
              <TreeNode heap={heap} i={r} highlighted={highlighted} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HeapPG() {
  const [heap, setHeap] = useState<number[]>([1, 3, 5, 4, 8, 9]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"insert" | "extract" | "">("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  function notify(text: string, type: "insert" | "extract" | "") { setMsg(text); setMsgType(type); }

  function flash(i: number, cb: () => void) {
    setHighlighted(i); setTimeout(() => { setHighlighted(null); cb(); }, 400);
  }

  function handleInsert() {
    const val = parseInt(input);
    if (isNaN(val)) return;
    const newHeap = swimUp([...heap, val], heap.length);
    const idx = newHeap.indexOf(val);
    setHeap(newHeap);
    flash(idx, () => {});
    notify(`Inserted ${val} and heapified upward`, "insert");
    setInput("");
  }

  function handleExtract() {
    if (heap.length === 0) { notify("Heap is empty!", ""); return; }
    const min = heap[0];
    let newHeap = [...heap];
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    newHeap = sinkDown(newHeap, 0);
    flash(0, () => setHeap(newHeap));
    notify(`Extracted min = ${min}, heapified downward`, "extract");
  }

  function handleReset() { setHeap([]); setMsg(""); }

  return (
    <div className="flex flex-col gap-4">
      <Msg text={msg} type={msgType} />

      {/* Array representation */}
      <div className="flex flex-col gap-2">
        <span className="text-xs text-white/30 font-mono uppercase tracking-wider">Array Representation</span>
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="popLayout">
            {heap.length === 0 && (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-white/20 text-sm italic">Heap is empty</motion.div>
            )}
            {heap.map((val, i) => (
              <motion.div key={`${i}-${val}`}
                layout
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: highlighted === i ? 1.15 : 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="flex flex-col items-center gap-0.5"
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg border-2 font-mono font-bold text-sm
                  ${i === 0
                    ? "bg-blue-900/40 border-blue-400/80 text-blue-100"
                    : highlighted === i
                    ? "bg-emerald-900/30 border-emerald-400/60 text-emerald-100"
                    : "bg-[#0b1628] border-slate-700/50 text-white/70"}`}
                >{val}</div>
                <span className="text-[9px] font-mono text-white/20">{i}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Tree view */}
      {heap.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-white/30 font-mono uppercase tracking-wider">Tree View</span>
          <div className="flex justify-center p-4 rounded-xl border border-white/5 bg-black/20 overflow-auto">
            <TreeNode heap={heap} i={0} highlighted={highlighted} />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleInsert()}
          placeholder="Value"
          className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40"
        />
        <button onClick={handleInsert}
          className="px-4 py-2 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
          Insert
        </button>
        <button onClick={handleExtract}
          className="px-4 py-2 rounded-lg bg-red-600/70 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
          Extract Min
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80 text-sm transition-colors ml-auto">
          Reset
        </button>
      </div>

      <div className="text-xs text-white/20 border-t border-white/5 pt-3">
        Min-Heap — parent is always smaller than children. Insert + heapify O(log n). Extract min O(log n).
      </div>
    </div>
  );
}
