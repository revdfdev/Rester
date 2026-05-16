import React from 'react';
import { DetailedTiming } from '../../../types';
import { formatTimingPhases } from '../../../utils/timing-formatter';
import { Clock } from 'lucide-react';

interface TimingChartProps {
  timing?: DetailedTiming;
  total: number;
}

export const TimingChart: React.FC<TimingChartProps> = ({ timing, total }) => {
  const phases = formatTimingPhases(timing);

  if (phases.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-700 italic">
        <Clock size={48} className="mb-4 opacity-10" />
        <span className="text-sm">Detailed timing not available for this request</span>
      </div>
    );
  }

  return (
    <div className="p-8 h-full bg-[#0a0a0a] overflow-auto custom-scrollbar">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Request Lifecycle</h3>
          <div className="text-xl font-mono font-bold text-blue-500">{total}ms</div>
        </div>

        <div className="space-y-6">
          {phases.map((phase) => (
            <div key={phase.label} className="space-y-2 group">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                <span className="text-slate-500 group-hover:text-slate-300 transition-colors">{phase.label}</span>
                <span className="text-slate-400">{phase.duration}ms</span>
              </div>
              <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/50">
                <div 
                  className="h-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(phase.duration / total) * 100}%`,
                    backgroundColor: phase.color,
                    boxShadow: `0 0 10px ${phase.color}40`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Time to First Byte</div>
            <div className="text-lg font-mono text-amber-500">{timing?.ttfb}ms</div>
          </div>
          <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Duration</div>
            <div className="text-lg font-mono text-emerald-500">{total}ms</div>
          </div>
        </div>
      </div>
    </div>
  );
};
