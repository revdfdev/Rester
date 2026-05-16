import React from 'react';
import { Cookie } from '../../../state/executionStore';
import { Shield, ShieldOff, Lock, Globe } from 'lucide-react';

interface CookieTableProps {
  cookies: Cookie[];
}

export const CookieTable: React.FC<CookieTableProps> = ({ cookies }) => {
  if (cookies.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
        <Globe size={48} className="mb-4 opacity-10" />
        <span className="text-sm">No cookies found in response</span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto custom-scrollbar bg-[#0a0a0a]">
      <table className="w-full text-xs font-mono">
        <thead className="sticky top-0 bg-slate-950 text-slate-500 border-b border-slate-800 z-10">
          <tr>
            <th className="text-left px-4 py-2 font-bold uppercase tracking-wider">Name</th>
            <th className="text-left px-4 py-2 font-bold uppercase tracking-wider">Value</th>
            <th className="text-left px-4 py-2 font-bold uppercase tracking-wider">Domain</th>
            <th className="text-left px-4 py-2 font-bold uppercase tracking-wider">Path</th>
            <th className="text-left px-4 py-2 font-bold uppercase tracking-wider">Expires</th>
            <th className="text-center px-4 py-2 font-bold uppercase tracking-wider">Flags</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie, idx) => (
            <tr key={`${cookie.name}-${idx}`} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
              <td className="px-4 py-3 text-blue-400 font-bold">{cookie.name}</td>
              <td className="px-4 py-3 text-slate-300 break-all max-w-[200px] truncate" title={cookie.value}>{cookie.value}</td>
              <td className="px-4 py-3 text-slate-500">{cookie.domain || '-'}</td>
              <td className="px-4 py-3 text-slate-500">{cookie.path || '-'}</td>
              <td className="px-4 py-3 text-slate-500">{cookie.expires || 'Session'}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  {cookie.secure ? (
                    <Shield size={14} className="text-emerald-500" title="Secure" />
                  ) : (
                    <ShieldOff size={14} className="text-slate-700" title="Not Secure" />
                  )}
                  {cookie.httpOnly && (
                    <Lock size={14} className="text-amber-500" title="HttpOnly" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
