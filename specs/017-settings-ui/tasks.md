# Tasks: Settings UI

## Phase 1: Setup
- [x] T001 Create `settingsStore.ts` in `frontend/src/state/settingsStore.ts`
- [x] T002 Implement backend bridge for `config.json` persistence in `backend/app.go`

## Phase 2: Foundational
- [x] T003 Implement `config-bridge.ts` utility in `frontend/src/utils/config-bridge.ts`
- [x] T004 Integrate `settingsStore` with `App.tsx` for theme management

## Phase 3: [US1] Settings UI (Modal)
- [x] T005 [P] [US1] Implement `SettingsModal.tsx` with category navigation in `frontend/src/components/Settings/SettingsModal.tsx`
- [x] T006 [P] [US1] Implement `GeneralSettings.tsx` (Theme, Language)
- [x] T007 [P] [US1] Implement `EditorSettings.tsx` (Monaco options)
- [x] T008 [P] [US1] Implement `RequestSettings.tsx` (Timeouts)

## Phase 4: [US2] Feature Integration
- [x] T009 [US2] Update `backend/pkg/executor/executor.go` to respect global timeout setting
- [x] T010 [US2] Update Monaco Editor components to subscribe to `EditorSettings`

## Phase 5: [US3] Advanced Sections
- [x] T011 [US3] Implement `ShortcutSection.tsx` listing all app shortcuts
- [x] T012 [US3] Implement "Import/Export" data functionality

## Phase 6: Polish
- [x] T013 Add "Reset to Defaults" button in Settings
- [x] T014 Performance audit for settings loading on startup
- [x] T015 Add smooth entrance/exit animations for the settings modal
