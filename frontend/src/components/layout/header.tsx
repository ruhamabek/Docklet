import { useDockerStatus } from "@/app/hooks/useDocker";
import { Button } from "@/components/ui/button";

export function Header() {
  const { status, isConnected, checkStatus } = useDockerStatus();

  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-slate-900/80 backdrop-blur border-b border-slate-800">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🐳</span>
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Docklet
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
          <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
          <span className="font-mono text-slate-300">{status}</span>
        </div>
        <Button size="sm" variant="ghost" onClick={checkStatus}>
          🔄
        </Button>
      </div>
    </header>
  );
}