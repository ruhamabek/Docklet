import { useState, useEffect, useRef } from "react";
import { StreamContainerLogs, StopContainerLogs } from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
import { Button } from "@/components/ui/button";

interface LogViewerModalProps {
  containerId: string | null;
  onClose: () => void;
}

export function LogViewerModal({ containerId, onClose }: LogViewerModalProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerId) return;

    setLogs([]);
    StreamContainerLogs(containerId).catch((err) => alert("Failed to open stream: " + err));

    const unsubLogs = EventsOn("container-log-line", (line: string) => {
      setLogs((prev) => [...prev, line]);
    });

    const unsubErrors = EventsOn("container-log-error", (errMsg: string) => {
      setLogs((prev) => [...prev, `❌ [ERROR]: ${errMsg}`]);
    });

    return () => {
      StopContainerLogs();
      unsubLogs();
      unsubErrors();
    };
  }, [containerId]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!containerId) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-xl p-4 flex flex-col gap-3 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-700 pb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            Live Logs: <span className="font-mono text-slate-400">({containerId})</span>
          </h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setLogs([])}>Clear</Button>
            <Button size="sm" variant="destructive" onClick={onClose}>Close ✖</Button>
          </div>
        </div>

        <div 
          ref={logContainerRef} 
          className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg h-96 overflow-y-auto whitespace-pre-wrap flex flex-col gap-1 border border-slate-800"
        >
          {logs.length === 0 ? (
            <span className="text-slate-500 italic">Waiting for container log output...</span>
          ) : (
            logs.map((line, index) => <div key={index} className="leading-relaxed">{line}</div>)
          )}
        </div>
      </div>
    </div>
  );
}