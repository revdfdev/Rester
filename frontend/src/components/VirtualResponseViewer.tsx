import React from 'react';
import { Virtuoso } from 'react-virtuoso';

interface VirtualResponseViewerProps {
  content: string;
}

export const VirtualResponseViewer: React.FC<VirtualResponseViewerProps> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div style={{ height: '100%', width: '100%', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'monospace' }}>
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={lines.length}
        itemContent={(index) => (
          <div style={{ whiteSpace: 'pre', padding: '0 10px', minHeight: '1.2em' }}>
            <span style={{ color: '#858585', marginRight: '10px', display: 'inline-block', width: '40px', textAlign: 'right', userSelect: 'none' }}>
              {index + 1}
            </span>
            {lines[index]}
          </div>
        )}
      />
    </div>
  );
};
