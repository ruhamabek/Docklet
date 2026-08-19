type activeTab = 'containers' | 'images' | 'dashboard'; 
interface ContainerItem {
  id: string;
  name: string;
  image: string;
  command: string;
  created: number;
  state: string;
  status: string;
  ports: string[];
}
interface ImageItem {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: number;
}
interface PullProgress {
  id: string;
  status: string;
  progress: string;
}
interface RunImageOptions {
  imageName: string;
  containerName: string;
  hostPort: string;
  containerPort: string;
}

interface ContainerStatsData {
  containerId: string;
  cpuPercent: number;
  memoryUsageMB: number;
  memoryLimitMB: number;
  memoryPercent: number;
  memoryHuman: string;
  
}