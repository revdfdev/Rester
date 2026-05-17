import React, { useState } from 'react';
import { Globe, Plus, Trash2, Key, Check, AlertCircle, Database } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useStore } from '../../state/store';
import { EnvironmentNode } from '../../types';

export const EnvironmentModal: React.FC = () => {
  const isEnvironmentModalOpen = useStore((state) => state.isEnvironmentModalOpen);
  const setEnvironmentModalOpen = useStore((state) => state.setEnvironmentModalOpen);
  const environments = useStore((state) => state.environments);
  const createEnvironment = useStore((state) => state.createEnvironment);
  const deleteEnvironment = useStore((state) => state.deleteEnvironment);
  const updateEnvironmentVariable = useStore((state) => state.updateEnvironmentVariable);
  const deleteEnvironmentVariable = useStore((state) => state.deleteEnvironmentVariable);
  
  const [selectedEnvId, setSelectedEnvId] = useState<string | null>(null);
  const [newEnvName, setNewEnvName] = useState('');
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selectedEnv = environments.find(e => e.id === selectedEnvId) || environments[0] || null;

  // Auto select first environment if none selected
  if (!selectedEnvId && environments.length > 0) {
    setSelectedEnvId(environments[0].id);
  }

  const handleCreateEnv = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newEnvName.trim()) return;

    if (environments.find(env => env.name.toLowerCase() === newEnvName.trim().toLowerCase())) {
      setError('An environment with this name already exists.');
      return;
    }

    await createEnvironment(newEnvName.trim());
    setSelectedEnvId(newEnvName.trim());
    setNewEnvName('');
  };

  const handleAddVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnv || !newVarKey.trim()) return;

    await updateEnvironmentVariable(selectedEnv.name, newVarKey.trim(), newVarKey.trim(), newVarValue);
    setNewVarKey('');
    setNewVarValue('');
  };

  return (
    <Modal
      isOpen={isEnvironmentModalOpen}
      onClose={() => setEnvironmentModalOpen(false)}
      title="Environment Manager"
      maxWidth="4xl"
    >
      <div className="flex -m-8 h-[550px]">
        {/* Left Column: Environments list */}
        <div className="w-72 bg-dark-900/30 border-r border-dark-800 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-3">Environments</h4>
              <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                {environments.map((env) => {
                  const isSelected = selectedEnv?.id === env.id;
                  return (
                    <div
                      key={env.id}
                      onClick={() => setSelectedEnvId(env.id)}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-brand-primary text-dark-950 shadow-lg shadow-brand-primary/20' 
                          : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Globe size={14} className={isSelected ? 'text-dark-950' : 'text-slate-500'} />
                        <span className="truncate">{env.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEnvironment(env.name);
                          if (selectedEnvId === env.id) {
                            setSelectedEnvId(null);
                          }
                        }}
                        className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-dark-850 transition-all ${
                          isSelected ? 'hover:bg-brand-primary/20 text-dark-950' : 'text-slate-500 hover:text-red-400'
                        }`}
                        title="Delete Environment"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
                {environments.length === 0 && (
                  <p className="text-[10px] text-slate-600 italic">No environments defined.</p>
                )}
              </div>
            </div>

            {/* Create Environment Form */}
            <form onSubmit={handleCreateEnv} className="pt-4 border-t border-dark-800/50">
              <h5 className="text-[9px] font-black tracking-widest text-slate-500 uppercase mb-2">Create New</h5>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. staging"
                  value={newEnvName}
                  onChange={(e) => setNewEnvName(e.target.value)}
                  className="flex-1 min-w-0 bg-dark-950 border border-dark-800/80 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand-primary/40 focus:bg-dark-900 transition-all"
                />
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary/95 text-dark-950 font-bold p-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  <Plus size={16} />
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-1 mt-2 text-[10px] text-red-400 font-bold">
                  <AlertCircle size={10} />
                  <span>{error}</span>
                </div>
              )}
            </form>
          </div>

          <div className="pt-4 border-t border-dark-800/30">
            <div className="flex items-center gap-2 px-3 py-2 bg-dark-950/40 rounded-xl border border-dark-800/50">
              <Database size={14} className="text-brand-primary" />
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-wider">http-client.env.json</p>
            </div>
          </div>
        </div>

        {/* Right Column: Variables Table */}
        <div className="flex-1 p-8 flex flex-col justify-between overflow-hidden">
          {selectedEnv ? (
            <div className="flex flex-col h-full overflow-hidden">
              <header className="mb-6 flex-shrink-0">
                <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-3">
                  {selectedEnv.name} Variables
                  <div className="h-1 flex-1 bg-gradient-to-r from-brand-primary/20 to-transparent rounded-full ml-4" />
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Manage variables for this environment. Double-click keys or values to edit them.
                </p>
              </header>

              {/* Variables Table */}
              <div className="flex-1 overflow-y-auto custom-scrollbar border border-dark-800/30 rounded-xl bg-dark-950/20 p-2">
                <div className="space-y-1">
                  {Object.entries(selectedEnv.variables || {}).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2 p-1 bg-dark-900/30 border border-dark-850/50 rounded-xl">
                      <div className="flex items-center gap-1 text-slate-500 pl-2">
                        <Key size={12} className="text-brand-primary/60" />
                      </div>
                      
                      {/* Key Input */}
                      <input
                        type="text"
                        defaultValue={key}
                        onBlur={(e) => {
                          const newKey = e.target.value.trim();
                          if (newKey && newKey !== key) {
                            updateEnvironmentVariable(selectedEnv.name, key, newKey, val);
                          } else {
                            e.target.value = key; // Reset
                          }
                        }}
                        className="flex-1 min-w-0 bg-transparent text-xs font-bold text-slate-200 border-none outline-none focus:ring-0 px-2 py-1 rounded"
                      />

                      <div className="h-4 w-px bg-dark-800" />

                      {/* Value Input */}
                      <input
                        type="text"
                        defaultValue={val}
                        onBlur={(e) => {
                          const newVal = e.target.value;
                          if (newVal !== val) {
                            updateEnvironmentVariable(selectedEnv.name, key, key, newVal);
                          }
                        }}
                        className="flex-1 min-w-0 bg-transparent text-xs text-slate-400 border-none outline-none focus:ring-0 px-2 py-1 rounded"
                      />

                      <button
                        onClick={() => deleteEnvironmentVariable(selectedEnv.name, key)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-dark-800/50 transition-colors mr-1"
                        title="Delete Variable"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {Object.keys(selectedEnv.variables || {}).length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                      <Key size={20} className="text-slate-700 mb-2" />
                      <p className="text-[10px] text-slate-500">No variables defined in this environment.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Add Variable Form */}
              <form onSubmit={handleAddVariable} className="mt-4 pt-4 border-t border-dark-800/50 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Variable Key (e.g. host)"
                    value={newVarKey}
                    onChange={(e) => setNewVarKey(e.target.value)}
                    className="flex-1 min-w-0 bg-dark-950 border border-dark-800/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-primary/40 focus:bg-dark-900 transition-all font-bold"
                  />
                  <input
                    type="text"
                    placeholder="Variable Value"
                    value={newVarValue}
                    onChange={(e) => setNewVarValue(e.target.value)}
                    className="flex-1 min-w-0 bg-dark-950 border border-dark-800/80 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand-primary/40 focus:bg-dark-900 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newVarKey.trim()}
                    className="flex items-center gap-1.5 px-4 bg-brand-primary hover:bg-brand-primary/95 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800 text-dark-950 font-bold text-xs rounded-lg transition-all"
                  >
                    <Plus size={14} />
                    Add
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Globe size={32} className="text-slate-700 mb-4 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-400 mb-1">No Environment Selected</h3>
              <p className="text-[10px] text-slate-500 max-w-sm leading-relaxed">
                Select an environment from the left list or create a new one to begin editing variables.
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
