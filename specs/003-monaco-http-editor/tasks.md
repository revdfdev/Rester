# Tasks: Dual-Mode Request Editor

## Phase 1: Setup
- [x] T001 Create `editorStore.ts` for dual-mode state in `frontend/src/state/editorStore.ts`
- [x] T002 [P] Implement `http-parser.ts` utility in `frontend/src/utils/http-parser.ts`
- [x] T003 [P] Implement `http-serializer.ts` utility in `frontend/src/utils/http-serializer.ts`

## Phase 2: Foundational
- [x] T004 Implement `syncFormToText` and `syncTextToForm` logic in `frontend/src/state/editorStore.ts`
- [x] T005 Add unit tests for parser/serializer in `frontend/tests/unit/utils/http-sync.test.ts`

## Phase 3: [US1] Mode Switching
- [x] T006 [P] [US1] Implement `ModeToggle` component in `frontend/src/components/Editor/ModeToggle.tsx`
- [x] T007 [US1] Update `RequestEditor.tsx` to handle conditional rendering in `frontend/src/components/Editor/RequestEditor.tsx`

## Phase 4: [US2] Core Form UI
- [x] T008 [P] [US2] Implement `MethodUrlBar` in `frontend/src/components/Editor/FormEditor/MethodUrlBar.tsx`
- [x] T009 [P] [US2] Implement `KeyValueGrid` for headers and params in `frontend/src/components/Editor/FormEditor/KeyValueGrid.tsx`
- [x] T010 [US2] Assemble the `FormEditor` main layout in `frontend/src/components/Editor/FormEditor/FormEditor.tsx`

## Phase 5: [US3] Scripting Tabs
- [x] T011 [P] [US3] Implement `ScriptTabs` component in `frontend/src/components/Editor/FormEditor/ScriptTabs.tsx`
- [x] T012 [US3] Extend parser/serializer to handle script blocks in `frontend/src/utils/http-parser.ts`

## Phase 6: [US4] Request Navigator
- [x] T013 [P] [US4] Implement `RequestNavigator` component in `frontend/src/components/common/RequestNavigator.tsx`
- [x] T014 [US4] Implement multi-block extraction logic in `frontend/src/state/editorStore.ts`

## Phase 7: [US5] Environment Sync
- [x] T015 [P] [US5] Implement `EnvironmentSelector` in `frontend/src/components/Header/EnvironmentSelector.tsx`
- [x] T016 [US5] Implement `VariableResolver` utility in `frontend/src/utils/variable-resolver.ts`

## Phase 8: Polish
- [x] T017 Add smooth transitions for mode switching in `frontend/src/components/Editor/RequestEditor.tsx`
- [x] T018 Implement debounced auto-save for Form UI changes in `frontend/src/state/editorStore.ts`
