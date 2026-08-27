import React from "react";
import {
  ShieldCheck,
  Cpu,
  Terminal,
  Layers,
  Code2,
  Zap,
} from "lucide-react";

export const Features: React.FC = () => {
  return (
    <section className="py-16 px-6 max-w-6xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-center text-white mb-12">
        Engineered for Developers Who Value Speed & Privacy
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-3">
          <div className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] w-fit rounded-xs border border-[#00ff66]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">100% Zero Telemetry</h3>
          <p className="text-xs text-[#7b849b] leading-relaxed">
            No tracking, no external API beacons, and no cloud logins. Everything runs entirely locally on your Docker socket.
          </p>
        </div>

        <div className="p-6 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-3">
          <div className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] w-fit rounded-xs border border-[#00ff66]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Live Kernel CPU & RAM</h3>
          <p className="text-xs text-[#7b849b] leading-relaxed">
            Real-time delta metrics with historical 24-second visual graph buffers that persist even when modals close.
          </p>
        </div>

        <div className="p-6 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-3">
          <div className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] w-fit rounded-xs border border-[#00ff66]/20">
            <Terminal className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Live Streaming Logs</h3>
          <p className="text-xs text-[#7b849b] leading-relaxed">
            Integrated streaming bottom terminal with auto-scroll and quick stream detachment for active container troubleshooting.
          </p>
        </div>

        <div className="p-6 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-3">
          <div className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] w-fit rounded-xs border border-[#00ff66]/20">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Background Pull Manager</h3>
          <p className="text-xs text-[#7b849b] leading-relaxed">
            Pull Docker images in the background with layer-by-layer status, floating progress badges, and cancellation support.
          </p>
        </div>

        <div className="p-6 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-3">
          <div className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] w-fit rounded-xs border border-[#00ff66]/20">
            <Code2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Validated Container Launch</h3>
          <p className="text-xs text-[#7b849b] leading-relaxed">
            Zod-enforced container names, port boundaries (1-65535), and paired port mapping validations.
          </p>
        </div>

        <div className="p-6 bg-[#0f111a] border border-[#232738] rounded-xs flex flex-col gap-3">
          <div className="p-2.5 bg-[#00ff66]/10 text-[#00ff66] w-fit rounded-xs border border-[#00ff66]/20">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Ultra-Low Resource Footprint</h3>
          <p className="text-xs text-[#7b849b] leading-relaxed">
            Uses native WebKit/WebView2 via Wails v2. Consumes under 30MB of RAM compared to 1GB+ Electron alternatives.
          </p>
        </div>
      </div>
    </section>
  );
};
