import type { PDFFile } from '../types';
import { Download, ExternalLink, Share2, RefreshCw, FileText } from 'lucide-react';

interface CreatedReportsStripProps {
  pdfs: PDFFile[];
  onRefresh: () => void;
  isLoading: boolean;
  isMobile?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CreatedReportsStrip({ pdfs, onRefresh, isLoading, isMobile = false }: CreatedReportsStripProps) {
  const handleDownload = (pdf: PDFFile) => {
    const link = document.createElement('a');
    link.href = pdf.url;
    link.download = pdf.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-wac-bg">
        <div className="flex-shrink-0 px-4 py-3 flex items-center justify-between border-b border-wac-border">
          <div>
            <h3 className="text-lg font-semibold text-wac-text">Created Reports</h3>
            <p className="text-xs text-wac-textDim">{pdfs.length} reports</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-icon min-w-[44px] min-h-[44px]"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-2 border-wac-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : pdfs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-wac-surface flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-wac-textDim" />
              </div>
              <p className="text-wac-text font-medium mb-1">No reports yet</p>
              <p className="text-sm text-wac-textDim">
                Build your first WAC report to see it here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pdfs.map((pdf) => (
                <div
                  key={pdf.url}
                  className="rounded-xl bg-wac-card border border-wac-border p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-wac-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-wac-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-wac-text truncate">{pdf.name}</p>
                      <p className="text-xs text-wac-textDim">
                        {formatDate(pdf.modified)} • {formatFileSize(pdf.size)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-[10px] rounded-full bg-green-500/20 text-green-400 font-medium">
                      Generated
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={() => handleDownload(pdf)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-wac-textMuted hover:text-wac-accent hover:bg-wac-surface transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <a
                      href={pdf.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-wac-textMuted hover:text-wac-accent hover:bg-wac-surface transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 border-t border-wac-border bg-wac-surface/30">
      <div className="px-4 py-3 flex items-center justify-between border-b border-wac-border">
        <div>
          <h3 className="text-sm font-semibold text-wac-text">Created Reports</h3>
          <p className="text-xs text-wac-textDim">{pdfs.length} reports</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="btn-icon"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-6 h-6 border-2 border-wac-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pdfs.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-center">
            <p className="text-sm text-wac-textDim">
              No reports yet. Build your first WAC report to see it here.
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {pdfs.map((pdf) => (
              <div
                key={pdf.url}
                className="flex-shrink-0 w-64 rounded-xl bg-wac-card border border-wac-border hover:border-wac-accent/50 transition-all p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-wac-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-wac-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-wac-text truncate">{pdf.name}</p>
                    <p className="text-xs text-wac-textDim">
                      {formatDate(pdf.modified)} • {formatFileSize(pdf.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-3">
                  <span className="px-2 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400 font-medium">
                    Generated
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDownload(pdf)}
                    className="p-1.5 rounded-lg text-wac-textMuted hover:text-wac-accent hover:bg-wac-surface transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <a
                    href={pdf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-wac-textMuted hover:text-wac-accent hover:bg-wac-surface transition-colors"
                    title="Open"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    className="p-1.5 rounded-lg text-wac-textMuted hover:text-wac-accent hover:bg-wac-surface transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
