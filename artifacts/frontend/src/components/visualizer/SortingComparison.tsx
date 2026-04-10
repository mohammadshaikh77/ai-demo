import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, FastForward,
  Shuffle, GitCompareArrows, TableProperties, Loader2, BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisualizerDisplay } from "./VisualizerDisplay";
import { SORTING_ALGOS, SORTING_GENERATORS, randomArray } from "./generateSortingSteps";
import { VisualizationStep } from "@workspace/api-client-react";

// ─── Static complexity reference data ───────────────────────────────────────
const ALGO_DATA = [
  {
    name: "Bubble Sort",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)",
    space: "O(1)", stable: true,
    useCase: "Small/nearly-sorted data, teaching",
    speedScore: 28,
    color: "from-red-500 to-rose-600",
  },
  {
    name: "Insertion Sort",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)",
    space: "O(1)", stable: true,
    useCase: "Nearly sorted, small datasets, online sorting",
    speedScore: 35,
    color: "from-orange-500 to-amber-500",
  },
  {
    name: "Merge Sort",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)",
    space: "O(n)", stable: true,
    useCase: "Large data, linked lists, stable sort required",
    speedScore: 78,
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Quick Sort",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)",
    space: "O(log n)", stable: false,
    useCase: "General purpose, cache-friendly, in-place sorting",
    speedScore: 92,
    color: "from-emerald-500 to-teal-500",
  },
];

// ─── AI Insight section ─────────────────────────────────────────────────────
interface InsightData {
  bestForLarge: string;
  bestForSmall: string;
  bestForNearlySorted: string;
  generalTip: string;
}

function AIInsight() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dsa/sorting-insight", { method: "POST" })
      .then((r) => r.json())
      .then((res: InsightData) => { if (!cancelled) setData(res); })
      .catch(() => { if (!cancelled) setLoading(false); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <BrainCircuit className="w-4 h-4 text-primary" />
        <h4 className="font-semibold text-white text-sm">AI Insight — When to use which?</h4>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-white/40">
          <Loader2 className="w-4 h-4 animate-spin" /> Generating insight…
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: "Large input", value: data.bestForLarge },
            { label: "Small input", value: data.bestForSmall },
            { label: "Nearly sorted", value: data.bestForNearlySorted },
            { label: "General tip", value: data.generalTip },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 bg-black/20 rounded-lg p-3 border border-white/5">
              <span className="text-xs text-white/40 uppercase tracking-wider font-mono">{label}</span>
              <span className="text-white/80 leading-snug">{value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/30 italic">Could not load insight.</p>
      )}
    </div>
  );
}

