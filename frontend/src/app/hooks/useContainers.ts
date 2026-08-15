import { useState, useEffect } from "react";
import { 
  ListContainers, 
  StartContainer, 
  StopContainer, 
  RemoveContainer 
} from "@wailsjs/go/main/App";
import { EventsOn } from "@wailsjs/runtime/runtime";
 
export function useContainers() {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [loading, setLoading] = useState(false);

  function fetchContainers() {
    setLoading(true);
    ListContainers()
      .then((data) => setContainers(data || []))
      .catch((err) => console.error("Failed to load containers:", err))
      .finally(() => setLoading(false));
  }

   async function startContainer(id: string) {
    try {
          await StartContainer(id);
          return fetchContainers();
      } catch (err) {
          return alert("Failed to start: " + err);
      }
  }

  async function stopContainer(id: string) {
    try {
          await StopContainer(id);
          return fetchContainers();
      } catch (err) {
          return alert("Failed to stop: " + err);
      }
  }

   function removeContainer(id: string, name: string) {
    if (confirm(`Are you sure you want to delete container "${name}" (${id})?`)) {
      return RemoveContainer(id)
        .then(() => fetchContainers())
        .catch((err) => alert("Failed to delete: " + err));
    }
  }

  useEffect(() => {
    fetchContainers();

    const unsubscribe = EventsOn("docker-event", () => {
      fetchContainers();
    });

    return () => unsubscribe();
  }, []);

  return {
    containers,
    loading,
    refresh: fetchContainers,
    startContainer,
    stopContainer,
    removeContainer,
  };
}