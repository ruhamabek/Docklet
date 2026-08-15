import { useState, useEffect } from "react";
import { StreamContainerResponse, StopContainerStats } from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
 import { Button } from "@/components/ui/button";

interface StatsModalProps {
  container: ContainerItem | null;
  onClose: () => void;
}

export function StatsModal({ container, onClose }: StatsModalProps) {
  const [liveStats, setLiveStats] = useState<ContainerStatsData | null>(null);

  useEffect(() => {
    if (!container) return;

    setLiveStats(null);
    StreamContainerResponse(container.id).catch((err) => alert("Failed to stream stats: " + err));

    const unsub = EventsOn("container-stats-update", (data: ContainerStatsData) => {
      setLiveStats(data);
    });

    return () => {
      StopContainerStats();
      unsub();
    };
  }, [container]);

  if (!container) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl p-6 flex flex-col gap-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              Live Performance Metrics
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Container: {container.name} ({container.id})
            </p>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose}>✖</Button>
        </div>

        {!liveStats ? (
          <div className="p-8 text-center text-slate-400 italic">Connecting to metrics stream...</div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* CPU */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">⚡ CPU Usage</span>
                <span className="font-mono text-lg font-bold text-blue-400">{liveStats.cpuPercent.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    liveStats.cpuPercent > 80 ? 'bg-red-500' : liveStats.cpuPercent > 50 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(liveStats.cpuPercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Memory */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-300">💾 Memory (RAM)</span>
                <span className="font-mono text-lg font-bold text-purple-400">{liveStats.memoryPercent.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all duration-500"
                  style={{ width: `${Math.min(liveStats.memoryPercent, 100)}%` }}
                />
              </div>
              <div className="text-right font-mono text-xs text-slate-400">{liveStats.memoryHuman}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end border-t border-slate-800 pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}