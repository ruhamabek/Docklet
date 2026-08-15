"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogViewerModal } from "@/components/containers/log-viewer-modal";
import { StatsModal } from "@/components/containers/stats-modal";
import { PullImageModal } from "@/components/images/pull-image-modal";
import { RunImageModal } from "@/components/images/run-image-modal";
import { useContainers } from "./hooks/useContainers";
import { useImages } from "./hooks/useImages";
import { Header } from "@/components/layout/header";

export default function Home() {
  const [activeTab, setActiveTab] = useState<activeTab>("containers");
  const [logContainerId, setLogContainerId] = useState<string | null>(null);
  const [statsContainer, setStatsContainer] = useState<ContainerItem | null>(null);
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [runModalImage, setRunModalImage] = useState<ImageItem | null>(null);
  
  const { containers, startContainer, stopContainer, removeContainer, refresh: refreshContainers } = useContainers();
  const { images, removeImage, refresh: refreshImages } = useImages();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-6">
         <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            className={`px-4 py-2 font-bold rounded-lg transition ${
              activeTab === "containers" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
            onClick={() => setActiveTab("containers")}
          >
            Containers 📦 ({containers.length})
          </button>
          <button
            className={`px-4 py-2 font-bold rounded-lg transition ${
              activeTab === "images" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white"
            }`}
            onClick={() => {
              setActiveTab("images");
              refreshImages();
            }}
          >
            Images 🖼️ ({images.length})
          </button>
        </div>

         {activeTab === "containers" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Containers ({containers.length})</h2>
              <Button size="sm" onClick={refreshContainers}>Refresh 🔄</Button>
            </div>

            {containers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">
                No containers found. Go to the Images tab to launch one!
              </div>
            ) : (
              <div className="grid gap-3">
                {containers.map((c) => (
                  <div key={c.id} className="p-4 border border-slate-800 rounded-xl bg-slate-900/60 flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${c.state === "running" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                        <span className="font-bold text-lg text-white">{c.name}</span>
                        <span className="text-xs text-slate-400 font-mono">({c.id})</span>
                      </div>
                      <p className="text-xs text-slate-400">Image: {c.image}</p>
                      <p className="text-xs text-slate-500">Status: {c.status}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.state === "running" ? (
                        <>
                          <Button size="sm" variant="destructive" onClick={() => stopContainer(c.id)}>Stop ⏹️</Button>
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setStatsContainer(c)}>Stats 📊</Button>
                        </>
                      ) : (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => startContainer(c.id)}>Start ▶️</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setLogContainerId(c.id)}>Logs 📜</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeContainer(c.id, c.name)}>Delete 🗑️</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

         {activeTab === "images" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Downloaded Images ({images.length})</h2>
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsPullModalOpen(true)}>Pull Image 📥</Button>
                <Button size="sm" onClick={refreshImages}>Refresh 🔄</Button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500">No images downloaded yet.</div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-mono text-xs uppercase border-b border-slate-700">
                    <tr>
                      <th className="p-3">Repository</th>
                      <th className="p-3">Tag</th>
                      <th className="p-3">Image ID</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {images.map((img) => (
                      <tr key={img.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-bold text-white">{img.repository}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-blue-950 text-blue-400 border border-blue-800 rounded font-mono text-xs">
                            {img.tag}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-slate-400">{img.id}</td>
                        <td className="p-3 font-mono text-xs text-green-400">{img.size}</td>
                        <td className="p-3 flex gap-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setRunModalImage(img)}>Run ▶️</Button>
                          <Button size="sm" variant="destructive" onClick={() => removeImage(img.id, img.repository)}>Delete 🗑️</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <LogViewerModal containerId={logContainerId} onClose={() => setLogContainerId(null)} />
      <StatsModal container={statsContainer} onClose={() => setStatsContainer(null)} />
      <PullImageModal isOpen={isPullModalOpen} onClose={() => setIsPullModalOpen(false)} onSuccess={refreshImages} />
      <RunImageModal 
        image={runModalImage} 
        onClose={() => setRunModalImage(null)} 
        onSuccess={() => {
          refreshContainers();
          setActiveTab("containers");
        }} 
      />
    </div>
  );
}