import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Msg({ text, type }: { text: string; type: "insert" | "delete" | "update" | "" }) {
  if (!text) return null;
  const color =
    type === "insert" ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
    : type === "delete" ? "text-red-300 bg-red-900/20 border-red-500/20"
    : type === "update" ? "text-blue-300 bg-blue-900/20 border-blue-500/20"
    : "text-white/50 bg-white/5 border-white/10";
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-lg px-3 py-2 border ${color}`}>{text}</motion.div>
  );
}

let uid = 100;

export function ArrayPG() {
  const [items, setItems] = useState<{ id: number; val: number }[]>([
    { id: 1, val: 5 }, { id: 2, val: 3 }, { id: 3, val: 8 }, { id: 4, val: 1 }, { id: 5, val: 7 },
  ]);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [insertVal, setInsertVal] = useState("");
  const [insertIdx, setInsertIdx] = useState("");
  const [deleteIdx, setDeleteIdx] = useState("");
  const [updateIdx, setUpdateIdx] = useState("");
  const [updateVal, setUpdateVal] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"insert" | "delete" | "update" | "">("");

  function flash(idx: number, cb: () => void) {
    setHighlighted(idx);
    setTimeout(() => { setHighlighted(null); cb(); }, 300);
  }

  function notify(text: string, type: "insert" | "delete" | "update" | "") {
    setMsg(text); setMsgType(type);
  }

  function handleInsert() {
    const val = parseInt(insertVal);
    const idx = parseInt(insertIdx);
    if (isNaN(val)) return;
    const i = isNaN(idx) ? items.length : Math.max(0, Math.min(items.length, idx));
    const newItem = { id: ++uid, val };
    setItems(prev => [...prev.slice(0, i), newItem, ...prev.slice(i)]);
    flash(i, () => {});
    notify(`Inserted ${val} at index ${i}`, "insert");
    setInsertVal(""); setInsertIdx("");
  }

  function handleDelete() {
    const idx = parseInt(deleteIdx);
    if (isNaN(idx) || idx < 0 || idx >= items.length) {
      notify(`Index ${deleteIdx} is out of range`, ""); return;
    }
    const removed = items[idx].val;
    flash(idx, () => setItems(prev => prev.filter((_, i) => i !== idx)));
    notify(`Deleted ${removed} at index ${idx}`, "delete");
    setDeleteIdx("");
  }

  function handleUpdate() {
    const idx = parseInt(updateIdx);
    const val = parseInt(updateVal);
    if (isNaN(idx) || isNaN(val) || idx < 0 || idx >= items.length) {
      notify(`Invalid index or value`, ""); return;
    }
    const old = items[idx].val;
    flash(idx, () => setItems(prev => prev.map((item, i) => i === idx ? { ...item, val } : item)));
    notify(`Updated index ${idx}: ${old} → ${val}`, "update");
    setUpdateIdx(""); setUpdateVal("");
  }

  function handleReset() { setItems([]); setMsg(""); }

  return (
    <div className="flex flex-col gap-5">
      <Msg text={msg} type={msgType} />

      {/* Array visual */}
      <div className="flex flex-wrap gap-2 min-h-[80px] items-end pb-6">
        <AnimatePresence mode="popLayout">
          {items.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 text-sm italic">Array is empty</motion.div>
          )}
          {items.map((item, i) => (
            <motion.div key={item.id}
              layout
              initial={{ y: -24, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: highlighted === i ? 1.12 : 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex flex-col items-center gap-1"
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-mono font-bold text-lg transition-colors duration-200
                ${highlighted === i
                  ? "bg-blue-800/50 border-blue-400 text-blue-100 shadow-[0_0_14px_rgba(59,130,246,0.5)]"
                  : "bg-[#0b1628] border-slate-700/50 text-white/80"}`}
              >{item.val}</div>
              <span className="text-[10px] font-mono text-white/25">{i}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Insert */}
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-emerald-500/15 bg-emerald-900/5">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Insert</span>
          <div className="flex gap-1.5">
            <input value={insertVal} onChange={e => setInsertVal(e.target.value)} placeholder="Value"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/40" />
            <input value={insertIdx} onChange={e => setInsertIdx(e.target.value)} placeholder="Index"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-emerald-500/40" />
          </div>
          <button onClick={handleInsert}
            className="w-full py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
            Insert
          </button>
        </div>

        {/* Delete */}
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-red-500/15 bg-red-900/5">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Delete</span>
          <input value={deleteIdx} onChange={e => setDeleteIdx(e.target.value)} placeholder="Index"
            className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-red-500/40" />
          <button onClick={handleDelete}
            className="w-full py-1.5 rounded-lg bg-red-600/70 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
            Delete
          </button>
        </div>

        {/* Update */}
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-blue-500/15 bg-blue-900/5">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Update</span>
          <div className="flex gap-1.5">
            <input value={updateIdx} onChange={e => setUpdateIdx(e.target.value)} placeholder="Index"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/40" />
            <input value={updateVal} onChange={e => setUpdateVal(e.target.value)} placeholder="Value"
              className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/40" />
          </div>
          <button onClick={handleUpdate}
            className="w-full py-1.5 rounded-lg bg-blue-600/70 hover:bg-blue-600 text-white text-sm font-semibold transition-colors">
            Update
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80 text-sm transition-colors">
          Reset
        </button>
      </div>

      <div className="text-xs text-white/20 border-t border-white/5 pt-3">
        Dynamic array — elements stored at contiguous indices. O(1) access, O(n) insert/delete.
      </div>
    </div>
  );
}
