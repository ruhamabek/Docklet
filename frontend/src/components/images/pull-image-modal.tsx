import { useState } from "react";
import { PullImages } from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PullImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PullImageModal({ isOpen, onClose, onSuccess }: PullImageModalProps) {
  const [imageName, setImageName] = useState("");
  const [isPulling, setIsPulling] = useState(false);
  const [layerProgress, setLayerProgress] = useState<Record<string, PullProgress>>({});

  function handlePull() {
    if (!imageName.trim()) return;

    setIsPulling(true);
    setLayerProgress({});

    const unsub = EventsOn("image-pull-progress", (data: PullProgress) => {
      if (data.id) {
        setLayerProgress((prev) => ({ ...prev, [data.id]: data }));
      }
    });

    PullImages(imageName.trim())
      .then(() => {
        setIsPulling(false);
        unsub();
        alert(`Successfully pulled ${imageName}!`);
        onSuccess();
        onClose();
        setImageName("");
      })
      .catch((err) => {
        setIsPulling(false);
        unsub();
        alert("Failed to pull: " + err);
      });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-white">Pull Image from Docker Hub</h3>
          {!isPulling && <Button size="sm" variant="ghost" onClick={onClose}>✖</Button>}
        </div>

        <div className="flex gap-2">
          <Input 
            placeholder="e.g. redis:alpine, nginx:alpine"
            value={imageName}
            onChange={(e) => setImageName(e.target.value)}
            disabled={isPulling}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            onClick={handlePull}
            disabled={isPulling || !imageName.trim()}
          >
            {isPulling ? "Pulling..." : "Pull 📥"}
          </Button>
        </div>

        {Object.keys(layerProgress).length > 0 && (
          <div className="flex flex-col gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 max-h-60 overflow-y-auto font-mono text-xs">
            {Object.values(layerProgress).map((layer) => (
              <div key={layer.id} className="flex justify-between items-center border-b border-slate-900 pb-1">
                <span className="text-slate-400 font-bold">{layer.id}</span>
                <span className="text-blue-400">{layer.status}</span>
                <span className="text-slate-500 text-[10px]">{layer.progress}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}