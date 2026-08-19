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

export const StatsModal: React.FC<StatsModalProps> = ({ container, onClose }) => {
  const [currentStats, setCurrentStats] = useState<ContainerStatsData | null>(null);
  const [activeMetric, setActiveMetric] = useState<"cpu" | "memory">("cpu");

  const latestSampleRef = useRef<{ cpu: number; memoryMB: number }>({ cpu: 0, memoryMB: 0 });

  // Rolling 24-sample history buffer
  const [history, setHistory] = useState<HistorySample[]>(() =>
    Array.from({ length: 24 }, (_, i) => ({
      timeLabel: `${24 - i}s`,
      cpu: 0,
      memoryMB: 0,
    }))
  );

  useEffect(() => {
    if (!container) return;

    latestSampleRef.current = { cpu: 0, memoryMB: 0 };
    setCurrentStats(null);
    setHistory(
      Array.from({ length: 24 }, (_, i) => ({
        timeLabel: `${24 - i}s`,
        cpu: 0,
        memoryMB: 0,
      }))
    );

    // 🌟 1. Register Event Listener FIRST (Handles both camelCase & snake_case)
      // 🌟 Listen to the exact event name from your Go code: "container-stats-update"
    const unsub = EventsOn("container-stats-update", (raw: any) => {
      if (!raw) return;

      const cpu = raw.cpuPercent ?? raw.CPUPercent ?? 0;
      const memMB = raw.memoryUsageMB ?? raw.MemoryUsageMB ?? 0;
      const memLimit = raw.memoryLimitMB ?? raw.MemoryLimitMB ?? 16384;
      const memPct = raw.memoryPercent ?? raw.MemoryPercent ?? 0;
      const memHuman = raw.memoryHuman ?? raw.MemoryHuman ?? `${Number(memMB).toFixed(1)} MB`;

      const parsed: ContainerStatsData = {
        containerId: raw.containerId || raw.ContainerID || container.id,
        cpuPercent: Number(cpu),
        memoryUsageMB: Number(memMB),
        memoryLimitMB: Number(memLimit),
        memoryPercent: Number(memPct),
        memoryHuman: memHuman,
      };

      setCurrentStats(parsed);
      latestSampleRef.current = {
        cpu: Number(parsed.cpuPercent.toFixed(2)),
        memoryMB: Number(parsed.memoryUsageMB.toFixed(1)),
      };
    });

    // 🌟 Start your stream function
    StreamContainerResponse(container.id).catch((err) =>
      console.error("Stream error:", err)
    );

    // 🌟 2. Start streaming socket in Go
    StreamContainerResponse(container.id).catch((err) =>
      console.error("Stream error:", err)
    );

    // 🌟 3. Smooth 1-Second Sliding Timeline Clock (Ensures 24 bars shift live)
    const ticker = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getMinutes().toString().padStart(2, "0")}:${now
        .getSeconds()
        .toString()
        .padStart(2, "0")}`;

      setHistory((prev) => [
        ...prev.slice(1),
        {
          timeLabel: timeStr,
          cpu: latestSampleRef.current.cpu,
          memoryMB: latestSampleRef.current.memoryMB,
        },
      ]);
    }, 1000);

    return () => {
      clearInterval(ticker);
      StopContainerStats();
      unsub();
    };
  }, [container]);

  // Calculations for [●] Current, [⬆] Peak, [Σ] Average
  const values = useMemo(
    () => history.map((h) => (activeMetric === "cpu" ? h.cpu : h.memoryMB)),
    [history, activeMetric]
  );

  const currentVal = values[values.length - 1] || 0;
  const peakVal = Math.max(...values, 0.1);
  const avgVal = Number(
    (values.reduce((sum, v) => sum + v, 0) / (values.length || 1)).toFixed(2)
  );

  if (!container) return null;

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
            {/* Metric Mode Switcher */}
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

        {/* 🌟 Top Stat Counters (EvilCharts Style) */}
        <div className="flex flex-row justify-between items-center bg-background border border-border p-4 rounded-xs">
          <div className="flex flex-row items-center gap-6">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                [●] Current {activeMetric === "cpu" ? "Load" : "Memory"}
              </span>
              <span className="text-primary font-mono text-2xl font-bold tracking-tight">
                {activeMetric === "cpu" ? `${currentVal.toFixed(2)}%` : `${currentVal.toFixed(1)} MB`}
              </span>
            </div>

            <div className="h-8 border-l border-dashed border-border" />

            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                [⬆] Peak
              </span>
              <span className="text-foreground font-mono text-2xl font-bold tracking-tight">
                {activeMetric === "cpu" ? `${peakVal.toFixed(2)}%` : `${peakVal.toFixed(1)} MB`}
              </span>
            </div>

            <div className="h-8 border-l border-dashed border-border" />

            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                [Σ] Average
              </span>
              <span className="text-muted-foreground font-mono text-2xl font-bold tracking-tight">
                {activeMetric === "cpu" ? `${avgVal.toFixed(2)}%` : `${avgVal.toFixed(1)} MB`}
              </span>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-muted-foreground block">
              // SAMPLING: <strong className="text-primary">1000ms</strong>
            </span>
            <span className="text-[10px] text-muted-foreground block">
              // MODE: <strong className="text-primary">SEGMENTED MATRIX</strong>
            </span>
          </div>
        </div>

        {/* 🌟 Segmented Block Matrix (24 Discrete Rolling Columns) */}
        <div className="bg-background border border-border p-4 rounded-xs flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground pb-2 border-b border-dashed border-border">
            <span>HISTORICAL 24-SECOND REAL-TIME BUFFER</span>
            <span className="text-primary font-bold">STREAMING ACTIVE ⚡</span>
          </div>

          {/* 24 Vertical Block Columns */}
          <div className="h-44 w-full flex items-end gap-1.5 pt-4">
            {history.map((h, colIdx) => {
              const val = activeMetric === "cpu" ? h.cpu : h.memoryMB;
              
              // Dynamic scale (if CPU is 0.2%, scale to 1.5% so blocks light up)
              const maxScale = Math.max(peakVal * 1.3, activeMetric === "cpu" ? 1.5 : 30);
              const heightPct = Math.min(100, Math.max(8, (val / maxScale) * 100));

              const totalBlocks = 10;
              const activeBlocks = Math.ceil((heightPct / 100) * totalBlocks);

              return (
                <div
                  key={colIdx}
                  className="flex-1 flex flex-col justify-end gap-1 h-full group relative cursor-pointer"
                >
                  {/* Hover Tooltip */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-popover border border-border text-[9px] text-primary px-1.5 py-0.5 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 font-bold">
                    {val} {activeMetric === "cpu" ? "%" : "MB"}
                  </div>

                  {/* 10 Vertical Segmented Blocks */}
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

                  {/* X-axis tick */}
                  <span className="text-[8px] text-muted-foreground text-center truncate block mt-1">
                    {colIdx % 4 === 0 ? h.timeLabel : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 text-[11px] text-muted-foreground">
          <span>
            {currentStats
              ? `Memory Usage: ${currentStats.memoryUsageMB.toFixed(1)} MB / ${(currentStats.memoryLimitMB / 1024).toFixed(1)} GB (${currentStats.memoryPercent.toFixed(1)}%)`
              : "Connected to container socket."}
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-secondary border border-border hover:border-primary text-foreground hover:text-primary text-xs font-bold transition-colors rounded-xs"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};