import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TreeNode = { val: number; left: TreeNode | null; right: TreeNode | null };

function insertBST(root: TreeNode | null, val: number): TreeNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: insertBST(root.left, val) };
  if (val > root.val) return { ...root, right: insertBST(root.right, val) };
  return root;
}

function treeHeight(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + Math.max(treeHeight(node.left), treeHeight(node.right));
}

function Msg({ text, type }: { text: string; type: "insert" | "" }) {
  if (!text) return null;
  const color = type === "insert"
    ? "text-emerald-300 bg-emerald-900/20 border-emerald-500/20"
    : "text-white/50 bg-white/5 border-white/10";
  return (
    <motion.div key={text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className={`text-sm rounded-lg px-3 py-2 border ${color}`}>{text}</motion.div>
  );
}

function NodeView({
  node,
  highlight,
  depth,
  maxDepth,
}: {
  node: TreeNode;
  highlight: number | null;
  depth: number;
  maxDepth: number;
}) {
  const isRoot = depth === 0;
  const isHl = highlight === node.val;
  const gap = maxDepth <= 3 ? "gap-4" : "gap-2";

  return (
    <div className={`flex flex-col items-center ${gap}`}>
      <motion.div
        layout
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: isHl ? 1.18 : 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 340, damping: 24 }}
        className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-mono font-bold text-sm
          ${isRoot
            ? "bg-blue-900/50 border-blue-400 text-blue-100 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
            : isHl
            ? "bg-emerald-900/40 border-emerald-400 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.35)]"
            : "bg-[#0b1628] border-slate-700/55 text-white/75"}`}
      >
        {node.val}
      </motion.div>

      {(node.left || node.right) && (
        <div className={`flex ${maxDepth > 3 ? "gap-3" : "gap-6"} mt-1`}>
          {node.left && (
            <div className="flex flex-col items-end pr-1">
              <div className="flex items-start">
                <div className="w-px h-4 bg-white/15 self-stretch" style={{ marginRight: 0 }} />
              </div>
              <NodeView node={node.left} highlight={highlight} depth={depth + 1} maxDepth={maxDepth} />
            </div>
          )}
          {node.right && (
            <div className="flex flex-col items-start pl-1">
              <div className="flex items-start">
                <div className="w-px h-4 bg-white/15" />
              </div>
              <NodeView node={node.right} highlight={highlight} depth={depth + 1} maxDepth={maxDepth} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TreePG() {
  const [root, setRoot] = useState<TreeNode | null>(() =>
    [5, 3, 8, 1, 4, 7, 9].reduce((r, v) => insertBST(r, v), null as TreeNode | null)
  );
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"insert" | "">("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  function notify(text: string, type: "insert" | "") { setMsg(text); setMsgType(type); }

  function handleInsert() {
    const val = parseInt(input);
    if (isNaN(val)) return;
    const height = treeHeight(root);
    if (height >= 4) { notify("Tree is full (max 4 levels). Reset to continue.", ""); return; }
    setRoot(r => insertBST(r, val));
    setHighlighted(val);
    setTimeout(() => setHighlighted(null), 600);
    notify(`Inserted ${val} into the BST`, "insert");
    setInput("");
  }

  function handleReset() {
    setRoot(null); setMsg(""); setHighlighted(null);
  }

  const height = treeHeight(root);

  return (
    <div className="flex flex-col gap-4">
      <Msg text={msg} type={msgType} />

      {/* Tree visual */}
      <div className="flex justify-center items-start p-4 rounded-xl border border-white/5 bg-black/20 min-h-[160px] overflow-auto">
        <AnimatePresence mode="wait">
          {!root ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-white/20 text-sm italic self-center">Tree is empty</motion.div>
          ) : (
            <NodeView key="tree" node={root} highlight={highlighted} depth={0} maxDepth={height} />
          )}
        </AnimatePresence>
      </div>

      {/* Properties */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: "Height", val: height },
          { label: "Nodes", val: countNodes(root) },
          { label: "Type", val: "BST" },
        ].map(p => (
          <div key={p.label} className="px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 text-xs font-mono">
            <span className="text-white/35">{p.label}: </span>
            <span className="text-white/70 font-semibold">{p.val}</span>
          </div>
        ))}
      </div>

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
        <button onClick={handleReset}
          className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80 text-sm transition-colors ml-auto">
          Reset
        </button>
      </div>

      <div className="text-xs text-white/20 border-t border-white/5 pt-3">
        Binary Search Tree — left subtree has smaller values, right has larger. BST insert O(log n) avg.
      </div>
    </div>
  );
}

function countNodes(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}
