"use client";

import React, { useMemo } from "react";

export interface LiveLinePoint {
  time: number;
  value: number;
}

interface LiveLineChartProps {
  data: LiveLinePoint[];
  value: number;
  window?: number;
  height?: number;
  className?: string;
  stroke?: string;
  fill?: boolean;
}

export const LiveLineChart: React.FC<LiveLineChartProps> = ({
  data,
  value,
  window: timeWindow = 30,
  height = 90,
  className = "",
  fill = true,
}) => {
  const now = useMemo(() => {
    return data.length > 0 ? data[data.length - 1].time : Date.now() / 1000;
  }, [data]);

  const minTime = now - timeWindow;
  const maxTime = now;

  const visibleData = useMemo(() => {
    const filtered = data.filter((d) => d.time >= minTime - 2);
    if (filtered.length === 0) {
      return [
        { time: minTime, value: 0 },
        { time: maxTime, value: 0 },
      ];
    }
    return filtered;
  }, [data, minTime, maxTime]);
 
  const maxValue = useMemo(() => {
    const maxInWindow = Math.max(...visibleData.map((d) => d.value), value, 0.5);
    if (maxInWindow <= 2) return 2.5;
    if (maxInWindow <= 5) return 6;
    if (maxInWindow <= 10) return 12;
    if (maxInWindow <= 25) return 30;
    if (maxInWindow <= 50) return 60;
    return 100;
  }, [visibleData, value]);

  const minValue = 0;
  const width = 600;
  const paddingBottom = 12;
  const paddingTop = 8;
  const innerHeight = height - paddingBottom - paddingTop;

  const pointsString = useMemo(() => {
    return visibleData
      .map((d) => {
        const x = ((d.time - minTime) / (maxTime - minTime)) * width;
        const normalizedY = Math.min(1, Math.max(0, (d.value - minValue) / (maxValue - minValue || 1)));
        const y = height - paddingBottom - normalizedY * innerHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [visibleData, minTime, maxTime, height, innerHeight, paddingBottom, maxValue]);

  const areaPath = useMemo(() => {
    if (visibleData.length === 0) return "";
    const firstX = ((visibleData[0].time - minTime) / (maxTime - minTime)) * width;
    const lastX = ((visibleData[visibleData.length - 1].time - minTime) / (maxTime - minTime)) * width;
    const bottomY = height - paddingBottom;
    return `M ${firstX},${bottomY} L ${pointsString.split(" ").map((p) => p).join(" L ")} L ${lastX},${bottomY} Z`;
  }, [visibleData, pointsString, minTime, maxTime, height, paddingBottom]);

  const currentHead = useMemo(() => {
    const normalizedY = Math.min(1, Math.max(0, (value - minValue) / (maxValue - minValue || 1)));
    const y = height - paddingBottom - normalizedY * innerHeight;
    return { x: width, y };
  }, [value, height, innerHeight, paddingBottom, maxValue]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00FF41" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00FF41" stopOpacity="0.0" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

         <line x1="0" y1={paddingTop} x2={width} y2={paddingTop} stroke="#1A1A1A" strokeDasharray="3 3" />
        <line x1="0" y1={paddingTop + innerHeight / 2} x2={width} y2={paddingTop + innerHeight / 2} stroke="#1A1A1A" strokeDasharray="3 3" />
        <line x1="0" y1={height - paddingBottom} x2={width} y2={height - paddingBottom} stroke="#222222" />

         {fill && areaPath && (
          <path d={areaPath} fill="url(#neonGradient)" className="transition-all duration-300" />
        )}

         <polyline
          fill="none"
          stroke="#00FF41"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
          points={pointsString}
        />

         <circle cx={currentHead.x} cy={currentHead.y} r="5" fill="#00FF41" className="animate-ping opacity-75" />
        <circle cx={currentHead.x} cy={currentHead.y} r="3.5" fill="#00FF41" stroke="#050505" strokeWidth="1" />
      </svg>

       <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mt-1">
        <span>-{timeWindow}s</span>
        <span className="text-zinc-600 font-bold">Scale: 0% – {maxValue}%</span>
        <span className="text-[#00FF41] font-bold">NOW</span>
      </div>
    </div>
  );
};