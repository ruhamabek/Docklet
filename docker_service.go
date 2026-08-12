package main

import (
	"fmt"

	"github.com/moby/moby/client"
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