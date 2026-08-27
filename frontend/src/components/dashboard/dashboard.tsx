import React, { useMemo } from "react";
import { ActiveContainersTable } from "./active-containers-table";
import { CpuChartCard } from "./cpu-chart-card";
import { MemoryCard } from "./memory-card";
import { PortForwardingsCard } from "./port-fowarding-card";
import { PrivacyCard } from "./privacy-card";
 

interface DashboardProps {
  containers: ContainerItem[];
  images: ImageItem[];
  isConnected: boolean;
  statusText: string;
  totalMemoryGB: number;
  ncpu: number;
  onNavigateTab: (tab: "containers" | "images") => void;
  onStartContainer: (id: string) => void;
  onStopContainer: (id: string) => void;
  onOpenLogs: (id: string) => void;
  onOpenStats: (c: ContainerItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  containers,
  isConnected,
  totalMemoryGB,
  ncpu,
  onNavigateTab,
  onStartContainer,
  onStopContainer,
  onOpenLogs,
  onOpenStats,
}) => {
  const runningCount = useMemo(
    () => containers.filter((c) => c.state === "running").length,
    [containers]
  );

  return (
    <div className="w-full space-y-4 font-mono select-none">
       <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
         <CpuChartCard ncpu={ncpu} runningContainersCount={runningCount} />
           <PrivacyCard />
           <MemoryCard totalMemoryGB={totalMemoryGB} runningContainersCount={runningCount} />
           <ActiveContainersTable
              containers={containers}
              isConnected={isConnected}
              onNavigateTab={onNavigateTab}
              onStartContainer={onStartContainer}
              onStopContainer={onStopContainer}
              onOpenLogs={onOpenLogs}
              onOpenStats={onOpenStats}
           />
         <PortForwardingsCard containers={containers} onNavigateTab={onNavigateTab} />
      </div>
      
    </div>
  );
};