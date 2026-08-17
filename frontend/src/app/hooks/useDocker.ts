import { useState, useEffect } from "react";
import { GetDockerInfo, GetSystemInfo } from "@wailsjs/go/main/App";

export function useDockerStatus() {
  const [status, setStatus] = useState("Checking Docker...");
  const [isConnected, setIsConnected] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    ncpu: 4,
    totalMemoryGB: 16,
    serverVersion: "",
    operatingSystem: "",
  });

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

     GetSystemInfo()
      .then((info) => {
        if (info) {
          setSystemInfo(info);
        }
      })
      .catch((err) => console.error("Failed to get system info:", err));
  }

  useEffect(() => {
    checkStatus();
  }, []);

  return {
    status,
    isConnected,
    systemInfo,
    checkStatus,
  };
}