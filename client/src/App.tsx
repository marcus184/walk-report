import { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { AppShell } from './components/AppShell';
import { WalkDataPanel } from './components/WalkDataPanel';
import { ReportBuilderPanel } from './components/ReportBuilderPanel';
import { CreatedReportsStrip } from './components/CreatedReportsStrip';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { MobileNav, type MobileTab } from './components/MobileNav';
import type { WalkFile, PDFFile, ReportPage } from './types';
import { fetchFiles, fetchPDFs, uploadFile, savePDF } from './lib/api';

function App() {
  const [files, setFiles] = useState<WalkFile[]>([]);
  const [pdfs, setPdfs] = useState<PDFFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<WalkFile[]>([]);
  const [reportPages, setReportPages] = useState<ReportPage[]>([]);
  const [previewFile, setPreviewFile] = useState<WalkFile | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [isLoadingPdfs, setIsLoadingPdfs] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState(0);
  const [mobileTab, setMobileTab] = useState<MobileTab>('data');

  const loadFiles = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const data = await fetchFiles();
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const loadPdfs = useCallback(async () => {
    setIsLoadingPdfs(true);
    try {
      const data = await fetchPDFs();
      setPdfs(data);
    } catch (error) {
      console.error('Failed to load PDFs:', error);
    } finally {
      setIsLoadingPdfs(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
    loadPdfs();
  }, [loadFiles, loadPdfs]);

  const handleSelectFile = useCallback((file: WalkFile) => {
    setSelectedFiles(prev => {
      const isSelected = prev.some(f => f.url === file.url);
      if (isSelected) {
        return prev.filter(f => f.url !== file.url);
      }
      return [...prev, file];
    });
  }, []);

  const handleAddToBuilder = useCallback((file: WalkFile) => {
    if (!file.isImage) return;
    
    setReportPages(prev => {
      if (prev.some(p => p.file.url === file.url)) return prev;
      
      const newPage: ReportPage = {
        id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        order: prev.length,
      };
      return [...prev, newPage];
    });
  }, []);

  const handleRemovePage = useCallback((pageId: string) => {
    setReportPages(prev => prev.filter(p => p.id !== pageId));
  }, []);

  const handleReorderPages = useCallback((pages: ReportPage[]) => {
    setReportPages(pages);
  }, []);

  const handleClearBuilder = useCallback(() => {
    setReportPages([]);
  }, []);

  const handleUpload = useCallback(async (fileList: FileList) => {
    const filesToUpload = Array.from(fileList);
    
    for (const file of filesToUpload) {
      try {
        await uploadFile(file);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
    
    await loadFiles();
  }, [loadFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const file: WalkFile = JSON.parse(data);
        handleAddToBuilder(file);
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  }, [handleAddToBuilder]);

  const handleGeneratePDF = useCallback(async () => {
    if (reportPages.length === 0) return;
    
    setIsGenerating(true);
    setGenerateProgress(0);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imageWidth = pageWidth - (2 * margin);
      
      for (let i = 0; i < reportPages.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        setGenerateProgress(Math.round(((i + 0.5) / reportPages.length) * 100));
        
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = reportPages[i].file.url;
          });
          
          const aspectRatio = img.height / img.width;
          let imageHeight = imageWidth * aspectRatio;
          let finalWidth = imageWidth;
          let finalHeight = imageHeight;
          
          if (imageHeight > pageHeight - (2 * margin)) {
            finalHeight = pageHeight - (2 * margin);
            finalWidth = finalHeight / aspectRatio;
          }
          
          const x = (pageWidth - finalWidth) / 2;
          const y = margin;
          
          pdf.addImage(img, 'JPEG', x, y, finalWidth, finalHeight);
          
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          const textY = y + finalHeight + 5;
          if (textY < pageHeight - 5) {
            pdf.text(reportPages[i].file.name, margin, textY);
          }
        } catch (error) {
          console.error(`Error adding image ${i + 1}:`, error);
        }
        
        setGenerateProgress(Math.round(((i + 1) / reportPages.length) * 100));
      }
      
      const pdfBlob = pdf.output('blob');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `walk-report-${timestamp}.pdf`;
      
      await savePDF(pdfBlob, filename);
      await loadPdfs();
      
      setReportPages([]);
      setMobileTab('reports');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
      setGenerateProgress(0);
    }
  }, [reportPages, loadPdfs]);

  return (
    <AppShell>
      <div className="h-full flex flex-col pb-16 md:pb-0">
        <div className="hidden md:flex flex-1 overflow-hidden">
          <div className="w-1/2 lg:w-2/5 xl:w-1/3 flex-shrink-0">
            <WalkDataPanel
              files={files}
              selectedFiles={selectedFiles}
              onSelectFile={handleSelectFile}
              onAddToBuilder={handleAddToBuilder}
              onPreviewFile={setPreviewFile}
              onUpload={handleUpload}
              onRefresh={loadFiles}
              isLoading={isLoadingFiles}
            />
          </div>
          
          <div className="flex-1">
            <ReportBuilderPanel
              pages={reportPages}
              onRemovePage={handleRemovePage}
              onReorderPages={handleReorderPages}
              onClear={handleClearBuilder}
              onGenerate={handleGeneratePDF}
              isGenerating={isGenerating}
              generateProgress={generateProgress}
              onDrop={handleDrop}
            />
          </div>
        </div>
        
        <div className="hidden md:block">
          <CreatedReportsStrip
            pdfs={pdfs}
            onRefresh={loadPdfs}
            isLoading={isLoadingPdfs}
          />
        </div>

        <div className="md:hidden flex-1 overflow-hidden">
          {mobileTab === 'data' && (
            <WalkDataPanel
              files={files}
              selectedFiles={selectedFiles}
              onSelectFile={handleSelectFile}
              onAddToBuilder={(file) => {
                handleAddToBuilder(file);
                setMobileTab('builder');
              }}
              onPreviewFile={setPreviewFile}
              onUpload={handleUpload}
              onRefresh={loadFiles}
              isLoading={isLoadingFiles}
              isMobile={true}
            />
          )}
          
          {mobileTab === 'builder' && (
            <ReportBuilderPanel
              pages={reportPages}
              onRemovePage={handleRemovePage}
              onReorderPages={handleReorderPages}
              onClear={handleClearBuilder}
              onGenerate={handleGeneratePDF}
              isGenerating={isGenerating}
              generateProgress={generateProgress}
              onDrop={handleDrop}
              isMobile={true}
            />
          )}
          
          {mobileTab === 'reports' && (
            <CreatedReportsStrip
              pdfs={pdfs}
              onRefresh={loadPdfs}
              isLoading={isLoadingPdfs}
              isMobile={true}
            />
          )}
        </div>
      </div>
      
      <MobileNav
        activeTab={mobileTab}
        onTabChange={setMobileTab}
        reportPagesCount={reportPages.length}
        pdfsCount={pdfs.length}
      />
      
      <ImagePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onAddToBuilder={(file) => {
          handleAddToBuilder(file);
          setMobileTab('builder');
        }}
      />
    </AppShell>
  );
}

export default App;
