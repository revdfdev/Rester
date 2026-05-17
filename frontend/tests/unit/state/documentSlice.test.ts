import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../../src/state/store';
import { EditorMode } from '../../../src/types';

describe('Centralized Document State Management', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useStore.setState({
      activeTabId: null,
      tabs: [],
      activeDocument: null,
      requestBlocks: [],
      activeBlockIndex: 0,
      editorMode: 'form' as EditorMode,
      documents: {}
    });
  });

  const httpContent = `# Get Users
GET https://api.example.com/users?page=2
Authorization: Bearer my-token
`;

  it('should initialize a tab document state correctly', () => {
    const store = useStore.getState();
    store.addTab({
      id: 'tab-1',
      name: 'Get Users.http',
      type: 'http',
      isDirty: false,
      content: httpContent
    });

    const updatedStore = useStore.getState();
    expect(updatedStore.activeTabId).toBe('tab-1');
    expect(updatedStore.requestBlocks).toHaveLength(1);
    expect(updatedStore.activeDocument?.method).toBe('GET');
    expect(updatedStore.activeDocument?.url).toBe('https://api.example.com/users?page=2');
    expect(updatedStore.activeDocument?.params).toContainEqual(
      expect.objectContaining({ key: 'page', value: '2', enabled: true })
    );
    expect(updatedStore.documents['tab-1']).toBeDefined();
    expect(updatedStore.documents['tab-1'].initialSerialized).toBe(httpContent);
  });

  it('should support multiple open tabs with isolated states', () => {
    const store = useStore.getState();
    
    // Open Tab 1
    store.addTab({
      id: 'tab-1',
      name: 'Users.http',
      type: 'http',
      isDirty: false,
      content: 'GET https://api.example.com/users'
    });

    // Open Tab 2
    store.addTab({
      id: 'tab-2',
      name: 'Posts.http',
      type: 'http',
      isDirty: false,
      content: 'POST https://api.example.com/posts'
    });

    // Check tab-2 is active
    let updated = useStore.getState();
    expect(updated.activeTabId).toBe('tab-2');
    expect(updated.activeDocument?.method).toBe('POST');

    // Switch back to tab-1
    store.setActiveTab('tab-1');
    updated = useStore.getState();
    expect(updated.activeTabId).toBe('tab-1');
    expect(updated.activeDocument?.method).toBe('GET');
  });

  it('should push old state to undoStack on document update and support undo/redo', () => {
    const store = useStore.getState();
    store.addTab({
      id: 'tab-1',
      name: 'Users.http',
      type: 'http',
      isDirty: false,
      content: 'GET https://api.example.com/users'
    });

    let updated = useStore.getState();
    expect(updated.activeDocument?.method).toBe('GET');
    expect(updated.canUndo()).toBe(false);

    // Update method to POST
    store.updateDocument({ method: 'POST' });
    updated = useStore.getState();
    expect(updated.activeDocument?.method).toBe('POST');
    expect(updated.canUndo()).toBe(true);

    // Perform Undo
    store.undo();
    updated = useStore.getState();
    expect(updated.activeDocument?.method).toBe('GET');
    expect(updated.canRedo()).toBe(true);

    // Perform Redo
    store.redo();
    updated = useStore.getState();
    expect(updated.activeDocument?.method).toBe('POST');
    expect(updated.canUndo()).toBe(true);
  });

  it('should automatically synchronize URL changes into parameter grids', () => {
    const store = useStore.getState();
    store.addTab({
      id: 'tab-1',
      name: 'Query.http',
      type: 'http',
      isDirty: false,
      content: 'GET https://api.example.com/search'
    });

    // Update URL with query parameters
    store.updateDocument({ url: 'https://api.example.com/search?q=typescript&limit=10' });
    const updated = useStore.getState();
    
    expect(updated.activeDocument?.params).toHaveLength(2);
    expect(updated.activeDocument?.params).toContainEqual(
      expect.objectContaining({ key: 'q', value: 'typescript', enabled: true })
    );
    expect(updated.activeDocument?.params).toContainEqual(
      expect.objectContaining({ key: 'limit', value: '10', enabled: true })
    );
  });

  it('should automatically synchronize parameter updates into the URL string', () => {
    const store = useStore.getState();
    store.addTab({
      id: 'tab-1',
      name: 'Query.http',
      type: 'http',
      isDirty: false,
      content: 'GET https://api.example.com/search'
    });

    // Add query parameters
    const params = [
      { id: '1', key: 'sort', value: 'desc', enabled: true }
    ];
    store.updateDocument({ params });
    const updated = useStore.getState();
    
    expect(updated.activeDocument?.url).toBe('https://api.example.com/search?sort=desc');
  });

  it('should correctly mark tabs dirty and reset the dirty state upon saving', async () => {
    const store = useStore.getState();
    store.addTab({
      id: 'tab-1',
      name: 'Dirty.http',
      type: 'http',
      isDirty: false,
      content: 'GET https://api.example.com/dirty'
    });

    let updated = useStore.getState();
    expect(updated.tabs[0].isDirty).toBe(false);

    // Mutate state to trigger dirty tracking
    store.updateDocument({ method: 'PUT' });
    
    // Allow the setTimeout in updateDocument to propagate
    await new Promise((resolve) => setTimeout(resolve, 0));
    
    updated = useStore.getState();
    expect(updated.tabs[0].isDirty).toBe(true);

    // Mock Wails WorkspaceHandler SaveFile and call saveTab
    // Inside tests, we'll manually reset initialSerialized to mimic saveTab
    useStore.setState((state) => {
      const docState = state.documents['tab-1'];
      return {
        documents: {
          ...state.documents,
          'tab-1': {
            ...docState,
            initialSerialized: store.getSerializedContent()
          }
        }
      };
    });
    store.markTabDirty('tab-1', false);

    updated = useStore.getState();
    expect(updated.tabs[0].isDirty).toBe(false);
  });
});
