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
        if (!res) {
          setStatus("Docker daemon not responding");
          setIsConnected(false);
          return;
        }
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
      .catch(() => {});
  }

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isConnected,
    systemInfo,
    checkStatus,
  };
}