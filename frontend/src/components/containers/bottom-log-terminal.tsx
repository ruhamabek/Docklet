"use client";

import React, { useState, useEffect, useRef } from "react";
import { StreamContainerLogs, StopContainerLogs } from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
import { Terminal, Trash2, X } from "lucide-react";

interface BottomLogTerminalProps {
  containerId: string | null;
  containerName?: string;
  onClose: () => void;
}

export const BottomLogTerminal: React.FC<BottomLogTerminalProps> = ({
  containerId,
  containerName,
  onClose,
}) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerId) {
      setLogs([]);
      return;
    }

    setLogs([]);
    StreamContainerLogs(containerId).catch((err) =>
      setLogs((prev) => [...prev, `❌ [STREAM ATTACH ERROR]: ${err?.message || err}`])
    );

    const unsubLogs = EventsOn("container-log-line", (line: string) => {
      setLogs((prev) => [...prev, line]);
    });

    const unsubErrors = EventsOn("container-log-error", (errMsg: string) => {
      setLogs((prev) => [...prev, `❌ [STREAM ERROR]: ${errMsg}`]);
    });

    return () => {
      StopContainerLogs();
      unsubLogs();
      unsubErrors();
    };
  }, [containerId]);

   useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="w-full mt-4 bg-card border border-border rounded-xs overflow-hidden flex flex-col font-mono shadow-md">
      
       <div className="h-9 px-3 bg-muted/60 border-b border-border flex justify-between items-center select-none text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-foreground uppercase tracking-wider">
            Live Stream Console
          </span>
          {containerId ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] bg-background border border-border text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {containerName ? containerName : containerId.slice(0, 12)}
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">
              [NO ATTACHED CONTAINER]
            </span>
          )}
        </div>

         <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-0.5 text-[10px] rounded-xs border transition-colors ${
              autoScroll
                ? "bg-primary/20 border-primary text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            AUTO-SCROLL {autoScroll ? "ON" : "OFF"}
          </button>

          <button
            onClick={() => setLogs([])}
            disabled={logs.length === 0}
            className="p-1 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {containerId && (
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              title="Close Stream"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

       <div
        ref={logContainerRef}
        className="h-60 w-full bg-background p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed select-text space-y-0.5 scrollbar-thin"
      >
        {!containerId ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic gap-2 select-none">
            <span>Click</span>
            <span className="px-1.5 py-0.5 bg-secondary text-primary border border-border rounded-xs font-bold text-[10px]">
              LOGS
            </span>
            <span>on any container above to attach real-time stdout/stderr stream.</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-muted-foreground italic text-xs animate-pulse">
            [socket attached] Waiting for container stdout/stderr output...
          </div>
        ) : (
          logs.map((line, idx) => (
            <div key={idx} className="text-primary hover:bg-muted/20 px-1 rounded-xs font-mono">
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};