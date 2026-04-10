import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { VisualizationStep } from "@workspace/api-client-react";

interface RawNode { id: number; label?: string; x?: number; y?: number; }
interface RawEdge { from?: number; to?: number; source?: number; target?: number; weight?: number; }
interface PNode extends RawNode { px: number; py: number; }

const SVG_W = 360;
const SVG_H = 220;
const NODE_R = 18;

function computeLayout(nodes: RawNode[], edges: RawEdge[]): PNode[] {
  if (!nodes.length) return [];

  const adj = new Map<number, Set<number>>();
  nodes.forEach(n => adj.set(n.id, new Set()));
  edges.forEach(e => {
    const src = e.from ?? e.source!;
    const tgt = e.to ?? e.target!;
    if (adj.has(src)) adj.get(src)!.add(tgt);
    if (adj.has(tgt)) adj.get(tgt)!.add(src);
  });

  const levels = new Map<number, number>();
  const bfsQ = [nodes[0].id];
  levels.set(nodes[0].id, 0);
  while (bfsQ.length) {
    const curr = bfsQ.shift()!;
    const lvl = levels.get(curr)!;
    for (const nb of adj.get(curr) ?? []) {
      if (!levels.has(nb)) { levels.set(nb, lvl + 1); bfsQ.push(nb); }
    }
  }
  const maxLvl = Math.max(0, ...levels.values());
  nodes.forEach(n => { if (!levels.has(n.id)) levels.set(n.id, maxLvl + 1); });

  const byLevel = new Map<number, number[]>();
  for (const [id, lvl] of levels) {
    if (!byLevel.has(lvl)) byLevel.set(lvl, []);
    byLevel.get(lvl)!.push(id);
  }

  const totalLvls = Math.max(...byLevel.keys()) + 1;
  const posMap = new Map<number, { px: number; py: number }>();
  for (const [lvl, ids] of byLevel) {
    ids.forEach((id, i) => {
      posMap.set(id, {
        px: ((i + 1) / (ids.length + 1)) * SVG_W,
        py: 30 + ((lvl + 0.5) / totalLvls) * (SVG_H - 40),
      });
    });
  }

  return nodes.map(n => ({
    ...n,
    px: n.x !== undefined ? n.x : (posMap.get(n.id)?.px ?? SVG_W / 2),
    py: n.y !== undefined ? n.y : (posMap.get(n.id)?.py ?? SVG_H / 2),
  }));
}

function shortLine(x1: number, y1: number, x2: number, y2: number, r = NODE_R + 3) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return { x1, y1, x2, y2 };
  return {
    x1: x1 + (dx / len) * r,
    y1: y1 + (dy / len) * r,
    x2: x2 - (dx / len) * r,
    y2: y2 - (dy / len) * r,
  };
}

function getNodeStyle(id: number, currentNode: number | null, visited: number[], queue: number[], stack: number[]) {
  if (id === currentNode)     return { bg: "#1d4ed8", border: "#60a5fa", text: "#fff", glow: true };
  if (visited.includes(id))   return { bg: "#065f46", border: "#10b981", text: "#d1fae5", glow: false };
  if (queue.includes(id) || stack.includes(id)) return { bg: "#78350f", border: "#f59e0b", text: "#fef3c7", glow: false };
  return { bg: "#0f172a", border: "rgba(255,255,255,0.18)", text: "rgba(255,255,255,0.85)", glow: false };
}

