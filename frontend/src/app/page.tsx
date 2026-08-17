"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatsModal } from "@/components/containers/stats-modal";
import { PullImageModal } from "@/components/images/pull-image-modal";
import { RunImageModal } from "@/components/images/run-image-modal";
import { useContainers } from "./hooks/useContainers";
import { useImages } from "./hooks/useImages";
import { Header } from "@/components/layout/header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { useDockerStatus } from "./hooks/useDocker";
import { Inbox, LogsIcon, Play, RefreshCcw, StopCircle, Trash } from "lucide-react";
import { BottomLogTerminal } from "@/components/containers/bottom-log-terminal";
 
 
export default function Home() {
  const [activeTab, setActiveTab] = useState<activeTab>("dashboard");
  const [logContainerId, setLogContainerId] = useState<string | null>(null);
  const [statsContainer, setStatsContainer] = useState<ContainerItem | null>(null);
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [runModalImage, setRunModalImage] = useState<ImageItem | null>(null);

  const {
    containers,
    startContainer,
    stopContainer,
    removeContainer,
    refresh: refreshContainers,
  } = useContainers();

  const { images, removeImage, refresh: refreshImages } = useImages();
  const { status, isConnected,systemInfo } = useDockerStatus();

  function handleRefreshAll() {
    refreshContainers();
    refreshImages();
  }

  const runningContainersCount = containers.filter(
    (c) => c.state === "running"
  ).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-mono w-full">
       <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        containersRunning={runningContainersCount}
        containersTotal={containers.length}
        imagesCount={images.length}
        onOpenPullModal={() => setIsPullModalOpen(true)}
        onRefreshAll={handleRefreshAll}
      />

      <main className="flex-1 w-full px-6 py-6 flex flex-col gap-6">
         <div className={activeTab === "dashboard" ? "block" : "hidden"}>
            <Dashboard
              containers={containers}
              images={images}
              isConnected={isConnected}
              statusText={status}
              totalMemoryGB={systemInfo.totalMemoryGB}
              ncpu={systemInfo.ncpu}
              onNavigateTab={setActiveTab}
              onStartContainer={startContainer}
              onStopContainer={stopContainer}
              onOpenLogs={setLogContainerId}
              onOpenStats={setStatsContainer}
            />
             <BottomLogTerminal
                containerId={logContainerId}
                containerName={containers.find((c) => c.id === logContainerId)?.name}
                onClose={() => setLogContainerId(null)}
              />
          </div>
         <div className={activeTab === "containers" ? "block" : "hidden"}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Containers ({containers.length})
              </h2>
              <Button size="sm" onClick={refreshContainers}>
                Refresh 
                <RefreshCcw/>
              </Button>
            </div>

            {containers.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                No containers found. Go to the Images tab to launch one!
              </div>
            ) : (
              <div className="grid gap-3">
                {containers.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 border border-border rounded-xl bg-card flex justify-between items-center"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            c.state === "running"
                              ? "bg-primary animate-pulse"
                              : "bg-destructive"
                          }`}
                        />
                        <span className="font-bold text-lg text-foreground">
                          {c.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          ({c.id})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Image: {c.image}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Status: {c.status}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {c.state === "running" ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => stopContainer(c.id)}
                          >
                            Stop 
                            <StopCircle/>
                          </Button>
                          <Button
                            size="sm"
                            className="bg-secondary border border-border text-foreground hover:border-primary hover:text-primary"
                            onClick={() => setStatsContainer(c)}
                          >
                            Stats 📊
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                          onClick={() => startContainer(c.id)}
                        >
                          Start 
                          <Play/>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLogContainerId(c.id)}
                      >
                        Logs 
                        <LogsIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeContainer(c.id, c.name)}
                      >
                        Delete 
                        <Trash/>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 🌟 3. IMAGES TAB */}
        <div className={activeTab === "images" ? "block" : "hidden"}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Downloaded Images ({images.length})
              </h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                  onClick={() => setIsPullModalOpen(true)}
                >
                  Pull Image 
                  <Inbox />
                </Button>
                <Button size="sm" onClick={refreshImages}>
                  Refresh 
                  <RefreshCcw/>
                </Button>
              </div>
            </div>

            {images.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                No images downloaded yet.
              </div>
            ) : (
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <table className="w-full text-left text-sm text-foreground">
                  <thead className="bg-background text-muted-foreground font-mono text-xs uppercase border-b border-border">
                    <tr>
                      <th className="p-3">Repository</th>
                      <th className="p-3">Tag</th>
                      <th className="p-3">Image ID</th>
                      <th className="p-3">Size</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {images.map((img) => (
                      <tr
                        key={img.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="p-3 font-bold text-foreground">
                          {img.repository}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-muted text-primary border border-border rounded font-mono text-xs">
                            {img.tag}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">
                          {img.id}
                        </td>
                        <td className="p-3 font-mono text-xs text-primary">
                          {img.size}
                        </td>
                        <td className="p-3 flex gap-2">
                          <Button
                            size="sm"
                            className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                            onClick={() => setRunModalImage(img)}
                          >
                            Run 
                            <Play/>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              removeImage(img.id, img.repository)
                            }
                          >
                            Delete 
                            <Trash/>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      <StatsModal
        container={statsContainer}
        onClose={() => setStatsContainer(null)}
      />
      <PullImageModal
        isOpen={isPullModalOpen}
        onClose={() => setIsPullModalOpen(false)}
        onSuccess={refreshImages}
      />
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