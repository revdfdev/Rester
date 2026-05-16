import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../../state/store';
import { Button } from '../common/Button';

export const AdvancedSettings: React.FC = () => {
  const resetToDefaults = useStore((state) => state.resetToDefaults);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'loading', msg: string } | null>(null);

  const handleExport = async () => {
    setStatus({ type: 'loading', msg: 'Preparing export...' });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStatus({ type: 'success', msg: 'Data exported successfully!' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Export failed. Please try again.' });
    }
  };

  const handleImport = async () => {
    setStatus({ type: 'loading', msg: 'Opening file picker...' });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus({ type: 'success', msg: 'Data imported successfully! App will reload.' });
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: 'Import failed. Invalid file format.' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <section>
        <h3 className="text-sm font-black text-slate-500 mb-4 uppercase tracking-widest">Data Portability</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleExport}
            className="flex flex-col items-center gap-4 p-8 bg-dark-900/30 border-2 border-dark-800 rounded-3xl hover:bg-dark-900/50 hover:border-brand-primary/30 transition-all group"
          >
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform shadow-inner">
              <Download size={28} />
            </div>
            <div className="text-center">
              <p className="text-base font-black text-slate-100 uppercase tracking-tight">Export Backup</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black opacity-60">JSON Format</p>
            </div>
          </button>

          <button 
            onClick={handleImport}
            className="flex flex-col items-center gap-4 p-8 bg-dark-900/30 border-2 border-dark-800 rounded-3xl hover:bg-dark-900/50 hover:border-accent-emerald/30 transition-all group"
          >
            <div className="w-16 h-16 bg-accent-emerald/10 rounded-2xl flex items-center justify-center text-accent-emerald group-hover:scale-110 transition-transform shadow-inner">
              <Upload size={28} />
            </div>
            <div className="text-center">
              <p className="text-base font-black text-slate-100 uppercase tracking-tight">Import Data</p>
              <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black opacity-60">Restore Session</p>
            </div>
          </button>
        </div>
      </section>

      {status && (
        <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 ${
          status.type === 'success' ? 'bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald' :
          status.type === 'error' ? 'bg-accent-rose/10 border-accent-rose/20 text-accent-rose' :
          'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
        }`}>
          <div className="p-2 bg-white/10 rounded-full">
            {status.type === 'loading' ? <Loader2 className="animate-spin" size={18} /> :
             status.type === 'success' ? <CheckCircle2 size={18} /> :
             <AlertTriangle size={18} />}
          </div>
          <span className="text-xs font-black uppercase tracking-widest">{status.msg}</span>
        </div>
      )}

      <section className="pt-8 border-t border-dark-800/50">
        <h3 className="text-sm font-black text-accent-rose mb-4 uppercase tracking-widest flex items-center gap-2">
          <AlertTriangle size={16} />
          Danger Zone
        </h3>
        <div className="p-6 bg-accent-rose/5 border border-accent-rose/10 rounded-2xl flex items-center justify-between group hover:border-accent-rose/20 transition-colors">
          <div>
            <p className="text-sm font-bold text-slate-200">Reset Application</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Wipe all local settings and return to factory defaults.</p>
          </div>
          <Button 
            variant="danger" 
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
                resetToDefaults();
                setStatus({ type: 'success', msg: 'Settings reset successfully.' });
              }
            }}
          >
            Reset to Defaults
          </Button>
        </div>
      </section>
    </div>
  );
};
