# Requirements Checklist: Collections Explorer Sidebar

## Core Explorer
- [ ] Folder tree structure supports arbitrary depth
- [ ] Folders can be collapsed/expanded
- [ ] .http files have distinct icons
- [ ] Active file is visually highlighted
- [ ] Hover states provide visual feedback

## Environment Management
- [ ] Environments section is clearly separated
- [ ] Active environment is indicated
- [ ] Environment switching is responsive

## Actions & Interactivity
- [ ] Context menu appears on right-click
- [ ] Inline renaming is supported
- [ ] Deletion requires confirmation or is easily undoable
- [ ] Keyboard navigation (Arrows/Enter) works as expected

## Performance & Technical
- [ ] Large collections (1000+ items) render smoothly
- [ ] No unnecessary re-renders when toggling folders
- [ ] State is managed centrally via Zustand
