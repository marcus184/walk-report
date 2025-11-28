import { useState, useCallback } from 'react';
import type { WalkFile } from '../types';
import { AssetCard } from './AssetCard';
import { Upload, Download, Filter, Search, Grid, List, RefreshCw } from 'lucide-react';

interface WalkDataPanelProps {
  files: WalkFile[];
  selectedFiles: WalkFile[];
  onSelectFile: (file: WalkFile) => void;
  onAddToBuilder: (file: WalkFile) => void;
  onPreviewFile: (file: WalkFile) => void;
  onUpload: (files: FileList) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'flagged' | 'hazards' | 'recent';

export function WalkDataPanel({
  files,
  selectedFiles,
  onSelectFile,
  onAddToBuilder,
  onPreviewFile,
  onUpload,
  onRefresh,
  isLoading,
}: WalkDataPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredFiles = files.filter(file => {
    if (searchQuery) {
      return file.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      e.target.value = '';
    }
  }, [onUpload]);

  const isSelected = (file: WalkFile) => selectedFiles.some(f => f.url === file.url);

  return (
    <div className="h-full flex flex-col bg-wac-surface/30 border-r border-wac-border">
      <div className="flex-shrink-0 p-4 border-b border-wac-border">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="text-lg font-semibold text-wac-text">Walk Data</h2>
            <span className="text-[10px] text-wac-accent uppercase tracking-wider font-medium">WAC Feed</span>
          </div>
          <button 
            onClick={onRefresh}
            className="btn-icon"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-xs text-wac-textDim">
          {files.length} images • Synced just now
        </p>
      </div>
      
      <div className="flex-shrink-0 p-3 border-b border-wac-border space-y-3">
        <div className="flex gap-2">
          <label className="btn-primary flex items-center gap-2 cursor-pointer text-sm">
            <Upload className="w-4 h-4" />
            Upload
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </label>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            Import from WAC
          </button>
          <button className="btn-icon ml-auto">
            <Filter className="w-4 h-4" />
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wac-textDim" />
          <input
            type="text"
            placeholder="Filter by tag, filename, or note"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm input-field"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {(['all', 'flagged', 'hazards', 'recent'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors ${
                  activeFilter === filter
                    ? 'bg-wac-accent text-wac-bg font-medium'
                    : 'bg-wac-surface text-wac-textMuted hover:text-wac-text'
                }`}
              >
                {filter === 'all' ? 'All' :
                 filter === 'flagged' ? 'Flagged' :
                 filter === 'hazards' ? 'AI Hazards' : 'Recent'}
              </button>
            ))}
          </div>
          
          <div className="flex bg-wac-surface rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-wac-card text-wac-accent' : 'text-wac-textDim'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-wac-card text-wac-accent' : 'text-wac-textDim'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-wac-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-16 h-16 rounded-full bg-wac-surface flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-wac-textDim" />
            </div>
            <p className="text-wac-text font-medium mb-1">No images yet</p>
            <p className="text-sm text-wac-textDim">
              Connect a WAC device or upload files to begin
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 xl:grid-cols-3 gap-3' 
            : 'space-y-2'
          }>
            {filteredFiles.map((file) => (
              <AssetCard
                key={file.url}
                file={file}
                isSelected={isSelected(file)}
                onSelect={() => onSelectFile(file)}
                onAddToBuilder={() => onAddToBuilder(file)}
                onPreview={() => onPreviewFile(file)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
