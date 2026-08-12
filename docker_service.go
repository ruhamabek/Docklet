package main

import (
	"bufio"
	"context"
	"fmt"

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