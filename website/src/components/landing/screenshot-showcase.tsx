"use client";

import React, { useState } from "react";
import Image from "next/image";

export const ScreenshotShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "metrics" | "run">("dashboard");

  return (
    <section className="py-12 px-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col gap-4">
         <div className="flex items-center justify-center gap-2 border-b border-[#232738] pb-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-xs font-bold rounded-xs transition-all ${
              activeTab === "dashboard"
                ? "bg-[#00ff66] text-black shadow-xs"
                : "text-[#7b849b] hover:text-white hover:bg-[#161926]"
            }`}
          >
            Main Dashboard
          </button>
          <button
            onClick={() => setActiveTab("metrics")}
            className={`px-4 py-2 text-xs font-bold rounded-xs transition-all ${
              activeTab === "metrics"
                ? "bg-[#00ff66] text-black shadow-xs"
                : "text-[#7b849b] hover:text-white hover:bg-[#161926]"
            }`}
          >
            Real-Time Metrics
          </button>
          <button
            onClick={() => setActiveTab("run")}
            className={`px-4 py-2 text-xs font-bold rounded-xs transition-all ${
              activeTab === "run"
                ? "bg-[#00ff66] text-black shadow-xs"
                : "text-[#7b849b] hover:text-white hover:bg-[#161926]"
            }`}
          >
            Validated Launcher
          </button>
        </div>

        {/* Screenshot Display */}
        <div className="relative rounded-xs border border-[#232738] bg-[#0f111a] p-2 shadow-2xl overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#232738]/60 text-[10px] text-[#7b849b]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3366]/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff66]/80"></span>
            <span className="ml-2 font-mono text-[#7b849b]">
              {activeTab === "dashboard"
                ? "docklet://dashboard"
                : activeTab === "metrics"
                ? "docklet://containers/metrics-viewer"
                : "docklet://images/run-container"}
            </span>
          </div>

          <div className="relative w-full aspect-[16/10] bg-black">
            {activeTab === "dashboard" && (
              <Image
                src="/screenshots/dashboard.png"
                alt="Docklet Dashboard Preview"
                fill
                className="object-cover"
                priority
              />
            )}
            {activeTab === "metrics" && (
              <Image
                src="/screenshots/metrics.png"
                alt="Docklet Container Performance Metrics"
                fill
                className="object-cover"
                priority
              />
            )}
            {activeTab === "run" && (
              <Image
                src="/screenshots/run-container.png"
                alt="Docklet Launch Container Form"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
