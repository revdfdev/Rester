package storage

import (
	"github.com/fsnotify/fsnotify"
	"log"
)

type WorkspaceWatcher struct {
	watcher *fsnotify.Watcher
	onEvent func(event fsnotify.Event)
}

func NewWorkspaceWatcher(onEvent func(event fsnotify.Event)) (*WorkspaceWatcher, error) {
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		return nil, err
	}

	return &WorkspaceWatcher{
		watcher: watcher,
		onEvent: onEvent,
	}, nil
}

func (w *WorkspaceWatcher) Watch(path string) error {
	return w.watcher.Add(path)
}

func (w *WorkspaceWatcher) Start() {
	go func() {
		for {
			select {
			case event, ok := <-w.watcher.Events:
				if !ok {
					return
				}
				if w.onEvent != nil {
					w.onEvent(event)
				}
			case err, ok := <-w.watcher.Errors:
				if !ok {
					return
				}
				log.Println("Watcher error:", err)
			}
		}
	}()
}

func (w *WorkspaceWatcher) Close() error {
	return w.watcher.Close()
}
