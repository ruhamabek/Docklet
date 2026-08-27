"use client";

import React, { useState, useEffect } from "react";
import { Download, ChevronDown } from "lucide-react";

const downloadLinks = {
  linux: "https://github.com/ruhamabek/Docklet/releases/latest/download/Docklet-Linux-x86_64",
  mac: "https://github.com/ruhamabek/Docklet/releases/latest/download/Docklet-macOS-Universal.zip",
  windows: "https://github.com/ruhamabek/Docklet/releases/latest/download/Docklet-Windows-x64.zip",
};

export const HeroDownload: React.FC = () => {
  const [detectedOS, setDetectedOS] = useState<"mac" | "windows" | "linux">("linux");
  const [showOtherDownloads, setShowOtherDownloads] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes("mac")) {
        setDetectedOS("mac");
      } else if (userAgent.includes("win")) {
        setDetectedOS("windows");
      } else {
        setDetectedOS("linux");
      }
    }
  }, []);

  const primaryDownload = {
    linux: {
      label: "Download for Linux",
      subtext: "Universal x86_64 Binary (Ubuntu, Debian, Fedora, Arch)",
      url: downloadLinks.linux,
    },
    mac: {
      label: "Download for macOS",
      subtext: "Universal Binary (Intel & Apple Silicon M1/M2/M3/M4)",
      url: downloadLinks.mac,
    },
    windows: {
      label: "Download for Windows",
      subtext: "64-bit Executable (.zip)",
      url: downloadLinks.windows,
    },
  }[detectedOS];

  return (
    <div id="download" className="mt-10 flex flex-col items-center gap-4 w-full max-w-md">
      <a
        href={primaryDownload.url}
        className="w-full py-4 px-6 rounded-xs bg-[#00ff66] text-black font-bold text-base flex items-center justify-center gap-3 hover:brightness-110 shadow-[0_0_25px_rgba(0,255,102,0.3)] transition-all"
      >
        <Download className="w-5 h-5" />
        <span>{primaryDownload.label}</span>
      </a>
      <p className="text-xs text-[#7b849b]">{primaryDownload.subtext}</p>

       <div className="relative w-full mt-2">
        <button
          onClick={() => setShowOtherDownloads(!showOtherDownloads)}
          className="text-xs text-[#7b849b] hover:text-[#00ff66] flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          <span>Other platforms (macOS, Windows, Linux)</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              showOtherDownloads ? "rotate-180" : ""
            }`}
          />
        </button>

        {showOtherDownloads && (
          <div className="mt-3 p-3 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-2 text-left text-xs animate-in fade-in zoom-in-95 duration-150">
            <a
              href={downloadLinks.linux}
              className="p-2.5 rounded-xs hover:bg-[#161926] hover:text-[#00ff66] flex justify-between items-center transition-colors"
            >
              <span>Linux (Universal x86_64)</span>
              <span className="text-[#7b849b] text-[10px]">Executable</span>
            </a>
            <a
              href={downloadLinks.mac}
              className="p-2.5 rounded-xs hover:bg-[#161926] hover:text-[#00ff66] flex justify-between items-center transition-colors"
            >
              <span>macOS (Universal Binary)</span>
              <span className="text-[#7b849b] text-[10px]">.zip (.app)</span>
            </a>
            <a
              href={downloadLinks.windows}
              className="p-2.5 rounded-xs hover:bg-[#161926] hover:text-[#00ff66] flex justify-between items-center transition-colors"
            >
              <span>Windows (x64)</span>
              <span className="text-[#7b849b] text-[10px]">.zip (.exe)</span>
            </a>
          </div>
        )}
      </div>

       <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#7b849b]">

        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]"></span>
          <span>~30MB RAM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66]"></span>
          <span>MIT License</span>
        </div>
      </div>
    </div>
  );
};
