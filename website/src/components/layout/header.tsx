import React from "react";
import { Github, Download } from "lucide-react";

interface HeaderProps {
  releaseTag?: string;
}

export const Header: React.FC<HeaderProps> = ({ releaseTag = "v0.0.1" }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232738] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#00ff66] rounded-xs flex items-center justify-center shadow-[0_0_12px_rgba(0,255,102,0.4)]">
            <div className="w-4 h-4 bg-[#090a0f]"></div>
          </div>
          <span className="font-bold tracking-wider text-base text-[#00ff66]">
            DOCKLET
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-xs bg-[#161926] border border-[#232738] text-[#7b849b] hidden sm:inline-block">
            {releaseTag}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/ruhamabek/Docklet"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xs text-xs border border-[#232738] bg-[#161926] text-[#e1e7ec] hover:border-[#00ff66] hover:text-[#00ff66] transition-all"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
          <a
            href="#download"
            className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-xs text-xs font-bold bg-[#00ff66] text-black hover:brightness-110 shadow-[0_0_15px_rgba(0,255,102,0.25)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Get Docklet</span>
          </a>
        </div>
      </div>
    </header>
  );
};
