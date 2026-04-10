import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Msg({ text, type }: { text: string; type: "add" | "del" | "" }) {
  if (!text) return null;
  const color =
    type === "add" ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
    : type === "del" ? "text-red-300 bg-red-900/20 border-red-500/20"
    : "text-white/50 bg-white/5 border-white/10";
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-lg px-3 py-2 border ${color}`}>{text}</motion.div>
  );
}

let nodeId = 20;

export function LinkedListPG() {
  const [nodes, setNodes] = useState<{ id: number; val: number }[]>([
    { id: 1, val: 4 }, { id: 2, val: 7 }, { id: 3, val: 2 },
  ]);
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"add" | "del" | "">("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  function notify(text: string, type: "add" | "del" | "") { setMsg(text); setMsgType(type); }

  function flash(id: number, cb: () => void) {
    setHighlighted(id);
    setTimeout(() => { setHighlighted(null); cb(); }, 350);
  }

  function handleInsertHead() {
    const val = parseInt(input);
    if (isNaN(val)) return;
    const node = { id: ++nodeId, val };
    setNodes(prev => [node, ...prev]);
    flash(node.id, () => {});
    notify(`Inserted ${val} at head`, "add");
    setInput("");
  }

  function handleInsertTail() {
    const val = parseInt(input);
    if (isNaN(val)) return;
    const node = { id: ++nodeId, val };
    setNodes(prev => [...prev, node]);
    flash(node.id, () => {});
    notify(`Inserted ${val} at tail`, "add");
    setInput("");
  }

  function handleDeleteHead() {
    if (nodes.length === 0) { notify("List is empty!", ""); return; }
    const head = nodes[0];
    flash(head.id, () => setNodes(prev => prev.slice(1)));
    notify(`Deleted head node with value ${head.val}`, "del");
  }

  function handleDeleteTail() {
    if (nodes.length === 0) { notify("List is empty!", ""); return; }
    const tail = nodes[nodes.length - 1];
    flash(tail.id, () => setNodes(prev => prev.slice(0, -1)));
    notify(`Deleted tail node with value ${tail.val}`, "del");
  }

  function handleReset() { setNodes([]); setMsg(""); }

  return (
    <div className="flex flex-col gap-4">
      <Msg text={msg} type={msgType} />

      {/* List visual */}
      <div className="flex flex-wrap items-center gap-0 min-h-[80px] overflow-x-auto pb-2">
        <AnimatePresence mode="popLayout">
          {nodes.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 text-sm italic">List is empty</motion.div>
          )}
          {nodes.map((node, i) => (
            <motion.div key={node.id}
              layout
              initial={{ scale: 0.7, opacity: 0, x: -20 }}
              animate={{ scale: highlighted === node.id ? 1.1 : 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.7, opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="flex items-center"
            >
              {/* Node box */}
              <div className={`flex flex-col rounded-xl border-2 overflow-hidden font-mono shrink-0
                ${i === 0
                  ? "border-blue-400/70 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  : i === nodes.length - 1
                  ? "border-purple-400/70 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                  : highlighted === node.id
                  ? "border-emerald-400/70 shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                  : "border-slate-700/60"}`}
              >
                <div className={`px-4 py-2 text-center font-bold text-base
                  ${i === 0 ? "bg-blue-900/30 text-blue-100"
                    : i === nodes.length - 1 ? "bg-purple-900/30 text-purple-100"
                    : "bg-[#0b1628] text-white/80"}`}
                >
                  {node.val}
                </div>
                <div className="px-2 py-1 bg-black/30 text-[9px] text-center text-white/25 border-t border-white/5">
                  {i === 0 ? "HEAD" : i === nodes.length - 1 ? "TAIL" : `next →`}
                </div>
              </div>

              {/* Arrow */}
              {i < nodes.length - 1 && (
                <div className="flex items-center gap-0.5 px-1 shrink-0">
                  <div className="w-5 h-px bg-white/20" />
                  <span className="text-white/20 text-sm">→</span>
                </div>
              )}
            </motion.div>
          ))}

          {/* Null terminator */}
          {nodes.length > 0 && (
            <motion.div layout key="null" className="flex items-center pl-1">
              <div className="flex items-center gap-0.5">
                <div className="w-5 h-px bg-white/10" />
                <span className="text-white/10 text-sm">→</span>
              </div>
              <span className="text-xs font-mono text-white/20 ml-1">null</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleInsertHead()}
          placeholder="Value"
          className="w-24 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40"
        />
        <button onClick={handleInsertHead}
          className="px-4 py-2 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-sm font-semibold transition-colors">
          Insert Head
        </button>
        <button onClick={handleInsertTail}
          className="px-4 py-2 rounded-lg bg-purple-600/80 hover:bg-purple-600 text-white text-sm font-semibold transition-colors">
          Insert Tail
        </button>
        <button onClick={handleDeleteHead}
          className="px-4 py-2 rounded-lg bg-red-600/70 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
          Delete Head
        </button>
        <button onClick={handleDeleteTail}
          className="px-4 py-2 rounded-lg bg-orange-600/70 hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
          Delete Tail
        </button>
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80 text-sm transition-colors ml-auto">
          Reset
        </button>
      </div>

      <div className="text-xs text-white/20 border-t border-white/5 pt-3">
        Singly linked list — each node holds a value and a pointer (next) to the next node. O(1) head insert/delete.
      </div>
    </div>
  );
}