export function GraphVisualizer({ step }: { step: VisualizationStep }) {
  const s = step.state as any;
  const rawNodes: RawNode[] = s?.nodes ?? [];
  const rawEdges: RawEdge[] = s?.edges ?? [];
  const visited: number[]   = s?.visited ?? [];
  const queue: number[]     = s?.queue ?? [];
  const stack: number[]     = s?.stack ?? [];
  const currentNode: number | null = s?.currentNode ?? s?.current ?? null;
  const actionLog: string[] = s?.actionLog ?? [];
  const operation: string   = s?.operation ?? "bfs";
  const iteration: string   = s?.iteration ?? "";
  const action: string      = s?.action ?? step.description ?? "";
  const distances: Record<number, number | string> = s?.distances ?? {};
  const activeEdge: [number, number] | null = Array.isArray(s?.activeEdge) ? s.activeEdge : null;

  const pnodes = useMemo(() => computeLayout(rawNodes, rawEdges), [JSON.stringify(rawNodes), JSON.stringify(rawEdges)]);
  const nodeById = useMemo(() => new Map(pnodes.map(n => [n.id, n])), [pnodes]);

  const isStackOp = operation === "dfs" || operation === "cycle" || operation === "toposort";
  const dsLabel = isStackOp ? "Stack" : "Queue";
  const dsItems = isStackOp ? (stack.length ? stack : queue) : queue;

  const opLabel: Record<string, string> = {
    bfs: "BFS", dfs: "DFS", dijkstra: "Dijkstra",
    cycle: "Cycle Detection", toposort: "Topological Sort",
  };

  return (
    <div className="w-full flex gap-3 items-start">
      {/* ── LEFT: graph + queue bar ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        {/* op badge */}
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {opLabel[operation] ?? operation.toUpperCase()} · Graph Traversal
          </span>
        </div>

        {/* SVG graph */}
        <div className="bg-blue-500/5 rounded-xl border border-blue-500/20 overflow-hidden">
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full" style={{ aspectRatio: `${SVG_W}/${SVG_H}` }}>
            <defs>
              {["default", "active", "visited"].map(kind => (
                <marker
                  key={kind}
                  id={`arr-${kind}`}
                  viewBox="0 0 10 10" refX="9" refY="5"
                  markerWidth="5" markerHeight="5" orient="auto-start-reverse"
                >
                  <path
                    d="M 0 0 L 10 5 L 0 10 z"
                    fill={kind === "active" ? "#60a5fa" : kind === "visited" ? "#10b981" : "rgba(255,255,255,0.25)"}
                  />
                </marker>
              ))}
            </defs>

            {/* edges */}
            {rawEdges.map((e, i) => {
              const srcId = e.from ?? e.source!;
              const tgtId = e.to   ?? e.target!;
              const src = nodeById.get(srcId);
              const tgt = nodeById.get(tgtId);
              if (!src || !tgt) return null;

              const isActive = activeEdge !== null &&
                ((activeEdge[0] === srcId && activeEdge[1] === tgtId) ||
                 (activeEdge[0] === tgtId && activeEdge[1] === srcId));
              const isVisEdge = visited.includes(srcId) && visited.includes(tgtId);
              const { x1, y1, x2, y2 } = shortLine(src.px, src.py, tgt.px, tgt.py);
              const color = isActive ? "#60a5fa" : isVisEdge ? "#10b981" : "rgba(255,255,255,0.22)";
              const markerId = isActive ? "url(#arr-active)" : isVisEdge ? "url(#arr-visited)" : "url(#arr-default)";

              return (
                <motion.line
                  key={i}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={color}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  markerEnd={markerId}
                  strokeDasharray={isActive ? "5 3" : undefined}
                  animate={{ stroke: color }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}

            {/* edge weight labels */}
            {rawEdges.map((e, i) => {
              if (!e.weight) return null;
              const srcId = e.from ?? e.source!;
              const tgtId = e.to   ?? e.target!;
              const src = nodeById.get(srcId);
              const tgt = nodeById.get(tgtId);
              if (!src || !tgt) return null;
              return (
                <text key={`w${i}`} x={(src.px + tgt.px) / 2} y={(src.py + tgt.py) / 2 - 5}
                  textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">
                  {e.weight}
                </text>
              );
            })}

            {/* nodes */}
            {pnodes.map(node => {
              const st = getNodeStyle(node.id, currentNode, visited, queue, stack);
              const dist = distances[node.id];
              const isCurr = node.id === currentNode;
              return (
                <motion.g
                  key={node.id}
                  animate={{ scale: isCurr ? 1.18 : 1 }}
                  style={{ transformOrigin: `${node.px}px ${node.py}px` }}
                  transition={{ type: "spring", stiffness: 280, damping: 18 }}
                >
                  {st.glow && (
                    <circle cx={node.px} cy={node.py} r={NODE_R + 6}
                      fill="none" stroke="#3b82f6" strokeWidth="1"
                      opacity="0.4" />
                  )}
                  <circle
                    cx={node.px} cy={node.py} r={NODE_R}
                    fill={st.bg} stroke={st.border}
                    strokeWidth={isCurr ? 2.5 : 1.5}
                  />
                  <text
                    x={node.px} y={node.py + (dist !== undefined ? -3 : 5)}
                    textAnchor="middle" fontSize={dist !== undefined ? "10" : "13"}
                    fontWeight="700" fill={st.text}
                    style={{ userSelect: "none", fontFamily: "monospace" }}
                  >
                    {node.label ?? String(node.id)}
                  </text>
                  {dist !== undefined && (
                    <text x={node.px} y={node.py + 9} textAnchor="middle"
                      fontSize="9" fill="#93c5fd"
                      style={{ userSelect: "none" }}>
                      {dist === null || dist === Infinity || dist === "∞" || dist === "Infinity" || (typeof dist === "number" && dist >= 1e7)
                        ? "d:∞"
                        : `d:${dist}`}
                    </text>
                  )}
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* queue / stack pills */}
        {dsItems.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-white/40 font-mono shrink-0 mr-1">{dsLabel}:</span>
            {dsItems.map((id, i) => (
              <motion.div
                key={`${id}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="w-7 h-7 flex items-center justify-center rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold"
              >
                {id}
              </motion.div>
            ))}
          </div>
        )}

        {/* visited row */}
        {visited.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-white/40 font-mono shrink-0 mr-1">Visited:</span>
            {visited.map((id, i) => (
              <motion.div
                key={`v${id}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-0.5"
              >
                <div className="w-6 h-6 flex items-center justify-center rounded bg-emerald-900/50 border border-emerald-700/60 text-emerald-400 text-[10px] font-mono font-bold">
                  {id}
                </div>
                {i < visited.length - 1 && <span className="text-white/20 text-[10px]">→</span>}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: state + log ── */}
      <div className="w-44 shrink-0 flex flex-col gap-2">
        {/* Current State card */}
        <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/25 p-2.5 flex flex-col gap-1.5">
          <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Current State</p>
          {currentNode !== null && (
            <div>
              <span className="text-[10px] text-white/40">Current Node: </span>
              <span className="text-sm font-bold text-blue-400">{currentNode}</span>
            </div>
          )}
          {dsItems.length > 0 && (
            <p className="text-[10px] text-white/70 leading-snug">
              <span className="text-white/35">{dsLabel}: </span>
              [{dsItems.slice(0, 6).join(", ")}{dsItems.length > 6 ? "…" : ""}]
            </p>
          )}
          {visited.length > 0 && (
            <p className="text-[10px] text-white/70 leading-snug">
              <span className="text-white/35">Visited: </span>
              [{visited.slice(0, 5).join(", ")}{visited.length > 5 ? "…" : ""}]
            </p>
          )}
          {action && (
            <p className="text-[10px] text-emerald-300 leading-snug mt-0.5 border-t border-emerald-500/15 pt-1.5">
              {action}
            </p>
          )}
          {iteration && (
            <p className="text-[9px] text-white/25 mt-0.5">{iteration}</p>
          )}
        </div>

        {/* Action Log card */}
        {actionLog.length > 0 && (
          <div className="bg-amber-500/10 rounded-xl border border-amber-500/25 p-2.5 flex flex-col gap-1.5">
            <p className="text-[9px] font-bold text-amber-400 uppercase tracking-widest">Action Log</p>
            <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 160 }}>
              {actionLog.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="flex items-start gap-1.5"
                >
                  <div className="mt-0.5 w-3 h-3 rounded-full bg-amber-500/30 border border-amber-400/50 flex items-center justify-center shrink-0">
                    <div className="w-1 h-1 rounded-full bg-amber-300" />
                  </div>
                  <span className="text-[10px] text-white/65 leading-snug">{log}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-col gap-1 px-0.5">
          {[
            { color: "bg-blue-600 border-blue-400", label: "Current" },
            { color: "bg-emerald-900 border-emerald-500", label: "Visited" },
            { color: "bg-amber-900 border-amber-500", label: isStackOp ? "In Stack" : "In Queue" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full border ${color} shrink-0`} />
              <span className="text-[9px] text-white/35">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
