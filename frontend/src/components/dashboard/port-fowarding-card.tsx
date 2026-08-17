import React, { useMemo } from "react";
import { ExternalLink } from "lucide-react";
 
interface PortForwardingsCardProps {
  containers: ContainerItem[];
  onNavigateTab: (tab: "containers" | "images") => void;
}

export const PortForwardingsCard: React.FC<PortForwardingsCardProps> = ({
  containers,
  onNavigateTab,
}) => {
  const runningContainers = useMemo(
    () => containers.filter((c) => c.state === "running"),
    [containers]
  );

  const activePorts = useMemo(() => {
    const list: {
      containerName: string;
      containerId: string;
      portStr: string;
      hostPort: string;
      containerPort: string;
    }[] = [];
    runningContainers.forEach((c) => {
      if (c.ports && c.ports.length > 0) {
        c.ports.forEach((p) => {
          const match = p.match(/^(\d+)(?:->|:)(\d+)/);
          list.push({
            containerName: c.name,
            containerId: c.id,
            portStr: p,
            hostPort: match ? match[1] : p.split("/")[0],
            containerPort: match ? match[2] : p.split("/")[0],
          });
        });
      }
    });
    return list;
  }, [runningContainers]);

  return (
    <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-colors rounded-xs">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-primary" />
            Port Forwardings
          </h3>
          <span className="text-[10px] text-primary">{activePorts.length} mapped</span>
        </div>

        <div className="space-y-2 max-h-44 overflow-y-auto">
          {activePorts.length === 0 ? (
            <p className="text-[11px] text-muted-foreground italic">No active port forwards.</p>
          ) : (
            activePorts.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xs bg-background border border-border text-xs"
              >
                <div className="truncate pr-2">
                  <span className="text-primary font-bold">:{p.hostPort}</span>
                  <span className="text-muted-foreground text-[10px] ml-1">→ {p.containerPort}</span>
                  <div className="text-[10px] text-muted-foreground truncate">{p.containerName}</div>
                </div>

                {p.hostPort && (
                  <a
                    href={`http://localhost:${p.hostPort}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors shrink-0"
                    title={`Open http://localhost:${p.hostPort}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <button
        onClick={() => onNavigateTab("images")}
        className="w-full mt-3 py-2 bg-secondary border border-border hover:border-primary text-primary text-xs font-bold transition-colors rounded-xs"
      >
        + RUN FROM IMAGES
      </button>
    </div>
  );
};