package main

import (
	"context"
	"fmt"

	"github.com/moby/moby/client"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

 type App struct {
	ctx context.Context
	docker_client *client.Client
}

 func NewApp() *App {
	cli, err := client.New(
		client.FromEnv,
	)

	if err != nil {
		fmt.Printf("Couldnt connect to docker: %v", err)
	}

	return &App{
		docker_client: cli,
	}

}
 
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	go a.listenToDockerEvents()
}

 func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
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