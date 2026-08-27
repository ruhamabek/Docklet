import React from 'react';
import { 
  Box, 
  Layers, 
  Download, 
  RefreshCw,
  Activity,
  Loader2,
} from 'lucide-react';
import { useDockerStatus } from '@/app/hooks/useDocker';
 
interface HeaderProps {
  activeTab: activeTab;
  setActiveTab: (tab: activeTab) => void;
  containersRunning: number;
  containersTotal: number;
  imagesCount: number;
  onOpenPullModal: () => void;
  onRefreshAll: () => void;
  isPulling?: boolean;
  pullingImageName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  containersRunning,
  containersTotal,
  imagesCount,
  onOpenPullModal,
  onRefreshAll,
  isPulling = false,
  pullingImageName = "",
}) => {
  const { isConnected } = useDockerStatus();

  const navItems = [
    {
      id: 'dashboard' as const,
      label: "DASHBOARD",
      icon: Activity,
    },
    { 
      id: 'containers' as const, 
      label: `CONTAINERS (${containersRunning}/${containersTotal})`, 
      icon: Box 
    },
    { 
      id: 'images' as const, 
      label: `IMAGES (${imagesCount})`, 
      icon: Layers 
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-background border-b border-border select-none font-mono">
      <div className="flex items-center justify-between h-14 px-4 gap-4">
        
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-primary rounded-xs flex items-center justify-center shadow-[0_0_10px_var(--primary)]">
              <div className="w-3.5 h-3.5 bg-background"></div>
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-primary">
              DOCKLET
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[10px] font-mono bg-muted border border-border">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary shadow-[0_0_6px_var(--primary)] animate-pulse' : 'bg-destructive'}`} />
              <span className={isConnected ? 'text-primary' : 'text-destructive'}>
                {isConnected ? 'DAEMON ONLINE' : 'DAEMON OFFLINE'}
              </span>
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-primary hover:bg-muted'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefreshAll}
            className="p-2 rounded-xs text-xs bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            title="Refresh All"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {isPulling ? (
            <button
              onClick={onOpenPullModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-primary/20 border border-primary text-xs font-mono font-bold text-primary animate-pulse transition-colors"
              title="Click to view live pull logs"
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="truncate max-w-[140px]">
                {pullingImageName ? `PULLING: ${pullingImageName}` : "PULLING..."}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenPullModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-secondary border border-border text-xs font-mono font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>PULL IMAGE</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};