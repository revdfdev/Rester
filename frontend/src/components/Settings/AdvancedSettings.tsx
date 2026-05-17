import React, { useState, useEffect } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle2, Loader2, Terminal, FileJson } from 'lucide-react';
import { useStore } from '../../state/store';
import { Button } from '../common/Button';
import { convertCurlToHttpFormat } from '../../utils/curl-parser';

type TabType = 'curl' | 'postman';

export const AdvancedSettings: React.FC = () => {
  const resetToDefaults = useStore((state) => state.resetToDefaults);
  const addTab = useStore((state) => state.addTab);
  const setSettingsOpen = useStore((state) => state.setSettingsOpen);
  const refreshWorkspace = useStore((state) => state.refreshWorkspace);
  
  const [activeTab, setActiveTab] = useState<TabType>('curl');
  const [curlCommand, setCurlCommand] = useState('');
  const [workspacePath, setWorkspacePath] = useState<string>('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', msg: string } | null>(null);

  // Load active workspace path on mount dynamically
  useEffect(() => {
    const fetchWorkspace = async () => {
      try {
        const { GetCurrentWorkspace } = await import('../../wailsjs/go/handlers/WorkspaceHandler');
        const path = await GetCurrentWorkspace();
        setWorkspacePath(path || '');
      } catch (err) {
        console.error('Failed to get current workspace path:', err);
      }
    };
    fetchWorkspace();
  }, []);

  const handleParseCurl = () => {
    if (!curlCommand.trim()) {
      setStatus({ type: 'error', msg: 'Please paste a valid cURL command first.' });
      return;
    }

    setStatus({ type: 'loading', msg: 'Parsing cURL command...' });

    try {
      const httpContent = convertCurlToHttpFormat(curlCommand);
      const tabId = `curl-${Date.now()}`;
      
      // Add the new request tab
      addTab({
        id: tabId,
        name: 'cURL Import',
        type: 'http',
        path: '',
        isDirty: true,
        content: httpContent
      });

      setStatus({ type: 'success', msg: 'cURL parsed and imported successfully!' });
      setCurlCommand('');
      
      // Auto close settings modal after short delay to show the new tab
      setTimeout(() => {
        setSettingsOpen(false);
      }, 1000);
    } catch (err: any) {
      setStatus({ type: 'error', msg: `Failed to parse cURL: ${err.message || err}` });
    }
  };

  const handleImportPostmanCollection = async () => {
    if (!workspacePath) {
      setStatus({ type: 'error', msg: 'Please open a workspace directory first.' });
      return;
    }

    try {
      const App = await import('../../wailsjs/go/main/App');
      const fileToImport = await (App as any).SelectFile('Postman Collection (*.json)', '*.json');
      if (!fileToImport) return;

      setStatus({ type: 'loading', msg: 'Importing Postman collection...' });
      
      const ImportExportHandler = await import('../../wailsjs/go/handlers/ImportExportHandler');
      await ImportExportHandler.ImportPostmanCollection(fileToImport, workspacePath);
      await refreshWorkspace();
      
      setStatus({ type: 'success', msg: 'Postman collection imported successfully!' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: `Import failed: ${err.message || err}` });
    }
  };

  const handleImportPostmanEnvironment = async () => {
    if (!workspacePath) {
      setStatus({ type: 'error', msg: 'Please open a workspace directory first.' });
      return;
    }

    try {
      const App = await import('../../wailsjs/go/main/App');
      const fileToImport = await (App as any).SelectFile('Postman Environment (*.json)', '*.json');
      if (!fileToImport) return;

      setStatus({ type: 'loading', msg: 'Importing Postman environment...' });
      
      const ImportExportHandler = await import('../../wailsjs/go/handlers/ImportExportHandler');
      await ImportExportHandler.ImportPostmanEnvironment(fileToImport, workspacePath);
      await refreshWorkspace();
      
      setStatus({ type: 'success', msg: 'Postman environment imported successfully!' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: `Import failed: ${err.message || err}` });
    }
  };

  const handleExportWorkspace = async () => {
    if (!workspacePath) {
      setStatus({ type: 'error', msg: 'Please open a workspace directory first.' });
      return;
    }

    try {
      const App = await import('../../wailsjs/go/main/App');
      const workspaceName = workspacePath.split(/[\\/]/).pop() || 'workspace';
      const zipDestination = await (App as any).SelectSaveFile('Workspace Zip Archive (*.zip)', `${workspaceName}-backup.zip`, '*.zip');
      if (!zipDestination) return;

      setStatus({ type: 'loading', msg: 'Packaging workspace to zip...' });
      
      const ImportExportHandler = await import('../../wailsjs/go/handlers/ImportExportHandler');
      await ImportExportHandler.ExportWorkspace(workspacePath, zipDestination);
      
      setStatus({ type: 'success', msg: 'Workspace exported successfully!' });
    } catch (err: any) {
      setStatus({ type: 'error', msg: `Export failed: ${err.message || err}` });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Sub Tabs */}
      <div className="flex border-b border-dark-850 p-0.5 bg-dark-950/60 rounded-xl">
        <button
          onClick={() => { setActiveTab('curl'); setStatus(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${
            activeTab === 'curl'
              ? 'bg-dark-900 text-brand-primary border-b border-brand-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Terminal size={12} />
          cURL Converter
        </button>
        <button
          onClick={() => { setActiveTab('postman'); setStatus(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-wider transition-all rounded-lg ${
            activeTab === 'postman'
              ? 'bg-dark-900 text-brand-primary border-b border-brand-primary shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <FileJson size={12} />
          Workspace Portability
        </button>
      </div>

      {status && (
        <div className={`p-3 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
          status.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
          'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
        }`}>
          <div className="p-1.5 bg-white/5 rounded-full flex-shrink-0">
            {status.type === 'loading' ? <Loader2 className="animate-spin" size={14} /> :
             status.type === 'success' ? <CheckCircle2 size={14} /> :
             <AlertTriangle size={14} />}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider leading-none">{status.msg}</span>
        </div>
      )}

      {/* Tabs Content */}
      {activeTab === 'curl' ? (
        <section className="space-y-4">
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">cURL Command Parser</h3>
            <p className="text-[9px] text-slate-500 mt-1">Paste any standard cURL command to instantly generate an AST-backed visual request form.</p>
          </div>

          <div className="relative group">
            <textarea
              value={curlCommand}
              onChange={(e) => setCurlCommand(e.target.value)}
              placeholder="curl -X POST https://api.example.com/v1/users \
  -H 'Content-Type: application/json' \
  -d '{&quot;name&quot;: &quot;Alice&quot;}'"
              className="w-full h-44 bg-dark-950/80 border border-dark-800 rounded-2xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-brand-primary/40 focus:ring-1 focus:ring-brand-primary/10 placeholder:text-slate-600 transition-all resize-none shadow-inner"
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleParseCurl}
              className="px-6 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-md shadow-brand-primary/15"
            >
              Parse & Import
            </Button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Postman & Workspaces</h3>
            <p className="text-[9px] text-slate-500 mt-1">Seamlessly migrate your existing configurations or backup portable folders without lock-in.</p>
          </div>

          {!workspacePath && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 flex-shrink-0" size={16} />
              <div>
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">No Active Workspace</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Please open a workspace directory folder from the sidebar first to enable backup imports and exports.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {/* Import Postman Collection */}
            <div className={`p-4 bg-dark-900/30 border border-dark-800/80 rounded-2xl flex items-center justify-between group hover:border-brand-primary/30 transition-all ${!workspacePath ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">Import Postman Collection</p>
                <p className="text-[9px] text-slate-500">Converts folders and requests to .http files</p>
              </div>
              <button
                disabled={!workspacePath}
                onClick={handleImportPostmanCollection}
                className="p-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl transition-all hover:scale-105"
                title="Select collection file"
              >
                <Upload size={16} />
              </button>
            </div>

            {/* Import Postman Environment */}
            <div className={`p-4 bg-dark-900/30 border border-dark-800/80 rounded-2xl flex items-center justify-between group hover:border-brand-primary/30 transition-all ${!workspacePath ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">Import Postman Environment</p>
                <p className="text-[9px] text-slate-500">Appends environments to http-client.env.json</p>
              </div>
              <button
                disabled={!workspacePath}
                onClick={handleImportPostmanEnvironment}
                className="p-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl transition-all hover:scale-105"
                title="Select environment file"
              >
                <Upload size={16} />
              </button>
            </div>

            {/* Export Workspace */}
            <div className={`p-4 bg-dark-900/30 border border-dark-800/80 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all ${!workspacePath ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-200 uppercase tracking-tight">Export Workspace ZIP</p>
                <p className="text-[9px] text-slate-500">Bundles active folder into a portable .zip</p>
              </div>
              <button
                disabled={!workspacePath}
                onClick={handleExportWorkspace}
                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl transition-all hover:scale-105"
                title="Export entire folder"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Danger Zone */}
      <section className="pt-6 border-t border-dark-850">
        <h4 className="text-[10px] font-black text-rose-500 mb-3 uppercase tracking-widest flex items-center gap-1.5">
          <AlertTriangle size={12} />
          Danger Zone
        </h4>
        <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between group hover:border-rose-500/20 transition-colors">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-250">Reset Configuration</p>
            <p className="text-[9px] text-slate-500 font-medium">Revert all themes, editor shortcuts, and layout settings to default.</p>
          </div>
          <Button 
            variant="danger" 
            size="xs"
            className="rounded-lg font-black text-[9px] tracking-wider uppercase"
            onClick={() => {
              if (confirm('Are you sure you want to reset all configurations to default? This action is permanent.')) {
                resetToDefaults();
                setStatus({ type: 'success', msg: 'Configuration reset successfully.' });
              }
            }}
          >
            Reset
          </Button>
        </div>
      </section>
    </div>
  );
};
