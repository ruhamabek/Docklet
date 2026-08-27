import React from "react";
 
interface ActiveContainersTableProps {
  containers: ContainerItem[];
  isConnected: boolean;
  onNavigateTab: (tab: "containers" | "images") => void;
  onStartContainer: (id: string) => void;
  onStopContainer: (id: string) => void;
  onOpenLogs: (id: string) => void;
  onOpenStats: (c: ContainerItem) => void;
}

export const ActiveContainersTable: React.FC<ActiveContainersTableProps> = ({
  containers,
  isConnected,
  onNavigateTab,
  onStartContainer,
  onStopContainer,
  onOpenLogs,
  onOpenStats,
}) => {
  const runningCount = containers.filter((c) => c.state === "running").length;
  const stoppedCount = containers.filter((c) => c.state !== "running").length;

  return (
    <div className="col-span-1 md:col-span-3 bg-card border border-border flex flex-col overflow-hidden rounded-xs">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
            Active Containers
          </h3>
          <span className="text-[10px] px-2 py-0.5 bg-muted text-primary border border-border rounded-xs">
            {runningCount} RUNNING / {stoppedCount} EXITED
          </span>
        </div>
        <button
          onClick={() => onNavigateTab("containers")}
          className="text-xs text-primary hover:underline font-bold"
        >
          [VIEW ALL {containers.length} →]
        </button>
      </div>

      <div className="overflow-x-auto">
        {!isConnected ? (
          <div className="p-8 text-center text-destructive text-xs">
            Docker daemon is offline.
          </div>
        ) : containers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            No containers found.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-muted-foreground border-b border-border bg-background">
              <tr>
                <th className="p-3.5">NAME</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5">IMAGE</th>
                <th className="p-3.5">PORTS</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {containers.slice(0, 5).map((c) => {
                const isRunning = c.state === "running";

                return (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isRunning ? "bg-primary" : "bg-destructive"
                          }`}
                        />
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          ({c.id})
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                      {c.status}
                    </td>

                    <td className="p-3.5 text-muted-foreground text-[11px] font-mono truncate max-w-[160px]">
                      {c.image}
                    </td>

                    <td className="p-3.5 text-primary text-[11px] font-mono">
                      {c.ports && c.ports.length > 0 ? c.ports.join(", ") : "-"}
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenLogs(c.id)}
                          disabled={!isConnected}
                          className="px-2 py-1 bg-secondary border border-border hover:border-primary text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors rounded-xs disabled:opacity-40 disabled:pointer-events-none"
                        >
                          LOGS
                        </button>
                        {isRunning ? (
                          <>
                            <button
                              onClick={() => onOpenStats(c)}
                              disabled={!isConnected}
                              className="px-2 py-1 bg-secondary border border-border hover:border-primary text-muted-foreground hover:text-primary text-[10px] font-bold transition-colors rounded-xs disabled:opacity-40 disabled:pointer-events-none"
                            >
                              STATS
                            </button>
                            <button
                              onClick={() => onStopContainer(c.id)}
                              disabled={!isConnected}
                              className="px-2 py-1 bg-secondary border border-border hover:border-destructive text-muted-foreground hover:text-destructive text-[10px] font-bold transition-colors rounded-xs disabled:opacity-40 disabled:pointer-events-none"
                            >
                              STOP
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => onStartContainer(c.id)}
                            disabled={!isConnected}
                            className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-bold transition-colors rounded-xs shadow-xs disabled:opacity-40 disabled:pointer-events-none"
                          >
                            START
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};