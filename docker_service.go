package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/moby/moby/client"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)


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

func (a *App) GetDockerInfo()(string, error){
	  
	  CheckDockerClient(a.docker_client)
   
	  ping, err := a.docker_client.Ping(a.ctx, client.PingOptions{})

	  if err != nil {
		  return fmt.Sprintf("Docker ping failed: %v", err), nil
	  }
   
	  return fmt.Sprintf("Docker ping successful: %v", ping), nil

}

func (a *App) ListContainers()([]ContainerItem , error){
	  CheckDockerClient(a.docker_client)

	  rawContainers, err := a.docker_client.ContainerList(a.ctx, client.ContainerListOptions{All: true})
	  if err != nil {
		  return nil, err
	  }

	  var items []ContainerItem

	  for _,c := range rawContainers.Items {
           name := "unamed"
		   if len(c.Names) > 0 {
			   name := c.Names[0]
			   if len(name) > 0 && name[0] == '/'{
                    name = name[1:]
			   } 
		   }

		   var formattedPorts []string

		   for _, p := range c.Ports{
			    if p.PublicPort != 0 {
					formattedPorts = append(formattedPorts, fmt.Sprintf("%d->%d/%s", p.PublicPort, p.PrivatePort, p.Type))
				} else {
					formattedPorts = append(formattedPorts, fmt.Sprintf("%d/%s", p.PrivatePort, p.Type))
				}
		   }

		   items = append(items, ContainerItem{
			ID:      c.ID[:12],
			Name:    name,
			Image:   c.Image,
			Command: c.Command,
			Created: c.Created,
			State:   string(c.State),
			Status:  c.Status,
			Ports:   formattedPorts,
		   }) 
	  }

	  return items, nil
}

func (a *App) StartContainer(id string)(client.ContainerStartResult, error) {
	  CheckDockerClient(a.docker_client)
	  return a.docker_client.ContainerStart(a.ctx, id, client.ContainerStartOptions{})
}

func (a *App) StopContainer(id string)(client.ContainerStopResult, error){
	CheckDockerClient(a.docker_client)
	return a.docker_client.ContainerStop(a.ctx, id, client.ContainerStopOptions{})
}

func (a *App) listenToDockerEvents() {
	if a.docker_client == nil {
		return
	}

	result := a.docker_client.Events(a.ctx, client.EventsListOptions{})
    
	for {
		select{
		case err := <- result.Err:
			if err != nil {
				fmt.Printf("Docker event error: %v", err)
				return
			}
		
		case msg := <- result.Messages:
			 if msg.Type == "container"{
				fmt.Printf("Docker Container Event: %s\n", msg.Action)
				runtime.EventsEmit(a.ctx, "docker-event", msg.Action)
			 }
		}
	}
	
}

func (a *App) StreamContainerLogs(id string) error{
	CheckDockerClient(a.docker_client)

	if a.cancelLogStream != nil {
		a.cancelLogStream()
	}

	logCtx, cancel := context.WithCancel(a.ctx)
    a.cancelLogStream = cancel

	reader, err := a.docker_client.ContainerLogs(logCtx, id, client.ContainerLogsOptions{
		ShowStdout: true,
		ShowStderr: true,
		Follow: true,
		Tail:  "50",
	})

	if err != nil {
		cancel()
		return err
	}

	go func() {
      defer reader.Close()
	  
	  scanner:= bufio.NewScanner(reader)

	  for scanner.Scan() {
		
 		line := scanner.Text()

		if len(line) > 8 {
			line = line[8:] 
		}
		runtime.EventsEmit(a.ctx, "container-log-line", line)
	  }

	  if err := scanner.Err(); err != nil {
		runtime.EventsEmit(a.ctx, "container-log-error", err.Error())
	 }
	}()

	return nil
}


func (a *App) StopContainerLogs(){
	if a.cancelLogStream != nil {
		a.cancelLogStream()
		a.cancelLogStream = nil
	}
}

func (a *App) ListImages() ([]ImageItem, error) {
	if a.docker_client == nil {
		return nil, fmt.Errorf("Docker client not connected")
	}

	rawImages, err := a.docker_client.ImageList(a.ctx, client.ImageListOptions{All: true})
	if err != nil {
		return nil, err
	}

	var items []ImageItem
	for _, img := range rawImages.Items{
		repo := "<none>"
		tag := "<none>"

		if len(img.RepoTags) > 0 && img.RepoTags[0] != "<none>:<none>" {
			parts := strings.Split(img.RepoTags[0], ":")
			if len(parts) == 2 {
				repo = parts[0]
				tag = parts[1]
			} else {
				repo = img.RepoTags[0]
			}
		}

 		cleanID := strings.TrimPrefix(img.ID, "sha256:")
		if len(cleanID) > 12 {
			cleanID = cleanID[:12]
		}

 		imgSize := formatBytes(img.Size)
  
		items = append(items, ImageItem{
			ID:         cleanID,
			Repository: repo,
			Tag:        tag,
			Size:       imgSize,
			SizeBytes:  img.Size,
			Created:    img.Created,
		})
	}

	return items, nil
}

func (a *App) PullImages(imageName string)error{
    CheckDockerClient(a.docker_client)
    if imageName == "" {
		return fmt.Errorf("Image name cant be empty")
	}

	reader, err := a.docker_client.ImagePull(a.ctx, imageName, client.ImagePullOptions{All: true})
	if err != nil {
		return err
	}

	defer reader.Close()

    decoder := json.NewDecoder(reader)

	for {
		var msg struct {
			ID string `json:"id"`
			Status string `json:"status"`
			ProgressString string `json:"progress"`
		}

		if err := decoder.Decode(&msg); err != nil {
              break
		}

		runtime.EventsEmit(a.ctx, "image-pull-progress", PullProgress{
			ID: msg.ID,
			Status: msg.Status,
			Progress: msg.ProgressString,
		})
	}
    
	runtime.EventsEmit(a.ctx, "image-pull-done", imageName)
	return nil
}

func (a *App) RemoveContainer(id string) (client.ContainerRemoveResult, error){
	CheckDockerClient(a.docker_client)

	return a.docker_client.ContainerRemove(a.ctx,id, client.ContainerRemoveOptions{
		Force: true,
	})
}

func (a *App) RemoveImage(id string) (client.ImageRemoveResult, error){
	CheckDockerClient(a.docker_client)

	return a.docker_client.ImageRemove(a.ctx, id, client.ImageRemoveOptions{
		Force: false,
	})
}

