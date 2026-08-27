import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#232738] bg-[#090a0f] py-8 px-6 text-center text-xs text-[#7b849b]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#00ff66]">DOCKLET</span>
          <span>- Released under the MIT License</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/ruhamabek/Docklet"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00ff66] transition-colors"
          >
            GitHub Repository
          </a>
          <a
            href="https://github.com/ruhamabek/Docklet/releases"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#00ff66] transition-colors"
          >
            Releases & Downloads
          </a>
        </div>
      </div>
    </footer>
  );
};
