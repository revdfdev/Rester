# Specification: Filesystem-First REST Workspace Architecture

## Goal
Establish a real-time, filesystem-first workspace structure in Rester that guarantees perfect synchronization between files on disk and the UI sidebar collection tree explorer, mirroring standard premium IDE workspaces.

## Requirements
- Filesystem serves as the absolute canonical source of truth.
- Requests stored as `.http` files.
- Visual forms edit filesystem-backed `ActiveDocuments` directly.
- Dynamic recursive file watcher automatically triggers Wails events on modifications.
- React frontend automatically reloads sidebar on file changes.
- Save operations enforce exactly one `.http` extension dynamically.
- SQLite is retained exclusively for request history, sessions, and recent workspaces.