// ─── Comparison Table ────────────────────────────────────────────────────────
function ComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/8">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-white/3">
            {["Algorithm", "Best", "Average", "Worst", "Space", "Stable", "Use Case"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-mono text-white/40 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ALGO_DATA.map((a, i) => (
            <motion.tr
              key={a.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="border-b border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{a.name}</td>
              <td className="px-4 py-3 font-mono text-emerald-400 whitespace-nowrap">{a.best}</td>
              <td className="px-4 py-3 font-mono text-amber-400 whitespace-nowrap">{a.avg}</td>
              <td className="px-4 py-3 font-mono text-red-400 whitespace-nowrap">{a.worst}</td>
              <td className="px-4 py-3 font-mono text-white/60 whitespace-nowrap">{a.space}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <Badge className={`text-xs ${a.stable ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-red-500/15 text-red-400 border-red-500/20"}`}>
                  {a.stable ? "Yes" : "No"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-white/50 max-w-[200px]">{a.useCase}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Speed Bars ──────────────────────────────────────────────────────────────
function SpeedBars() {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider font-mono">
        Relative Speed (Average Case)
      </h4>
      {[...ALGO_DATA].sort((a, b) => b.speedScore - a.speedScore).map((a, i) => (
        <div key={a.name} className="flex items-center gap-3">
          <span className="text-sm text-white/70 w-32 shrink-0">{a.name}</span>
          <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden border border-white/8">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${a.speedScore}%` }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${a.color}`}
            />
          </div>
          <span className="text-xs font-mono text-white/30 w-10 text-right shrink-0">{a.speedScore}%</span>
        </div>
      ))}
      <p className="text-xs text-white/25 mt-1">Higher bar = faster in average-case scenarios</p>
    </div>
  );
}

// ─── Pass label per algorithm ────────────────────────────────────────────────
function passLabel(algoName: string): string {
  const lower = algoName.toLowerCase();
  if (lower.includes("bubble")) return "Pass";
  if (lower.includes("insertion")) return "Insertion";
  if (lower.includes("merge")) return "Merge";
  if (lower.includes("quick")) return "Partition";
  return "Pass";
}

// ─── Side-by-Side ────────────────────────────────────────────────────────────
function SideBySideView() {
  const [algoA, setAlgoA] = useState("Bubble Sort");
  const [algoB, setAlgoB] = useState("Quick Sort");
  const [inputArray, setInputArray] = useState<number[]>(() => randomArray(7));
  const [stepsA, setStepsA] = useState<VisualizationStep[]>([]);
  const [stepsB, setStepsB] = useState<VisualizationStep[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const playRef = useRef<number | null>(null);

  const maxSteps = Math.max(stepsA.length, stepsB.length);
  const stepA = stepsA[Math.min(currentStep, stepsA.length - 1)];
  const stepB = stepsB[Math.min(currentStep, stepsB.length - 1)];

  const handleGenerate = useCallback(() => {
    const genA = SORTING_GENERATORS[algoA];
    const genB = SORTING_GENERATORS[algoB];
    if (!genA || !genB) return;
    setStepsA(genA([...inputArray]));
    setStepsB(genB([...inputArray]));
    setCurrentStep(0);
    setIsPlaying(false);
    setHasGenerated(true);
  }, [algoA, algoB, inputArray]);

  const handleShuffle = () => {
    const arr = randomArray(7);
    setInputArray(arr);
    setHasGenerated(false);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNext = useCallback(() => {
    if (currentStep < maxSteps - 1) setCurrentStep((p) => p + 1);
    else setIsPlaying(false);
  }, [currentStep, maxSteps]);

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  useEffect(() => {
    if (playRef.current) window.clearTimeout(playRef.current);
    if (isPlaying && maxSteps > 0) {
      if (currentStep >= maxSteps - 1) { setIsPlaying(false); return; }
      playRef.current = window.setTimeout(handleNext, 1000 / speed);
    }
    return () => { if (playRef.current) window.clearTimeout(playRef.current); };
  }, [isPlaying, currentStep, speed, maxSteps, handleNext]);

  return (
    <div className="flex flex-col gap-5">
      {/* Controls row */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-xs text-white/40 font-mono uppercase">Algorithm A</label>
          <select
            value={algoA}
            onChange={(e) => { setAlgoA(e.target.value); setHasGenerated(false); }}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
          >
            {SORTING_ALGOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex items-end pb-2 text-white/30 font-bold text-lg select-none">vs</div>

        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-xs text-white/40 font-mono uppercase">Algorithm B</label>
          <select
            value={algoB}
            onChange={(e) => { setAlgoB(e.target.value); setHasGenerated(false); }}
            className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
          >
            {SORTING_ALGOS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
          <label className="text-xs text-white/40 font-mono uppercase">Array</label>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 flex-wrap">
              {inputArray.map((n, i) => (
                <span key={i} className="w-7 h-7 flex items-center justify-center rounded bg-white/5 border border-white/10 text-xs font-mono text-white/70">{n}</span>
              ))}
            </div>
            <button onClick={handleShuffle} className="p-1.5 rounded-lg border border-white/10 hover:bg-white/8 transition-colors text-white/40 hover:text-white/70">
              <Shuffle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          className="bg-primary hover:bg-primary/90 gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
        >
          <GitCompareArrows className="w-4 h-4" />
          Compare
        </Button>
      </div>

      {/* Visualization panels */}
      <AnimatePresence>
        {hasGenerated && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            {/* Dual panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: algoA, step: stepA, steps: stepsA, color: "border-blue-500/30 bg-blue-500/5", badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/25" },
                { label: algoB, step: stepB, steps: stepsB, color: "border-emerald-500/30 bg-emerald-500/5", badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
              ].map(({ label, step, steps, color, badgeColor }) => {
                const pass = step ? ((step.state as any)?.pass ?? 0) : 0;
                const pLabel = passLabel(label);
                return (
                  <div key={label} className={`rounded-xl border ${color} p-4 flex flex-col gap-3 min-h-[260px] justify-between`}>
                    {/* Panel header with pass counter */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border font-semibold ${pass > 0 ? badgeColor : "bg-white/5 text-white/25 border-white/10"}`}>
                          {pLabel}: {pass}
                        </span>
                        <span className="text-xs font-mono text-white/25">{steps.length} steps</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      {step ? (
                        <VisualizerDisplay
                          step={step}
                          steps={steps}
                          currentStepIndex={Math.min(currentStep, steps.length - 1)}
                        />
                      ) : (
                        <span className="text-white/20 text-sm">No steps</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shared controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-white/10 bg-[rgba(5,10,26,0.82)] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3">
                <button onClick={handlePrev} disabled={currentStep === 0} className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/8 disabled:opacity-30 transition-all">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying((p) => !p)}
                  disabled={currentStep >= maxSteps - 1 && !isPlaying}
                  className="w-11 h-11 flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_18px_rgba(59,130,246,0.5)] transition-all hover:scale-105 disabled:opacity-40"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button onClick={handleNext} disabled={currentStep >= maxSteps - 1} className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/8 disabled:opacity-30 transition-all">
                  <SkipForward className="w-4 h-4" />
                </button>
                <div className="text-xs font-mono text-white/50 bg-white/5 border border-white/8 rounded-full px-3 py-1 select-none">
                  {currentStep + 1} / {maxSteps}
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto sm:min-w-[180px]">
                <FastForward className="w-3.5 h-3.5 text-white/40 shrink-0" />
                <Slider value={[speed]} min={0.5} max={3} step={0.5} onValueChange={(v) => setSpeed(v[0])} className="flex-1" />
                <span className="text-xs font-mono text-white/50 w-8 text-right shrink-0">{speed}x</span>
              </div>
            </div>
          </motion.div>
        )}

        {!hasGenerated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-36 text-white/25 text-sm border border-white/5 rounded-xl"
          >
            Select two algorithms and click Compare to start
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export function SortingComparison() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full glass-card rounded-xl border border-white/5 overflow-hidden"
    >
      <Tabs defaultValue="compare" className="w-full">
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-primary" />
            Compare Algorithms
          </h3>
          <TabsList className="bg-black/40 border border-white/5">
            <TabsTrigger value="compare" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1.5 text-xs">
              <TableProperties className="w-3.5 h-3.5" /> Table
            </TabsTrigger>
            <TabsTrigger value="sidebyside" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1.5 text-xs">
              <GitCompareArrows className="w-3.5 h-3.5" /> Side-by-Side
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="compare" className="p-6 flex flex-col gap-6">
          <ComparisonTable />
          <SpeedBars />
          <AIInsight />
        </TabsContent>

        <TabsContent value="sidebyside" className="p-6">
          <SideBySideView />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
