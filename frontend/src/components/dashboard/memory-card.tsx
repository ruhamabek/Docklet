import React, { useState, useEffect } from "react";
import { GetAggregateMetrics } from "@wailsjs/go/main/App";

interface MemoryCardProps {
  totalMemoryGB?: number;
  runningContainersCount: number;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  totalMemoryGB = 16,
  runningContainersCount,
}) => {
  const [realUsedMB, setRealUsedMB] = useState(0);

  useEffect(() => {
    if (runningContainersCount === 0) {
      setRealUsedMB(0);
      return;
    }

    // 🌟 Fetch real exact aggregate memory usage from Docker!
    function fetchRealMemory() {
      GetAggregateMetrics()
        .then((m) => {
          if (m) {
            setRealUsedMB(m.totalMemoryMB || 0);
          }
        })
        .catch((err) => console.error("Failed to fetch aggregate memory:", err));
    }

    fetchRealMemory();
    const interval = setInterval(fetchRealMemory, 1500); // 1.5s sync with CPU

    return () => clearInterval(interval);
  }, [runningContainersCount]);

  const memoryPercent =
    runningContainersCount === 0
      ? "0.0"
      : ((realUsedMB / (totalMemoryGB * 1024)) * 100).toFixed(1);

  return (
    <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-colors rounded-xs">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Memory Usage
        </h3>
        <span className="text-[11px] text-primary font-bold">{memoryPercent}%</span>
      </div>

      <div className="my-3">
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {runningContainersCount === 0 ? "0.00 MB" : `${realUsedMB.toFixed(1)} MB`}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            / {totalMemoryGB.toFixed(1)} GB
          </span>
        </div>
        <div className="w-full h-2 bg-background border border-border rounded-full overflow-hidden mt-3">
          <div
            className="bg-primary h-full transition-all duration-500 rounded-full shadow-[0_0_8px_var(--primary)]"
            style={{ width: `${Math.min(100, Number(memoryPercent))}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border flex justify-between text-[10px] text-muted-foreground">
        <span>Containers: <strong className="text-foreground">{runningContainersCount} running</strong></span>
        <span className="text-muted-foreground">Host: {totalMemoryGB.toFixed(1)} GB</span>
      </div>
    </div>
  );
};