package main

import (
	"fmt"
	"github.com/moby/moby/client"
)


func formatBytes(bytes int64) string {
	b := float64(bytes)
	if b < 1024 {
		return fmt.Sprintf("%d B", bytes)
	}
	if b < 1024*1024 {
		return fmt.Sprintf("%.1f KB", b/1024.0)
	}
	if b < 1024*1024*1024 {
		return fmt.Sprintf("%.1f MB", b/(1024.0*1024.0))
	}
	return fmt.Sprintf("%.2f GB", b/(1024.0*1024.0*1024.0))
}

func CheckDockerClient(dockerClient *client.Client) error {
	if dockerClient == nil {
		return fmt.Errorf("Docker client is not connected")
	}

	return nil
}