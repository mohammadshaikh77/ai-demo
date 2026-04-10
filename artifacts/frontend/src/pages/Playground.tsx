import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, AlignJustify, Link2, GitBranch, BarChart2, LayoutGrid } from "lucide-react";
import { ArrayPG } from "@/components/playground/ArrayPG";
import { StackPG } from "@/components/playground/StackPG";
import { QueuePG } from "@/components/playground/QueuePG";
import { LinkedListPG } from "@/components/playground/LinkedListPG";
import { TreePG } from "@/components/playground/TreePG";
import { HeapPG } from "@/components/playground/HeapPG";

type DS = "Array" | "Stack" | "Queue" | "Linked List" | "Binary Tree" | "Heap";

const DS_LIST: {
  id: DS;
  icon: React.ReactNode;
  tagline: string;
  color: string;
  accent: string;
}[] = [
  {
    id: "Array",
    icon: <LayoutGrid className="w-5 h-5" />,
    tagline: "Insert, delete, update",
    color: "border-blue-500/30 bg-blue-500/5",
    accent: "text-blue-400",
  },
  {
    id: "Stack",
    icon: <Layers className="w-5 h-5" />,
    tagline: "Push, pop, peek — LIFO",
    color: "border-purple-500/30 bg-purple-500/5",
    accent: "text-purple-400",
  },
  {
    id: "Queue",
    icon: <AlignJustify className="w-5 h-5" />,
    tagline: "Enqueue, dequeue — FIFO",
    color: "border-emerald-500/30 bg-emerald-500/5",
    accent: "text-emerald-400",
  },
  {
    id: "Linked List",
    icon: <Link2 className="w-5 h-5" />,
    tagline: "Head / tail insert & delete",
    color: "border-amber-500/30 bg-amber-500/5",
    accent: "text-amber-400",
  },
  {
    id: "Binary Tree",
    icon: <GitBranch className="w-5 h-5" />,
    tagline: "BST insert & traverse",
    color: "border-rose-500/30 bg-rose-500/5",
    accent: "text-rose-400",
  },
  {
    id: "Heap",
    icon: <BarChart2 className="w-5 h-5" />,
    tagline: "Insert, extract min",
    color: "border-cyan-500/30 bg-cyan-500/5",
    accent: "text-cyan-400",
  },
];

function DSCard({
  ds,
  selected,
  onClick,
}: {
  ds: (typeof DS_LIST)[number];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3
        ${selected
          ? `${ds.color} border-opacity-100 shadow-[0_0_14px_rgba(0,0,0,0.4)]`
          : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15"}`}
    >
      <span className={`transition-colors ${selected ? ds.accent : "text-white/30"}`}>
        {ds.icon}
      </span>
      <div className="flex flex-col min-w-0">
        <span className={`text-sm font-semibold leading-tight ${selected ? "text-white" : "text-white/60"}`}>
          {ds.id}
        </span>
        <span className="text-[11px] text-white/25 mt-0.5 leading-tight">{ds.tagline}</span>
      </div>
      {selected && (
        <motion.div layoutId="active-dot"
          className={`ml-auto w-2 h-2 rounded-full ${ds.accent.replace("text-", "bg-")}`} />
      )}
    </motion.button>
  );
}

function PlaygroundPanel({ selected }: { selected: DS }) {
  const ds = DS_LIST.find(d => d.id === selected)!;
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Panel header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/8">
        <div className={`p-2.5 rounded-xl border ${ds.color}`}>
          <span className={ds.accent}>{ds.icon}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">{ds.id}</h2>
          <p className="text-sm text-white/35">{ds.tagline}</p>
        </div>
      </div>

      {/* Component */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {selected === "Array" && <ArrayPG />}
          {selected === "Stack" && <StackPG />}
          {selected === "Queue" && <QueuePG />}
          {selected === "Linked List" && <LinkedListPG />}
          {selected === "Binary Tree" && <TreePG />}
          {selected === "Heap" && <HeapPG />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Playground() {
  const [selected, setSelected] = useState<DS>("Stack");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Page header */}
      <div className="border-b border-white/8 px-6 py-5 flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Data Structures{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              Playground
            </span>
          </h1>
          <p className="text-sm text-white/35 mt-1">
            Learn by doing — interact with 6 data structures in real time
          </p>
        </div>
        <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono text-white/40">Interactive</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: DS selector */}
        <div className="w-56 shrink-0 border-r border-white/8 p-3 flex flex-col gap-1.5 overflow-y-auto">
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest px-1 mb-1">
            Select Structure
          </p>
          {DS_LIST.map(ds => (
            <DSCard
              key={ds.id}
              ds={ds}
              selected={selected === ds.id}
              onClick={() => setSelected(ds.id)}
            />
          ))}
        </div>

        {/* Right: Playground area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <PlaygroundPanel selected={selected} />
          </div>
        </div>
      </div>
    </div>
  );
}
