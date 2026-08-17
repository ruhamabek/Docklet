package main

type ContainerItem struct{
	ID string `json:"id"`
	Name string `json:"name"`
	Image string `json:"image"`
	Status string `json:"status"`
	Command string `json:"command"`
	Created int64 `json:"created"`
	State string `json:"state"`
	Ports []string `json:"ports"`
}

type ImageItem struct {
	ID string `json:"id"`
	Repository string `json:"repository"`
	Tag string `json:"tag"`
	Size string `json:"size"`
	SizeBytes int64 `json:"SizeBytes"`
	Created int64 `json:"created"`
}

type PullProgress struct{
	ID string `json:"id"`
	Status string `json:"status"`
    Progress string `json:"progress"`
}

type RunImageOptions struct {
	ImageName     string `json:"imageName"`      
	ContainerName string `json:"containerName"`  
	HostPort      string `json:"hostPort"`      
	ContainerPort string `json:"containerPort"` 
}

type ContainerStatsData struct {
	ContainerID   string  `json:"containerId"`
	CPUPercent    float64 `json:"cpuPercent"`   
	MemoryUsageMB float64 `json:"memoryUsageMB"` 
	MemoryLimitMB float64 `json:"memoryLimitMB"` 
	MemoryPercent float64 `json:"memoryPercent"`  
	MemoryHuman   string  `json:"memoryHuman"`    
}

type SystemInfoData struct {
	NCPU             int    `json:"ncpu"`
	TotalMemoryGB    float64 `json:"totalMemoryGB"`
	TotalMemoryBytes int64  `json:"totalMemoryBytes"`
	ServerVersion    string `json:"serverVersion"`
	OperatingSystem  string `json:"operatingSystem"`
}

type AggregateMetrics struct {
	TotalCpuPercent float64 `json:"totalCpuPercent"`
	TotalMemoryMB   float64 `json:"totalMemoryMB"`
}