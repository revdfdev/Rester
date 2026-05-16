package main

import (
	"embed"
	"rester/backend/handlers"
	"rester/backend/pkg/bootstrap"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// 1. Initialize core services
	container := bootstrap.NewContainer()

	// 2. Create bridge handlers
	app := NewApp(container)
	executionHandler := handlers.NewExecutionHandler(container)
	workspaceHandler := handlers.NewWorkspaceHandler(container)
	importExportHandler := handlers.NewImportExportHandler(container)

	// 3. Create application with options
	err := wails.Run(&options.App{
		Title:  "Rester",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
			executionHandler,
			workspaceHandler,
			importExportHandler,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
