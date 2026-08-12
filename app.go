package main

import (
 	"context"
	"fmt"
 
	"github.com/moby/moby/client"
 )

 type App struct {
	ctx context.Context
	docker_client *client.Client
	cancelLogStream context.CancelFunc
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

