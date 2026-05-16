# Tasks: High-Fidelity Response Viewer

## Phase 1: Setup
- [x] T001 Create component directory `frontend/src/components/Editor/ResponseViewer/`
- [x] T002 Update `executionStore.ts` to include `cookies` and `detailedTiming` fields in `frontend/src/state/executionStore.ts`

## Phase 2: Foundational
- [x] T003 Implement `CookieParser` utility in `frontend/src/utils/cookie-parser.ts`
- [x] T004 Implement `TimingFormatter` utility in `frontend/src/utils/timing-formatter.ts`

## Phase 3: [US1] JSON Exploration (Pretty View)
- [x] T005 [P] [US1] Implement `PrettyView.tsx` with expandable JSON tree in `frontend/src/components/Editor/ResponseViewer/PrettyView.tsx`
- [x] T006 [US1] Integrate syntax highlighting for XML/HTML in `PrettyView.tsx`

## Phase 4: [US2] Large Response Handling (Raw View)
- [x] T007 [P] [US2] Implement `RawView.tsx` using Monaco Editor in `frontend/src/components/Editor/ResponseViewer/RawView.tsx`
- [x] T008 [US2] Implement download action for very large responses in `RawView.tsx`

## Phase 5: [US3] Metadata & Tabs
- [x] T009 [P] [US3] Implement `HeaderGrid.tsx` with search functionality in `frontend/src/components/Editor/ResponseViewer/HeaderGrid.tsx`
- [x] T010 [P] [US3] Implement `CookieTable.tsx` for structured viewing in `frontend/src/components/Editor/ResponseViewer/CookieTable.tsx`
- [x] T011 [P] [US3] Implement `TimingChart.tsx` for visual breakdown in `frontend/src/components/Editor/ResponseViewer/TimingChart.tsx`

## Phase 6: [US4] Integration
- [x] T012 [US4] Refactor `ResponseViewer.tsx` to use the new sub-components in `frontend/src/components/Editor/ResponseViewer.tsx`
- [x] T013 [US4] Add "Copy to Clipboard" actions for Body, Headers, and Curl in `ResponseViewer.tsx`

## Phase 7: Polish
- [x] T014 Add smooth transitions between viewer modes
- [x] T015 Implement "Empty State" and "Loading State" enhancements
- [x] T016 Performance audit for 10MB+ responses
