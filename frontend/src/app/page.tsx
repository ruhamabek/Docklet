"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Dashboard } from "@/components/dashboard/dashboard";
import { ContainersView } from "@/components/containers/containers-view";
import { ImagesView } from "@/components/images/images-view";
import { StatsModal } from "@/components/containers/stats-modal";
import { PullImageModal } from "@/components/images/pull-image-modal";
import { RunImageModal } from "@/components/images/run-image-modal";
import { BackgroundPullWidget } from "@/components/images/background-pull-widget";
import { BottomLogTerminal } from "@/components/containers/bottom-log-terminal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertModal } from "@/components/ui/alert-modal";
import { useContainers } from "./hooks/useContainers";
import { useImages } from "./hooks/useImages";
import { usePullImage } from "./hooks/usePullImage";
import { useDockerStatus } from "./hooks/useDocker";
 
export default function Home() {
  const [activeTab, setActiveTab] = useState<activeTab>("dashboard");
  const [logContainerId, setLogContainerId] = useState<string | null>(null);
  const [statsContainer, setStatsContainer] = useState<ContainerItem | null>(null);
  const [isPullModalOpen, setIsPullModalOpen] = useState(false);
  const [runModalImage, setRunModalImage] = useState<ImageItem | null>(null);

  // Dialog & Alert State
  const [deleteContainerTarget, setDeleteContainerTarget] = useState<ContainerItem | null>(null);
  const [deleteImageTarget, setDeleteImageTarget] = useState<ImageItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    containers,
    startContainer,
    stopContainer,
    removeContainer,
    refresh: refreshContainers,
  } = useContainers();

  const { images, removeImage, refresh: refreshImages } = useImages();
  const { status, isConnected, systemInfo } = useDockerStatus();

  const {
    imageName: pullImageName,
    setImageName: setPullImageName,
    isPulling,
    layerProgress: pullLayerProgress,
    statusMessage: pullStatusMessage,
    startPull,
    cancelPull,
    clearStatus: clearPullStatus,
  } = usePullImage(refreshImages);

  function handleRefreshAll() {
    refreshContainers();
    refreshImages();
  }

  async function handleStartContainer(id: string) {
    const res = await startContainer(id);
    if (!res.success) {
      setErrorMessage(`Failed to start container: ${res.error}`);
    }
  }

  async function handleStopContainer(id: string) {
    const res = await stopContainer(id);
    if (!res.success) {
      setErrorMessage(`Failed to stop container: ${res.error}`);
    }
  }

  async function handleConfirmDeleteContainer() {
    if (!deleteContainerTarget) return;
    setIsActionLoading(true);
    const res = await removeContainer(deleteContainerTarget.id);
    setIsActionLoading(false);
    if (res.success) {
      setDeleteContainerTarget(null);
    } else {
      setErrorMessage(`Failed to delete container: ${res.error}`);
    }
  }

  async function handleConfirmDeleteImage() {
    if (!deleteImageTarget) return;
    setIsActionLoading(true);
    const res = await removeImage(deleteImageTarget.id);
    setIsActionLoading(false);
    if (res.success) {
      setDeleteImageTarget(null);
    } else {
      setErrorMessage(`Failed to delete image: ${res.error}`);
    }
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
        isPulling={isPulling}
        pullingImageName={pullImageName}
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
            onStartContainer={handleStartContainer}
            onStopContainer={handleStopContainer}
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
          <ContainersView
            containers={containers}
            onRefresh={refreshContainers}
            onStart={handleStartContainer}
            onStop={handleStopContainer}
            onStats={setStatsContainer}
            onDelete={setDeleteContainerTarget}
          />
        </div>

        <div className={activeTab === "images" ? "block" : "hidden"}>
          <ImagesView
            images={images}
            onRefresh={refreshImages}
            onOpenPullModal={() => setIsPullModalOpen(true)}
            onRun={setRunModalImage}
            onDelete={setDeleteImageTarget}
          />
        </div>
      </main>

       <StatsModal
        container={statsContainer}
        onClose={() => setStatsContainer(null)}
      />

      <PullImageModal
        isOpen={isPullModalOpen}
        onClose={() => setIsPullModalOpen(false)}
        isPulling={isPulling}
        imageName={pullImageName}
        setImageName={setPullImageName}
        layerProgress={pullLayerProgress}
        statusMessage={pullStatusMessage}
        onStartPull={startPull}
        onCancelPull={cancelPull}
      />

      <RunImageModal
        image={runModalImage}
        onClose={() => setRunModalImage(null)}
        onSuccess={() => {
          refreshContainers();
          setActiveTab("containers");
        }}
      />

       <BackgroundPullWidget
        isPulling={isPulling}
        imageName={pullImageName}
        layerProgress={pullLayerProgress}
        statusMessage={isPullModalOpen ? null : pullStatusMessage}
        onOpenModal={() => setIsPullModalOpen(true)}
        onCancel={cancelPull}
        onDismiss={clearPullStatus}
      />

       <ConfirmDialog
        isOpen={!!deleteContainerTarget}
        onClose={() => setDeleteContainerTarget(null)}
        onConfirm={handleConfirmDeleteContainer}
        title="Delete Container"
        confirmText="Delete Container"
        isLoading={isActionLoading}
        description={
          deleteContainerTarget ? (
            <div className="flex flex-col gap-2 mt-1">
              <p>
                Are you sure you want to permanently delete container{" "}
                <span className="text-foreground font-bold font-mono">
                  &quot;{deleteContainerTarget.name}&quot;
                </span>{" "}
                (<span className="text-primary font-mono">{deleteContainerTarget.id.slice(0, 12)}</span>)?
              </p>
              <p className="text-[11px] text-muted-foreground">
                This will force-remove the container and its ephemeral storage.
              </p>
            </div>
          ) : null
        }
      />

       <ConfirmDialog
        isOpen={!!deleteImageTarget}
        onClose={() => setDeleteImageTarget(null)}
        onConfirm={handleConfirmDeleteImage}
        title="Delete Docker Image"
        confirmText="Delete Image"
        isLoading={isActionLoading}
        description={
          deleteImageTarget ? (
            <div className="flex flex-col gap-2 mt-1">
              <p>
                Are you sure you want to delete image{" "}
                <span className="text-foreground font-bold font-mono">
                  &quot;{deleteImageTarget.repository}:{deleteImageTarget.tag}&quot;
                </span>{" "}
                (<span className="text-primary font-mono">{deleteImageTarget.id.slice(0, 12)}</span>)?
              </p>
              <p className="text-[11px] text-muted-foreground">
                This will prune untagged child image layers from local storage.
              </p>
            </div>
          ) : null
        }
      />

       <AlertModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        message={errorMessage}
        type="error"
      />
    </div>
  );
}