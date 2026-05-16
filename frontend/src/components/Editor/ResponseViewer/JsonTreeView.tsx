import React, { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronRight, ChevronDown, Hash, Type, Braces, List, Globe, Copy } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface JsonNode {
  id: string;
  key: string;
  value: any;
  level: number;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  isExpanded: boolean;
  path: string;
}

interface JsonTreeViewProps {
  data: any;
}

export const JsonTreeView: React.FC<JsonTreeViewProps> = ({ data }) => {
  // Simple flattening for the first level to start with
  // In a production app, we'd want recursive flattening with expansion state
  const nodes = useMemo(() => {
    const result: JsonNode[] = [];
    
    const walk = (obj: any, level = 0, path = '') => {
      if (obj === null) return;
      
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        const type = Array.isArray(value) ? 'array' : typeof value as any;
        
        result.push({
          id: currentPath,
          key,
          value,
          level,
          type: value === null ? 'null' : type,
          isExpanded: true,
          path: currentPath
        });

        // For now, we only show top level or recurse if it's not too deep
        // A full implementation would handle expansion state
        if (typeof value === 'object' && value !== null && level < 5) {
          walk(value, level + 1, currentPath);
        }
      });
    };

    walk(data);
    return result;
  }, [data]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'object': return <Braces size={14} className="text-brand-primary" />;
      case 'array': return <List size={14} className="text-amber-500" />;
      case 'string': return <Type size={14} className="text-emerald-500" />;
      case 'number': return <Hash size={14} className="text-sky-500" />;
      default: return <Globe size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="h-full bg-dark-950 font-mono text-[11px]">
      <Virtuoso
        style={{ height: '100%' }}
        totalCount={nodes.length}
        itemContent={(index) => {
          const node = nodes[index];
          const isPrimitive = node.type !== 'object' && node.type !== 'array';
          
          return (
            <div 
              className="flex items-center gap-2 py-1 px-4 hover:bg-dark-900 group transition-colors select-none"
              style={{ paddingLeft: `${(node.level + 1) * 16}px` }}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {!isPrimitive && <ChevronDown size={12} className="text-slate-600" />}
              </div>
              
              <div className="flex items-center gap-2">
                {getIcon(node.type)}
                <span className="text-slate-300 font-bold">{node.key}:</span>
              </div>

              {isPrimitive ? (
                <span className={cn(
                  "truncate",
                  node.type === 'string' ? "text-emerald-400" : "text-sky-400"
                )}>
                  {JSON.stringify(node.value)}
                </span>
              ) : (
                <span className="text-slate-600 italic">
                  {node.type === 'array' ? `[${node.value.length}]` : `{${Object.keys(node.value).length}}`}
                </span>
              )}

              <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-brand-primary transition-all">
                <Copy size={10} />
              </button>
            </div>
          );
        }}
      />
    </div>
  );
};
