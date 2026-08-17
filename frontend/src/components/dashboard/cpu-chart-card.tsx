import React, { useState, useEffect, useRef } from "react";
import { Cpu } from "lucide-react";
import { LiveLineChart, LiveLinePoint } from "@/components/ui/live-line-chart";
import { GetAggregateMetrics } from "@wailsjs/go/main/App";

interface CpuChartCardProps {
  ncpu?: number;
  runningContainersCount: number;
}

export const CpuChartCard: React.FC<CpuChartCardProps> = ({
  ncpu = 8,
  runningContainersCount,
}) => {
  const [chartData, setChartData] = useState<LiveLinePoint[]>(() => {
    const initialTime = Date.now() / 1000;
    return Array.from({ length: 30 }, (_, i) => ({
      time: initialTime - (30 - i),
      value: 0,
    }));
  });

  const [currentCpu, setCurrentCpu] = useState(0);
  const latestCpuRef = useRef(0);

   useEffect(() => {
    if (runningContainersCount === 0) {
      latestCpuRef.current = 0;
      setCurrentCpu(0);
      return;
    }

    const fetchMetrics = () => {
      GetAggregateMetrics()
        .then((m) => {
          if (m) {
            const rawVal = m.totalCpuPercent;
             if (rawVal > 0) {
              const smoothed = Number(rawVal.toFixed(2));
              latestCpuRef.current = smoothed;
              setCurrentCpu(smoothed);
            }
          }
        })
        .catch(() => {});
    };

    fetchMetrics();
    const metricsInterval = setInterval(fetchMetrics, 1200);
    return () => clearInterval(metricsInterval);
  }, [runningContainersCount]);

   useEffect(() => {
    const slideInterval = setInterval(() => {
      const nowSeconds = Date.now() / 1000;
      const val = runningContainersCount === 0 ? 0 : latestCpuRef.current;

      setChartData((prev) => {
        const nextPoint = { time: nowSeconds, value: val };
        return [...prev.slice(-45), nextPoint];
      });
    }, 1000);

    return () => clearInterval(slideInterval);
  }, [runningContainersCount]);

  return (
    <div className="md:col-span-2 bg-card border border-border p-5 flex flex-col justify-between relative overflow-hidden group hover:border-primary/40 transition-colors rounded-xs">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-primary" />
            Aggregate CPU Load
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Host {ncpu} Cores • {runningContainersCount} active container{runningContainersCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-primary tracking-tight font-mono">
            {currentCpu.toFixed(2)}%
          </span>
          <span className="block text-[10px] text-muted-foreground">
            {runningContainersCount === 0 ? "Idle (0 active)" : "Live kernel delta"}
          </span>
        </div>
      </div>

      <div className="w-full mt-2 pt-2 border-t border-border">
        <LiveLineChart data={chartData} value={currentCpu} window={30} height={90} />
      </div>
    </div>
  );
};