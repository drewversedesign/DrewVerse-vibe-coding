export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

export interface ProjectState {
  files: FileNode[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
