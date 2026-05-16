# Tasks: Request History

## Phase 1: Setup
- [x] T001 Create `historyStore.ts` in `frontend/src/state/historyStore.ts`
- [x] T002 Update `backend/main.go` or `App.go` to provide a history persistence directory via Wails

## Phase 2: Foundational
- [x] T003 Implement `history-persistence.ts` utility in `frontend/src/utils/history-persistence.ts`
- [x] T004 Add `addHistoryEntry` logic to the execution flow in `frontend/src/components/Editor/FormEditor/MethodUrlBar.tsx`

## Phase 3: [US1] History UI (Sidebar)
- [x] T005 [P] [US1] Implement `HistorySidebar.tsx` with search input in `frontend/src/components/Sidebar/HistorySidebar.tsx`
- [x] T006 [P] [US1] Implement `HistoryItem.tsx` with status indicators and relative timestamps

## Phase 4: [US2] Virtualization & Performance
- [x] T007 [US2] Integrate `react-virtuoso` for history list rendering in `HistorySidebar.tsx`
- [x] T008 [US2] Implement debounced search for large history sets

## Phase 5: [US3] Interaction & Restoration
- [x] T009 [US3] Implement request restoration logic (History -> Editor) in `historyStore.ts`
- [x] T010 [US3] Add context menu for individual history item actions (Delete, Duplicate)

## Phase 6: Polish
- [x] T011 Add "Clear History" confirmation dialog
- [x] T012 Implement date-based grouping (Today, Yesterday, Last Week)
- [x] T013 Performance audit for history loading on startup
