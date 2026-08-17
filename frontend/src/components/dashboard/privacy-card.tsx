import React from "react";
import { ShieldCheck } from "lucide-react";

export const PrivacyCard: React.FC = () => {
  return (
    <div className="bg-card border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-colors rounded-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          Privacy Status
        </h3>
      </div>

      <div className="flex items-center gap-3 my-4">
        <div className="w-11 h-11 border-2 border-primary rounded-full flex items-center justify-center shrink-0 shadow-[0_0_10px_var(--primary)]">
          <span className="text-xl text-primary font-bold">✓</span>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-foreground">Zero Telemetry</p>
          <p className="text-[10px] text-muted-foreground">All local data stays 100% on your machine.</p>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Outbound Pings: <strong className="text-primary">0 KB</strong></span>
        <span>Cloud Sync: <strong className="text-muted-foreground">DISABLED</strong></span>
      </div>
    </div>
  );
};