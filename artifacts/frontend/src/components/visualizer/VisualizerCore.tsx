import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, FastForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
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
import { StepExplanation } from "./StepExplanation";

interface VisualizerCoreProps {
  steps: VisualizationStep[];
  title?: string;
}

function getPreferredVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));

  const priority = [
    "google us english",
    "samantha",
    "zira",
    "victoria",
    "karen",
    "moira",
    "fiona",
    "tessa",
    "veena",
    "anna",
    "susan",
    "lisa",
    "natural",
    "female",
  ];

  for (const keyword of priority) {
    const match = englishVoices.find((v) => v.name.toLowerCase().includes(keyword));
    if (match) return match;
  }

  return englishVoices[0] ?? voices[0] ?? null;
}

function humanizeText(raw: string): string {
  let text = raw;

  // Clean symbols → readable words
  text = text
    .replace(/\[(\w+)\]/g, " $1 ")
    .replace(/(\w+)\[(\w+)\]/g, "$1 $2")
    .replace(/\+/g, " plus ")
    .replace(/\-(?=\s)/g, " minus ")
    .replace(/\*/g, " times ")
    .replace(/==/g, " equals ")
    .replace(/!=/g, " not equals ")
    .replace(/<=|>=/g, (m) => (m === "<=" ? " less than or equal to " : " greater than or equal to "))
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/=/g, " is ")
    .replace(/\{|\}/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  // Add conversational lead-in if sentence doesn't already start with one
  const leadIns = ["Now,", "Next,", "Here,", "So,", "Then,"];
  const hasLeadIn = leadIns.some((l) => text.startsWith(l.replace(",", "")));
  if (!hasLeadIn && text.length > 0) {
    const pick = leadIns[Math.floor(Math.random() * leadIns.length)];
    text = `${pick} ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
  }

  // Break run-on sentences at conjunctions → add a pause
  text = text
    .replace(/\band\b(?=\s+\w)/g, ", and")
    .replace(/\bthen\b(?=\s+\w)/g, "... then")
    .replace(/\bso\b(?=\s+\w)/g, "... so")
    .replace(/\bwhich means\b/gi, "... which means");

  // Replace standalone variable/index patterns with more readable form
  text = text.replace(/\bi\s*=\s*(\d+)/gi, "i equals $1");
  text = text.replace(/\bj\s*=\s*(\d+)/gi, "j equals $1");

  return text;
}

function speakText(text: string, onEnd: () => void): void {
  window.speechSynthesis.cancel();

  const humanized = humanizeText(text);

  const utterance = new SpeechSynthesisUtterance(humanized);
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  utterance.volume = 1;
  utterance.lang = "en-US";

  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = onEnd;
  utterance.onerror = onEnd;

  // Micro pause before speaking to feel more deliberate
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 300);
}

export function VisualizerCore({ steps, title = "Algorithm Visualization" }: VisualizerCoreProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const playRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const voiceEnabledRef = useRef(false);
  const speedRef = useRef(1);
  const stepsRef = useRef(steps);
  const currentStepIndexRef = useRef(0);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { stepsRef.current = steps; }, [steps]);
  useEffect(() => { currentStepIndexRef.current = currentStepIndex; }, [currentStepIndex]);

  const currentStep = steps[currentStepIndex];

  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const advanceStep = useCallback(() => {
    if (!isPlayingRef.current) return;

    const idx = currentStepIndexRef.current;
    const len = stepsRef.current.length;

    if (idx >= len - 1) {
      setIsPlaying(false);
      stopSpeech();
      return;
    }

    setCurrentStepIndex((prev) => prev + 1);
  }, [stopSpeech]);

  const scheduleNextStep = useCallback(() => {
    if (!isPlayingRef.current) return;

    if (voiceEnabledRef.current) {
      const description = stepsRef.current[currentStepIndexRef.current]?.description ?? "";
      setIsSpeaking(true);
      speakText(description, () => {
        setIsSpeaking(false);
        if (isPlayingRef.current) advanceStep();
      });
    } else {
      const delay = 1000 / speedRef.current;
      playRef.current = window.setTimeout(advanceStep, delay);
    }
  }, [advanceStep]);

  useEffect(() => {
    if (playRef.current) {
      window.clearTimeout(playRef.current);
      playRef.current = null;
    }

    if (isPlaying) {
      scheduleNextStep();
    } else {
      stopSpeech();
    }

    return () => {
      if (playRef.current) window.clearTimeout(playRef.current);
    };
  }, [isPlaying, currentStepIndex, scheduleNextStep, stopSpeech]);

  const handleNext = useCallback(() => {
    stopSpeech();
    if (playRef.current) window.clearTimeout(playRef.current);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps.length, stopSpeech]);

  const handlePrev = useCallback(() => {
    stopSpeech();
    if (playRef.current) window.clearTimeout(playRef.current);
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex, stopSpeech]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      stopSpeech();
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, stopSpeech]);

  const handleToggleVoice = useCallback(() => {
    stopSpeech();
    setVoiceEnabled((prev) => !prev);
  }, [stopSpeech]);

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    stopSpeech();
  }, [steps, stopSpeech]);

  if (!steps || steps.length === 0) return null;

  const isLinkedList =
    currentStep.type === "linked_list" ||
    steps.some((s) => s.type === "linked_list");

  const isTree =
    currentStep.type === "tree" ||
    currentStep.type === "binary_tree" ||
    currentStep.type === "bst" ||
    steps.some((s) => s.type === "tree" || s.type === "binary_tree" || s.type === "bst");

  const isMatrix =
    currentStep.type === "matrix" ||
    steps.some((s) => s.type === "matrix");

  const isRecursion =
    currentStep.type === "recursion" ||
    currentStep.type === "backtracking" ||
    !!(currentStep.state as any)?.treeNodes ||
    steps.some((s) => s.type === "recursion" || s.type === "backtracking" || !!(s.state as any)?.treeNodes);

  const isNQueens =
    currentStep.type === "nqueens" ||
    !!(currentStep.state as any)?.queens ||
    steps.some((s) => s.type === "nqueens" || !!(s.state as any)?.queens);

  const isStack =
    currentStep.type === "stack" ||
    steps.some((s) => s.type === "stack");

  const isDP =
    currentStep.type === "dp" ||
    steps.some((s) => s.type === "dp");

  const renderVisualizer = () => {
    const type = currentStep.type;
    const state = currentStep.state as any;

    if (type === "nqueens" || state?.queens !== undefined) {
      return <NQueensVisualizer step={currentStep} />;
    }

    if (type === "stack") {
      return <StackVisualizer step={currentStep} />;
    }

    if (type === "dp") {
      return <DPVisualizer step={currentStep} />;
    }

    if (state?.treeNodes) {
      return <RecursionVisualizer step={currentStep} />;
    }

    if (type === "linked_list") {
      return (
        <LinkedListVisualizer
          step={currentStep}
          allSteps={steps}
          currentStepIndex={currentStepIndex}
        />
      );
    }

    switch (type) {
      case "array":
      case "sliding_window":
      case "stack":
      case "queue":
        return <ArrayVisualizer step={currentStep} />;
      case "graph":
        return <GraphVisualizer step={currentStep} />;
      case "recursion":
      case "backtracking":
        return <RecursionVisualizer step={currentStep} />;
      case "tree":
      case "binary_tree":
      case "bst":
        return <TreeVisualizer step={currentStep} />;
      case "matrix":
        return <MatrixVisualizer step={currentStep} />;
      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Unsupported visualization type: {type}
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 p-6 rounded-xl glass-card border border-white/5">
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {currentStep.type.toUpperCase().replace("_", " ")}
        </Badge>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>

      <div className={`w-full flex items-center justify-center bg-black/20 rounded-lg border border-white/5 overflow-hidden relative
        ${isLinkedList ? "p-4 min-h-[360px]" : isTree || isMatrix || isRecursion || isNQueens || isStack ? "p-4 min-h-[460px]" : "p-8 min-h-[300px]"}
      `}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full flex flex-col items-center justify-center gap-8"
          >
            {renderVisualizer()}
            {!isLinkedList && !isTree && !isMatrix && !isRecursion && !isNQueens && !isStack && (
              <div className="text-center max-w-2xl">
                <p className="text-lg text-white/90">{currentStep.description}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Speaking indicator */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-3 right-3 flex items-center gap-1.5 bg-primary/20 border border-primary/30 rounded-full px-3 py-1"
          >
            <motion.div
              animate={{ scaleY: [1, 1.8, 0.6, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
              className="w-1 h-3 bg-primary rounded-full"
            />
            <motion.div
              animate={{ scaleY: [1, 0.6, 1.8, 1, 1.4] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.15 }}
              className="w-1 h-3 bg-primary rounded-full"
            />
            <motion.div
              animate={{ scaleY: [1, 1.4, 1, 1.8, 0.6] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.3 }}
              className="w-1 h-3 bg-primary rounded-full"
            />
            <span className="text-xs text-primary font-mono ml-1">Speaking</span>
          </motion.div>
        )}
      </div>

      {isLinkedList && (
        <div className="text-center px-4">
          <p className="text-sm text-white/70 italic">{currentStep.description}</p>
        </div>
      )}

      {currentStep.explanation && (
        <StepExplanation
          explanation={currentStep.explanation}
          stepIndex={currentStepIndex}
        />
      )}

      {/* Sticky controls bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sticky bottom-4 z-30 mx-auto w-full max-w-2xl"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-xl bg-[rgba(5,10,26,0.82)]">
          {/* Playback buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/8 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              onClick={handlePlayPause}
              disabled={currentStepIndex === steps.length - 1 && !isPlaying}
              className="w-11 h-11 rounded-full bg-primary hover:bg-primary/90 shadow-[0_0_18px_rgba(59,130,246,0.5)] transition-all hover:scale-110 active:scale-95 hover:shadow-[0_0_24px_rgba(59,130,246,0.7)]"
            >
              {isPlaying
                ? <Pause className="w-4 h-4 fill-current" />
                : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentStepIndex === steps.length - 1}
              className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/8 disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              <SkipForward className="w-4 h-4" />
            </Button>

            <div className="ml-1 text-xs font-mono text-white/50 bg-white/5 border border-white/8 rounded-full px-3 py-1 select-none">
              {currentStepIndex + 1} / {steps.length}
            </div>
          </div>

          {/* Right side: voice toggle + speed */}
          <div className="flex items-center gap-3">
            {/* Voice toggle */}
            <button
              onClick={handleToggleVoice}
              title={voiceEnabled ? "Disable voice narration" : "Enable voice narration"}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200
                ${voiceEnabled
                  ? "bg-primary/20 border-primary/40 text-primary shadow-[0_0_12px_rgba(59,130,246,0.35)] hover:bg-primary/30"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60"
                }
              `}
            >
              {voiceEnabled
                ? <Volume2 className="w-3.5 h-3.5" />
                : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{voiceEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            {/* Speed control */}
            <div className="flex items-center gap-2 sm:min-w-[160px]">
              <FastForward className="w-3.5 h-3.5 text-white/40 shrink-0" />
              <Slider
                value={[speed]}
                min={0.5}
                max={3}
                step={0.5}
                onValueChange={(val) => setSpeed(val[0])}
                className="flex-1"
                disabled={voiceEnabled}
              />
              <span className={`text-xs font-mono w-8 text-right shrink-0 ${voiceEnabled ? "text-white/25" : "text-white/50"}`}>{speed}x</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
