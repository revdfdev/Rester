import { DetailedTiming } from '../types';

export interface TimingPhase {
  label: string;
  duration: number;
  color: string;
}

/**
 * Formats detailed timing metrics into sequential phases for visualization.
 */
export const formatTimingPhases = (timing?: DetailedTiming): TimingPhase[] => {
  if (!timing) return [];

  return [
    { label: 'DNS Lookup', duration: timing.dns, color: '#f97583' },
    { label: 'TCP Connection', duration: timing.tcp, color: '#79b8ff' },
    { label: 'SSL/TLS Handshake', duration: timing.tls, color: '#b392f0' },
    { label: 'TTFB (Server Processing)', duration: timing.ttfb, color: '#ffab70' },
    { label: 'Content Download', duration: timing.download, color: '#85e89d' },
  ].filter(p => p.duration > 0);
};
