import { useState, useCallback } from 'react';
import type { ReportPage, ReportMeta } from '../types';
import { Trash2, FileText, GripVertical, MessageSquare, X, Sparkles } from 'lucide-react';

interface ReportBuilderPanelProps {
  pages: ReportPage[];
  onRemovePage: (pageId: string) => void;
  onReorderPages?: (pages: ReportPage[]) => void;
  onClear: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  generateProgress: number;
  onDrop: (e: React.DragEvent) => void;
}

export function ReportBuilderPanel({
  pages,
  onRemovePage,
  onClear,
  onGenerate,
  isGenerating,
  generateProgress,
  onDrop,
}: ReportBuilderPanelProps) {
  const [meta, setMeta] = useState<ReportMeta>({
    title: '',
    location: '',
    dateTime: new Date().toISOString().slice(0, 16),
    crewNames: '',
    templateType: 'standard',
  });

  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDropZone = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    onDrop(e);
  }, [onDrop]);

  return (
    <div className="h-full flex flex-col bg-wac-bg">
      <div className="flex-shrink-0 p-4 border-b border-wac-border">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-wac-text">Report Builder</h2>
            <p className="text-xs text-wac-textDim">
              Drag images from Walk Data or click to add. Arrange, annotate, and generate.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClear}
              disabled={pages.length === 0 || isGenerating}
              className="btn-ghost text-sm flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
            <button
              onClick={onGenerate}
              disabled={pages.length === 0 || isGenerating}
              className="btn-primary text-sm flex items-center gap-1.5"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-wac-bg border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
        
        {isGenerating && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-wac-textMuted mb-1">
              <span>Compiling WAC Report...</span>
              <span>{generateProgress}%</span>
            </div>
            <div className="h-1.5 bg-wac-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-wac-accent to-wac-warning rounded-full transition-all duration-300"
                style={{ width: `${generateProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropZone}
          className={`min-h-[300px] rounded-xl border-2 border-dashed transition-all duration-200 ${
            pages.length === 0
              ? 'border-wac-border bg-wac-surface/20 flex items-center justify-center'
              : 'border-transparent'
          } ${dragOverIndex !== null ? 'border-wac-accent bg-wac-accent/5' : ''}`}
        >
          {pages.length === 0 ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-wac-surface border border-wac-border flex items-center justify-center">
                <FileText className="w-10 h-10 text-wac-textDim" />
              </div>
              <p className="text-wac-text font-medium mb-1">Drop images here</p>
              <p className="text-sm text-wac-textDim">Start composing your report</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="group relative rounded-xl overflow-hidden bg-wac-card border border-wac-border hover:border-wac-accent/50 transition-all"
                >
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                    <span className="w-6 h-6 rounded-full bg-wac-accent text-wac-bg text-xs font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 rounded bg-wac-surface/80 text-wac-textMuted hover:text-wac-text transition-all">
                      <GripVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onRemovePage(page.id)}
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  <div className="aspect-[4/3]">
                    <img
                      src={page.file.url}
                      alt={page.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-2 border-t border-wac-border">
                    <p className="text-xs text-wac-textMuted truncate mb-1">{page.file.name}</p>
                    <button className="flex items-center gap-1 text-[10px] text-wac-textDim hover:text-wac-accent transition-colors">
                      <MessageSquare className="w-3 h-3" />
                      Add note
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0 p-4 border-t border-wac-border bg-wac-surface/30">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-4 h-4 text-wac-accent mt-0.5" />
          <p className="text-xs text-wac-textDim">
            WAC will generate a summary based on the selected images.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-wac-textMuted mb-1">Report Title</label>
            <input
              type="text"
              value={meta.title}
              onChange={(e) => setMeta({ ...meta, title: e.target.value })}
              placeholder="Walk Report - Site A"
              className="w-full input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-wac-textMuted mb-1">Location</label>
            <input
              type="text"
              value={meta.location}
              onChange={(e) => setMeta({ ...meta, location: e.target.value })}
              placeholder="Building 1, Floor 3"
              className="w-full input-field text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-wac-textMuted mb-1">Template</label>
            <select
              value={meta.templateType}
              onChange={(e) => setMeta({ ...meta, templateType: e.target.value as ReportMeta['templateType'] })}
              className="w-full input-field text-sm"
            >
              <option value="standard">Standard Walk</option>
              <option value="punchlist">Punchlist</option>
              <option value="safety-audit">Safety Audit</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-wac-textMuted mb-1">Crew Names</label>
            <input
              type="text"
              value={meta.crewNames}
              onChange={(e) => setMeta({ ...meta, crewNames: e.target.value })}
              placeholder="John, Sarah"
              className="w-full input-field text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
