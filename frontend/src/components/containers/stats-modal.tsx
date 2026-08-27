"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { StreamContainerResponse, StopContainerStats } from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
import { X, Cpu, HardDrive } from "lucide-react";

interface StatsModalProps {
  container: ContainerItem | null;
  onClose: () => void;
}

interface HistorySample {
  timeLabel: string;
  cpu: number;
  memoryMB: number;
}

interface ContainerStatsState {
  history: HistorySample[];
  currentStats: ContainerStatsData | null;
  latestSample: { cpu: number; memoryMB: number };
}

const statsCache = new Map<string, ContainerStatsState>();

const createInitialHistory = (): HistorySample[] =>
  Array.from({ length: 24 }, (_, i) => ({
    timeLabel: `${24 - i}s`,
    cpu: 0,
    memoryMB: 0,
  }));

export const StatsModal: React.FC<StatsModalProps> = ({ container, onClose }) => {
  const containerId = container?.id;

  const [currentStats, setCurrentStats] = useState<ContainerStatsData | null>(() => {
    if (!containerId) return null;
    return statsCache.get(containerId)?.currentStats || null;
  });
  const [activeMetric, setActiveMetric] = useState<"cpu" | "memory">("cpu");

  const latestSampleRef = useRef<{ cpu: number; memoryMB: number }>({ cpu: 0, memoryMB: 0 });

  const [history, setHistory] = useState<HistorySample[]>(() => {
    if (!containerId) return createInitialHistory();
    return statsCache.get(containerId)?.history || createInitialHistory();
  });

  useEffect(() => {
    if (!container) return;

    const id = container.id;
    const cached = statsCache.get(id);

    if (cached) {
      latestSampleRef.current = { ...cached.latestSample };
      setCurrentStats(cached.currentStats);
      setHistory(cached.history);
    } else {
      const initialHistory = createInitialHistory();
      latestSampleRef.current = { cpu: 0, memoryMB: 0 };
      setCurrentStats(null);
      setHistory(initialHistory);
      statsCache.set(id, {
        history: initialHistory,
        currentStats: null,
        latestSample: { cpu: 0, memoryMB: 0 },
      });
    }

    const unsub = EventsOn("container-stats-update", (raw: RawContainerStatsEvent) => {
      if (!raw) return;

      const eventContainerId = raw.containerId || raw.ContainerID || "";
      if (eventContainerId && !id.startsWith(eventContainerId) && !eventContainerId.startsWith(id)) {
        return;
      }

      const cpu = raw.cpuPercent ?? raw.CPUPercent ?? 0;
      const memMB = raw.memoryUsageMB ?? raw.MemoryUsageMB ?? 0;
      const memLimit = raw.memoryLimitMB ?? raw.MemoryLimitMB ?? 16384;
      const memPct = raw.memoryPercent ?? raw.MemoryPercent ?? 0;
      const memHuman = raw.memoryHuman ?? raw.MemoryHuman ?? `${Number(memMB).toFixed(1)} MB`;

      const parsed: ContainerStatsData = {
        containerId: id,
        cpuPercent: Number(cpu),
        memoryUsageMB: Number(memMB),
        memoryLimitMB: Number(memLimit),
        memoryPercent: Number(memPct),
        memoryHuman: memHuman,
      };

      setCurrentStats(parsed);
      const newSample = {
        cpu: Number(parsed.cpuPercent.toFixed(2)),
        memoryMB: Number(parsed.memoryUsageMB.toFixed(2)),
      };
      latestSampleRef.current = newSample;

      const currentEntry = statsCache.get(id);
      if (currentEntry) {
        currentEntry.currentStats = parsed;
        currentEntry.latestSample = newSample;
      }
    });

    StreamContainerResponse(id).catch((err) =>
      console.error("Stream error:", err)
    );

    const ticker = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getMinutes().toString().padStart(2, "0")}:${now
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      setHistory((prev) => {
        const next = [
          ...prev.slice(1),
          {
            timeLabel: timeStr,
            cpu: latestSampleRef.current.cpu,
            memoryMB: latestSampleRef.current.memoryMB,
          },
        ];
        const entry = statsCache.get(id);
        if (entry) {
          entry.history = next;
          entry.latestSample = latestSampleRef.current;
        } else {
          statsCache.set(id, {
            history: next,
            currentStats: null,
            latestSample: latestSampleRef.current,
          });
        }
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(ticker);
      StopContainerStats();
      unsub();
    };
  }, [container]);

  const values = useMemo(
    () => history.map((h) => (activeMetric === "cpu" ? h.cpu : h.memoryMB)),
    [history, activeMetric]
  );

  const currentVal = values[values.length - 1] || 0;
  const peakVal = Math.max(...values, 0.1);
  const avgVal = useMemo(() => {
    const recordedSamples = history.filter((h) => h.timeLabel.includes(":"));
    const samplesToAvg = recordedSamples.length > 0 ? recordedSamples : history;
    const metricVals = samplesToAvg.map((h) => (activeMetric === "cpu" ? h.cpu : h.memoryMB));
    const sum = metricVals.reduce((acc, v) => acc + v, 0);
    return Number((sum / (metricVals.length || 1)).toFixed(2));
  }, [history, activeMetric]);

  if (!container) return null;

  const maxScale = activeMetric === "cpu"
    ? Math.max(peakVal * 1.25, 1.5)
    : Math.max(peakVal * 1.2, 2.0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono select-none">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xs p-6 shadow-2xl flex flex-col gap-5 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Titlebar */}
        <div className="flex justify-between items-start border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
              <h2 className="text-base font-bold text-foreground uppercase tracking-wider">
                Live Performance Metrics
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Container: <span className="text-primary font-bold">{container.name}</span>{" "}
              <span className="text-[10px] text-muted-foreground">({container.id.slice(0, 12)})</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
             <div className="flex bg-background border border-border p-0.5 rounded-xs">
              <button
                onClick={() => setActiveMetric("cpu")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xs transition-colors ${
                  activeMetric === "cpu"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>CPU</span>
              </button>

              <button
                onClick={() => setActiveMetric("memory")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xs transition-colors ${
                  activeMetric === "memory"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>RAM</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xs transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

         <div className="flex flex-row justify-between items-center bg-background border border-border p-4 rounded-xs">
          <div className="flex flex-row items-center gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                [●] Current {activeMetric === "cpu" ? "Load" : "Memory"}
              </span>
              <span className="text-primary font-mono text-2xl font-bold tracking-tight">
                {activeMetric === "cpu" ? `${currentVal.toFixed(2)}%` : `${currentVal.toFixed(2)} MB`}
              </span>
            </div>

            <div className="h-8 border-l border-dashed border-border" />

            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                Peak
              </span>
              <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {activeMetric === "cpu" ? `${peakVal.toFixed(2)}%` : `${peakVal.toFixed(2)} MB`}
              </span>
            </div>

            <div className="h-8 border-l border-dashed border-border" />

            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                [Σ] Average
              </span>
              <span className="text-muted-foreground font-mono text-2xl font-bold tracking-tight">
                {activeMetric === "cpu" ? `${avgVal.toFixed(2)}%` : `${avgVal.toFixed(2)} MB`}
              </span>
            </div>
          </div>

        </div>

         <div className="bg-background border border-border p-4 rounded-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground pb-2 border-b border-dashed border-border">
            <span>HISTORICAL 24-SECOND REAL-TIME BUFFER</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-primary font-bold">STREAMING ACTIVE</span>
            </div>
          </div>

           <div className="h-44 w-full flex items-end gap-1.5 pt-4">
            {history.map((h, colIdx) => {
              const val = activeMetric === "cpu" ? h.cpu : h.memoryMB;
              
              const heightPct = Math.min(100, Math.max(val > 0 ? 8 : 0, (val / maxScale) * 100));

              const totalBlocks = 10;
              const activeBlocks = val > 0 ? Math.ceil((heightPct / 100) * totalBlocks) : 0;

              return (
                <div
                  key={colIdx}
                  className="flex-1 flex flex-col justify-end gap-1 h-full group relative cursor-pointer"
                >
                   <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border border-border text-[9px] text-primary px-1.5 py-0.5 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold shadow-sm">
                    {activeMetric === "cpu" ? `${val.toFixed(2)}%` : `${val.toFixed(2)} MB`}
                  </div>

                   {Array.from({ length: totalBlocks }).map((_, blockIdx) => {
                    const blockNumber = totalBlocks - blockIdx;
                    const isActive = blockNumber <= activeBlocks && val > 0;

                    return (
                      <div
                        key={blockIdx}
                        className={`w-full h-2.5 rounded-xs transition-all duration-200 ${
                          isActive
                            ? colIdx === history.length - 1
                              ? "bg-primary shadow-[0_0_6px_var(--primary)]"
                              : "bg-primary/80 group-hover:bg-primary"
                            : "bg-muted/40"
                        }`}
                      />
                    );
                  })}

                   <span className="text-[8px] text-muted-foreground text-center truncate block mt-1">
                    {colIdx % 4 === 0 ? h.timeLabel : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

         <div className="flex justify-between items-center pt-2 text-[11px] text-muted-foreground">
          <span>
            {currentStats
              ? `Memory Usage: ${currentStats.memoryUsageMB.toFixed(2)} MB / ${(currentStats.memoryLimitMB / 1024).toFixed(1)} GB (${currentStats.memoryPercent.toFixed(1)}%)`
              : "Connected to container socket."}
          </span>

        </div>

      </div>
    </div>
  );
};