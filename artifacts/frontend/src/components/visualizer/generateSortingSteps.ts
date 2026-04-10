import { VisualizationStep } from "@workspace/api-client-react";

type SortStep = VisualizationStep;

function makeStep(
  array: number[],
  highlight: number[],
  description: string,
  pointers: Record<string, number> = {},
  sorted: number[] = [],
  pass: number = 0,
): SortStep {
  return {
    type: "array",
    state: { array: [...array], pointers, sorted, pass },
    highlight,
    description,
  };
}

// ─── BUBBLE SORT ────────────────────────────────────────────────────────────
export function generateBubbleSortSteps(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];
  const n = arr.length;
  const sorted: number[] = [];

  steps.push(makeStep(arr, [], `Bubble Sort: start with [${arr.join(", ")}]`, {}, [], 0));

  for (let i = 0; i < n - 1; i++) {
    const pass = i + 1;
    for (let j = 0; j < n - i - 1; j++) {
      steps.push(makeStep(arr, [j, j + 1], `Compare ${arr[j]} and ${arr[j + 1]}`, { j, compare: j + 1 }, [...sorted], pass));
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push(makeStep(arr, [j, j + 1], `Swap → [${arr.join(", ")}]`, { swapped: j, into: j + 1 }, [...sorted], pass));
      }
    }
    sorted.unshift(n - 1 - i);
  }
  sorted.unshift(0);

  steps.push(makeStep(arr, arr.map((_, i) => i), `Sorted! [${arr.join(", ")}]`, {}, [...sorted], n - 1));
  return steps;
}

// ─── INSERTION SORT ─────────────────────────────────────────────────────────
export function generateInsertionSortSteps(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];
  const n = arr.length;

  steps.push(makeStep(arr, [0], `Insertion Sort: index 0 (${arr[0]}) is trivially sorted`, {}, [], 0));

  for (let i = 1; i < n; i++) {
    const pass = i;
    const key = arr[i];
    steps.push(makeStep(arr, [i], `Pick key = ${key} (index ${i})`, { key: i }, [], pass));
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      steps.push(makeStep(arr, [j, j + 1], `Shift ${arr[j]} right → [${arr.join(", ")}]`, { key: j + 1, shifting: j }, [], pass));
      j--;
    }
    arr[j + 1] = key;
    steps.push(makeStep(arr, [j + 1], `Insert ${key} at index ${j + 1} → [${arr.join(", ")}]`, { inserted: j + 1 }, [], pass));
  }

  steps.push(makeStep(arr, arr.map((_, i) => i), `Sorted! [${arr.join(", ")}]`, {}, [], n - 1));
  return steps;
}

// ─── MERGE SORT ─────────────────────────────────────────────────────────────
export function generateMergeSortSteps(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];
  let mergeCount = 0;

  steps.push(makeStep(arr, [], `Merge Sort: divide and conquer on [${arr.join(", ")}]`, {}, [], 0));

  function mergeSort(a: number[], left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    const leftRange = Array.from({ length: mid - left + 1 }, (_, i) => left + i);
    const rightRange = Array.from({ length: right - mid }, (_, i) => mid + 1 + i);

    steps.push(makeStep(arr, [...leftRange, ...rightRange], `Split [${arr.slice(left, right + 1).join(", ")}] → left & right halves`, { left, mid, right }, [], mergeCount));

    mergeSort(a, left, mid);
    mergeSort(a, mid + 1, right);

    mergeCount++;
    const leftArr = a.slice(left, mid + 1);
    const rightArr = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;

    while (i < leftArr.length && j < rightArr.length) {
      steps.push(makeStep(arr, [left + i, mid + 1 + j], `Merge ${mergeCount}: compare ${leftArr[i]} vs ${rightArr[j]}`, { i: left + i, j: mid + 1 + j }, [], mergeCount));
      if (leftArr[i] <= rightArr[j]) {
        a[k++] = leftArr[i++];
      } else {
        a[k++] = rightArr[j++];
      }
      const merged = Array.from({ length: k - left }, (_, x) => left + x);
      steps.push(makeStep(a, merged, `Merged so far: [${a.slice(left, k).join(", ")}]`, {}, [], mergeCount));
    }
    while (i < leftArr.length) { a[k++] = leftArr[i++]; }
    while (j < rightArr.length) { a[k++] = rightArr[j++]; }

    const mergedRange = Array.from({ length: right - left + 1 }, (_, x) => left + x);
    steps.push(makeStep(a, mergedRange, `Merged [${a.slice(left, right + 1).join(", ")}] into place`, {}, [], mergeCount));
  }

  mergeSort(arr, 0, arr.length - 1);
  steps.push(makeStep(arr, arr.map((_, i) => i), `Sorted! [${arr.join(", ")}]`, {}, [], mergeCount));
  return steps;
}

// ─── QUICK SORT ─────────────────────────────────────────────────────────────
export function generateQuickSortSteps(input: number[]): SortStep[] {
  const arr = [...input];
  const steps: SortStep[] = [];
  let partitionCount = 0;

  steps.push(makeStep(arr, [], `Quick Sort: pivot-based partitioning on [${arr.join(", ")}]`, {}, [], 0));

  function quickSort(a: number[], low: number, high: number) {
    if (low >= high) return;

    partitionCount++;
    const currentPartition = partitionCount;
    const pivotVal = a[high];
    steps.push(makeStep(a, [high], `Partition ${currentPartition}: pivot = ${pivotVal} (index ${high})`, { pivot: high }, [], currentPartition));

    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push(makeStep(a, [j, high], `Compare ${a[j]} with pivot ${pivotVal}`, { j, pivot: high, i }, [], currentPartition));
      if (a[j] <= pivotVal) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          steps.push(makeStep(a, [i, j], `Swap ${a[j]} ↔ ${a[i]} → [${a.join(", ")}]`, { swapped_i: i, swapped_j: j, pivot: high }, [], currentPartition));
        }
      }
    }
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    const pivotIdx = i + 1;
    steps.push(makeStep(a, [pivotIdx], `Pivot ${pivotVal} placed at index ${pivotIdx} → [${a.join(", ")}]`, { pivot_placed: pivotIdx }, [], currentPartition));

    quickSort(a, low, pivotIdx - 1);
    quickSort(a, pivotIdx + 1, high);
  }

  quickSort(arr, 0, arr.length - 1);
  steps.push(makeStep(arr, arr.map((_, i) => i), `Sorted! [${arr.join(", ")}]`, {}, [], partitionCount));
  return steps;
}

// ─── EXPORTS ────────────────────────────────────────────────────────────────
export const SORTING_GENERATORS: Record<string, (arr: number[]) => SortStep[]> = {
  "Bubble Sort": generateBubbleSortSteps,
  "Insertion Sort": generateInsertionSortSteps,
  "Merge Sort": generateMergeSortSteps,
  "Quick Sort": generateQuickSortSteps,
};

export const SORTING_ALGOS = Object.keys(SORTING_GENERATORS);

export function randomArray(size = 8): number[] {
  const nums = Array.from({ length: size }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}
