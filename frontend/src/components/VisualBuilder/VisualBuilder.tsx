import React from 'react';
import { MethodUrlBar } from './MethodUrlBar';
import { ParamsEditor } from './ParamsEditor';
import { HeadersEditor } from './HeadersEditor';
import { AuthEditor } from './AuthEditor';
import { BodyEditor } from './BodyEditor';
import { useStore } from '../../state/store';
import { RequestNavigator } from '../common/RequestNavigator';

export const VisualBuilder: React.FC = () => {
  const activeDocument = useStore((state) => state.activeDocument);

  if (!activeDocument) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500">
        <div className="w-20 h-20 rounded-full bg-dark-800 flex items-center justify-center border border-dark-700 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-dark-700" />
        </div>
        <p className="text-sm font-medium">Select a request to start building</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 h-full overflow-y-auto custom-scrollbar">
      <RequestNavigator />
      <MethodUrlBar />
      <ParamsEditor />
      <HeadersEditor />
      <AuthEditor />
      <BodyEditor />
      
      {/* Bottom Spacer */}
      <div className="h-20" />
    </div>
  );
};
