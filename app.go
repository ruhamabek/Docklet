package main

import (
	"context"
	"fmt"
	"github.com/moby/moby/client"
)

// App struct
type App struct {
	ctx context.Context
	docker_client *client.Client
}

// NewApp creates a new App application struct
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

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
