import type { WalkFile } from '../types';
import { X, ZoomIn, ZoomOut, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface ImagePreviewModalProps {
  file: WalkFile | null;
  onClose: () => void;
  onAddToBuilder: (file: WalkFile) => void;
}

export function ImagePreviewModal({ file, onClose, onAddToBuilder }: ImagePreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [note, setNote] = useState('');

  if (!file) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-5xl h-[90vh] m-4 flex bg-wac-card rounded-2xl overflow-hidden border border-wac-border shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-wac-surface/80 text-wac-text hover:bg-wac-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex-1 flex items-center justify-center bg-wac-bg p-8 overflow-hidden">
          <div className="relative">
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-wac-surface/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <button
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="p-1 text-wac-textMuted hover:text-wac-text transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-wac-textMuted w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(z => Math.min(3, z + 0.25))}
              className="p-1 text-wac-textMuted hover:text-wac-text transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="w-80 flex flex-col border-l border-wac-border bg-wac-surface/50">
          <div className="p-4 border-b border-wac-border">
            <h3 className="font-semibold text-wac-text mb-1 truncate">{file.name}</h3>
            <p className="text-xs text-wac-textDim">
              {new Date(file.modified).toLocaleString()}
            </p>
          </div>
          
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-xs text-wac-textMuted mb-2">Notes</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add notes about this image..."
                className="w-full h-24 input-field text-sm resize-none"
              />
            </div>
            
            <div className="p-3 rounded-lg bg-wac-accent/10 border border-wac-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-wac-accent" />
                <span className="text-xs font-medium text-wac-accent">WAC Insight</span>
              </div>
              <p className="text-xs text-wac-textMuted">
                AI analysis will appear here when connected to WAC services.
              </p>
            </div>
            
            {file.tags && file.tags.length > 0 && (
              <div>
                <label className="block text-xs text-wac-textMuted mb-2">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {file.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-wac-surface text-wac-textMuted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-wac-border">
            <button
              onClick={() => {
                onAddToBuilder(file);
                onClose();
              }}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Send to Report Builder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
