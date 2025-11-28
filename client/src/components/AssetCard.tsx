import type { WalkFile } from '../types';
import { Plus, Eye, Clock, HardDrive } from 'lucide-react';

interface AssetCardProps {
  file: WalkFile;
  isSelected: boolean;
  onSelect: () => void;
  onAddToBuilder: () => void;
  onPreview: () => void;
  isMobile?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function AssetCard({ file, isSelected, onSelect, onAddToBuilder, onPreview, isMobile = false }: AssetCardProps) {
  const tags = file.tags || [];
  
  return (
    <div
      className={`group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'ring-2 ring-wac-accent shadow-glow scale-[1.02]' 
          : 'hover:ring-1 hover:ring-wac-accent/50 hover:scale-[1.01]'
        }
        bg-wac-card border border-wac-border`}
      onClick={onSelect}
      draggable={!isMobile}
      onDragStart={(e) => {
        if (isMobile) return;
        e.dataTransfer.setData('application/json', JSON.stringify(file));
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <div className="aspect-square relative overflow-hidden bg-wac-surface">
        {file.isImage ? (
          <img
            src={file.url}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-wac-textDim">
            <HardDrive className="w-12 h-12" />
          </div>
        )}
        
        {tags.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span
                key={i}
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  tag === 'Hazard' ? 'bg-red-500/80 text-white' :
                  tag === 'Equipment' ? 'bg-blue-500/80 text-white' :
                  'bg-wac-accent/80 text-wac-bg'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 md:transition-opacity md:duration-200" />
        
        {isMobile ? (
          <div className="absolute bottom-2 left-2 right-2 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onAddToBuilder(); }}
              className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-wac-accent text-wac-bg text-xs font-medium active:bg-wac-accentHover"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="px-3 py-2.5 rounded-lg bg-wac-surface/90 text-wac-text text-xs active:bg-wac-surface"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onAddToBuilder(); }}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-wac-accent text-wac-bg text-xs font-medium hover:bg-wac-accentHover transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
              className="px-2 py-1.5 rounded-lg bg-wac-surface/80 text-wac-text text-xs hover:bg-wac-surface transition-colors"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-2.5">
        <p className="text-xs font-medium text-wac-text truncate mb-1">{file.name}</p>
        <div className="flex items-center gap-2 text-[10px] text-wac-textDim">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeAgo(file.modified)}
          </span>
          <span>{formatFileSize(file.size)}</span>
        </div>
      </div>
    </div>
  );
}
