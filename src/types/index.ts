export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export interface BrandConfig {
  primaryColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily: string;
}

export interface ProjectVersion {
  timestamp: number;
  files: FileNode[];
  message: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isAudit?: boolean;
}
