package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"rester/backend/pkg/bootstrap"
	"rester/backend/pkg/executor"
)

func main() {
	filePtr := flag.String("file", "", "Path to the .http file")
	envPtr := flag.String("env", "", "Environment name")
	flag.Parse()

	if *filePtr == "" {
		fmt.Println("Usage: rester-cli -file <path> [-env <name>]")
		os.Exit(1)
	}

	fmt.Println("Rester CLI - Headless Mode")

	// 1. Initialize core services via container
	container, err := bootstrap.NewContainer("cli.db")
	if err != nil {
		fmt.Printf("Failed to initialize container: %v\n", err)
		os.Exit(1)
	}
	
	// Set workspace to the directory of the file for environment loading
	dir := ""
	if info, err := os.Stat(*filePtr); err == nil && !info.IsDir() {
		dir =  filepath.Dir(*filePtr)
	}
	if mgr, ok := container.Environment.(interface{ SetWorkspace(string) }); ok && dir != "" {
		mgr.SetWorkspace(dir)
	}

	// 2. Create Runner
	runner := executor.NewRunner(container.Parser, container.Executor, container.Environment)

	// 3. Execute
	fmt.Printf("Executing file: %s (Env: %s)...\n", *filePtr, *envPtr)
	resp, err := runner.RunFile(context.Background(), *filePtr, *envPtr)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("\nStatus: %d %s\n", resp.Status, resp.StatusText)
	fmt.Printf("Time: %d ms\n", resp.Timing.Total)
	
	if len(resp.TestResults) > 0 {
		fmt.Println("\nTest Results:")
		for _, tr := range resp.TestResults {
			status := "PASS"
			if !tr.Passed {
				status = "FAIL"
			}
			fmt.Printf("[%s] %s %s\n", status, tr.Name, tr.Message)
		}
	}

	fmt.Println("\nResponse Body:")
	fmt.Println(resp.Body)
}
