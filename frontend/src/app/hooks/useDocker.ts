import { useState, useEffect } from "react";
import { GetDockerInfo } from "@wailsjs/go/main/App";

export function useDockerStatus() {
  const [status, setStatus] = useState("Checking Docker...");
  const [isConnected, setIsConnected] = useState(false);

  function checkStatus() {
    GetDockerInfo()
      .then((res) => {
        setStatus(res);
        setIsConnected(!res.includes("failed") && !res.includes("not connected"));
      })
      .catch((err) => {
        setStatus(`Error: ${err}`);
        setIsConnected(false);
      });
  }

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    status,
    isConnected,
    checkStatus,
  };
}