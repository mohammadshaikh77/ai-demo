import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VisualizationStep } from "@workspace/api-client-react";
import { ArrayVisualizer } from "./types/ArrayVisualizer";
import { GraphVisualizer } from "./types/GraphVisualizer";
import { TreeVisualizer } from "./types/TreeVisualizer";
import { MatrixVisualizer } from "./types/MatrixVisualizer";
import { LinkedListVisualizer } from "./types/LinkedListVisualizer";
import { RecursionVisualizer } from "./types/RecursionVisualizer";
import { NQueensVisualizer } from "./types/NQueensVisualizer";
import { StackVisualizer } from "./types/StackVisualizer";
import { DPVisualizer } from "./types/DPVisualizer";

interface VisualizerDisplayProps {
  step: VisualizationStep;
  steps: VisualizationStep[];
  currentStepIndex: number;
}

export function VisualizerDisplay({ step, steps, currentStepIndex }: VisualizerDisplayProps) {
  const type = step.type;
  const state = step.state as any;

  const renderVisualizer = () => {
    if (type === "nqueens" || state?.queens !== undefined) return <NQueensVisualizer step={step} />;
    if (type === "stack") return <StackVisualizer step={step} />;
    if (type === "dp") return <DPVisualizer step={step} />;
    if (state?.treeNodes) return <RecursionVisualizer step={step} />;
    if (type === "linked_list") return <LinkedListVisualizer step={step} allSteps={steps} currentStepIndex={currentStepIndex} />;
    switch (type) {
      case "array": case "sliding_window": case "queue": return <ArrayVisualizer step={step} />;
      case "graph": return <GraphVisualizer step={step} />;
      case "recursion": case "backtracking": return <RecursionVisualizer step={step} />;
      case "tree": case "binary_tree": case "bst": return <TreeVisualizer step={step} />;
      case "matrix": return <MatrixVisualizer step={step} />;
      default: return <ArrayVisualizer step={step} />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStepIndex}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.25 }}
        className="w-full flex flex-col items-center justify-center gap-4"
      >
        {renderVisualizer()}
        <p className="text-xs text-white/50 text-center px-2 leading-snug min-h-[2rem]">
          {step.description}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
