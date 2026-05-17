import React, { useState } from 'react';
import { useStore } from '../../state/store';
import { Lock, Key, User, Shield } from 'lucide-react';
import { cn } from '../../utils/cn';

type AuthType = 'none' | 'bearer' | 'basic';

export const AuthEditor: React.FC = () => {
  const activeDocument = useStore((state) => state.activeDocument);
  const setAuth = useStore((state) => state.setAuth);
  const [authType, setAuthType] = useState<AuthType>('none');

  if (!activeDocument) return null;

  return (
    <div className="flex flex-col gap-6 p-6 bg-dark-900/50 rounded-3xl border border-dark-800/50 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Authentication</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Security Protocol</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'none', label: 'No Auth', icon: Shield },
          { id: 'bearer', label: 'Bearer Token', icon: Key },
          { id: 'basic', label: 'Basic Auth', icon: User },
        ].map((type) => (
          <button
            key={type.id}
            onClick={() => setAuthType(type.id as AuthType)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
              authType === type.id 
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400" 
                : "bg-dark-950/40 border-dark-800 text-slate-500 hover:border-dark-700 hover:text-slate-400"
            )}
          >
            <type.icon size={18} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{type.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 bg-dark-950/40 rounded-2xl border border-dark-800 min-h-[120px] flex flex-col justify-center">
        {authType === 'none' && (
          <p className="text-xs text-slate-600 text-center italic">This request does not use authentication</p>
        )}

        {authType === 'bearer' && (
          <div className="flex flex-col gap-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Token</label>
            <div className="relative group">
              <Key size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
              <input
                type="text"
                placeholder="Paste your bearer token here..."
                className="w-full bg-dark-900 border border-dark-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
              />
            </div>
          </div>
        )}

        {authType === 'basic' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Username</label>
              <div className="relative group">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="text"
                  placeholder="admin"
                  className="w-full bg-dark-900 border border-dark-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Password</label>
              <div className="relative group">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-dark-700/50 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
