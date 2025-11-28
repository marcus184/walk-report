export interface WalkFile {
  name: string;
  size: number;
  modified: string;
  isImage: boolean;
  url: string;
  tags?: string[];
  aiNote?: string;
}

export interface PDFFile {
  name: string;
  size: number;
  modified: string;
  url: string;
  imageCount?: number;
  status?: 'generated' | 'shared' | 'reopened';
}

export interface ReportPage {
  id: string;
  file: WalkFile;
  note?: string;
  order: number;
}

export interface ReportMeta {
  title: string;
  location: string;
  dateTime: string;
  crewNames: string;
  templateType: 'standard' | 'punchlist' | 'safety-audit';
}
