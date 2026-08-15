import { useState } from "react";
import { RunImage } from "@wailsjs/go/main/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RunImageModalProps {
  image: ImageItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function RunImageModal({ image, onClose, onSuccess }: RunImageModalProps) {
  const [containerName, setContainerName] = useState("");
  const [hostPort, setHostPort] = useState("");
  const [containerPort, setContainerPort] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  if (!image) return null;

  function handleLaunch() {
    if (!image) return;
    setIsRunning(true);

    const fullTag = image.tag !== "<none>" ? `${image.repository}:${image.tag}` : image.id;

    const payload: RunImageOptions = {
      imageName: fullTag,
      containerName: containerName.trim(),
      hostPort: hostPort.trim(),
      containerPort: containerPort.trim(),
    };

    RunImage(payload)
      .then(() => {
        setIsRunning(false);
        alert("Container launched successfully! 🚀");
        onSuccess();
        onClose();
      })
      .catch((err) => {
        setIsRunning(false);
        alert("Failed to launch container: " + err);
      });
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <div>
            <h3 className="text-lg font-bold text-white">Run Container</h3>
            <p className="text-xs text-slate-400 font-mono">Image: {image.repository}:{image.tag}</p>
          </div>
          {!isRunning && <Button size="sm" variant="ghost" onClick={onClose}>✖</Button>}
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Container Name (Optional)</label>
            <Input 
              placeholder="e.g. my-app" 
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              disabled={isRunning}
              className="bg-slate-800 border-slate-700 text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Host Port (e.g. 8080)</label>
              <Input 
                placeholder="8080" 
                value={hostPort}
                onChange={(e) => setHostPort(e.target.value)}
                disabled={isRunning}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Container Port (e.g. 80)</label>
              <Input 
                placeholder="80" 
                value={containerPort}
                onChange={(e) => setContainerPort(e.target.value)}
                disabled={isRunning}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="ghost" onClick={onClose} disabled={isRunning}>Cancel</Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white font-bold" onClick={handleLaunch} disabled={isRunning}>
            {isRunning ? "Launching..." : "Launch Container 🚀"}
          </Button>
        </div>
      </div>
    </div>
  );
}