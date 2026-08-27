"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ListContainers, 
  StartContainer, 
  StopContainer, 
  RemoveContainer 
} from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
import { getErrorMessage } from "@/lib/utils";
 
export function useContainers() {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContainers = useCallback(() => {
    setLoading(true);
    ListContainers()
      .then((data) => {
        setContainers(data || []);
      })
      .catch((err) => {
        const error = getErrorMessage(err);
        console.error("Failed to load containers:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  async function startContainer(id: string): Promise<ActionResult> {
    try {
      await StartContainer(id);
      fetchContainers();
      return { success: true };
    } catch (err) {
      const error = getErrorMessage(err);
      console.error("Failed to start container:", error);
      return { success: false, error };
    }
  }

  async function stopContainer(id: string): Promise<ActionResult> {
    try {
      await StopContainer(id);
      fetchContainers();
      return { success: true };
    } catch (err) {
      const error = getErrorMessage(err);
      console.error("Failed to stop container:", error);
      return { success: false, error };
    }
  }

  async function removeContainer(id: string): Promise<ActionResult> {
    try {
      await RemoveContainer(id);
      fetchContainers();
      return { success: true };
    } catch (err) {
      const error = getErrorMessage(err);
      console.error("Failed to delete container:", error);
      return { success: false, error };
    }
  }

  useEffect(() => {
    fetchContainers();

    const unsubscribe = EventsOn("docker-event", () => {
      fetchContainers();
    });

    return () => unsubscribe();
  }, [fetchContainers]);

  return {
    containers,
    loading,
    refresh: fetchContainers,
    startContainer,
    stopContainer,
    removeContainer,
  };
}