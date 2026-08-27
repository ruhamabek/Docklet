import React from "react";

export const Comparison: React.FC = () => {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-center text-white mb-8">
        Why Choose Docklet?
      </h2>

      <div className="overflow-x-auto border border-[#232738] rounded-xs bg-[#0f111a]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#161926] text-[#7b849b] border-b border-[#232738] uppercase">
            <tr>
              <th className="p-4">Feature</th>
              <th className="p-4 text-[#00ff66] font-bold">Docklet</th>
              <th className="p-4 text-[#7b849b]">Docker Desktop</th>
              <th className="p-4 text-[#7b849b]">Electron GUIs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#232738]">
            <tr>
              <td className="p-4 font-bold text-white">Telemetry & Analytics</td>
              <td className="p-4 text-[#00ff66]">Zero (100% Local)</td>
              <td className="p-4 text-[#7b849b]">Cloud Account Required</td>
              <td className="p-4 text-[#7b849b]">Varies</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-white">Memory Usage</td>
              <td className="p-4 text-[#00ff66]">~30 MB RAM</td>
              <td className="p-4 text-[#7b849b]">2 GB+ RAM</td>
              <td className="p-4 text-[#7b849b]">500 MB - 1.5 GB</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-white">Binary Size</td>
              <td className="p-4 text-[#00ff66]">&lt; 15 MB Standalone</td>
              <td className="p-4 text-[#7b849b]">500 MB+</td>
              <td className="p-4 text-[#7b849b]">150 MB+</td>
            </tr>
            <tr>
              <td className="p-4 font-bold text-white">Native Webview Runtime</td>
              <td className="p-4 text-[#00ff66]">Yes (Wails v2)</td>
              <td className="p-4 text-[#7b849b]">No</td>
              <td className="p-4 text-[#7b849b]">No (Bundled Chromium)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
};
