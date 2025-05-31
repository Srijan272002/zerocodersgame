import { v4 as uuidv4 } from 'uuid';

export interface CodeBlock {
  id: string;
  type: 'class' | 'method' | 'property' | 'field' | 'enum';
  name: string;
  content: string;
  dependencies: string[];
  metadata: Record<string, any>;
}

export interface CodeFile {
  id: string;
  filename: string;
  language: 'csharp' | 'gdscript';
  namespace?: string;
  imports: string[];
  codeBlocks: CodeBlock[];
  metadata: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  type: 'syntax' | 'semantic' | 'dependency';
  message: string;
  location?: { line: number; column: number };
  severity: 'error';
}

interface ValidationWarning {
  type: 'style' | 'performance' | 'best-practice';
  message: string;
  location?: { line: number; column: number };
  severity: 'warning';
}

export abstract class CodeGenerator {
  protected files: CodeFile[];

  constructor() {
    this.files = [];
  }

  protected createFile(
    filename: string,
    language: CodeFile['language'],
    namespace?: string
  ): CodeFile {
    const file: CodeFile = {
      id: uuidv4(),
      filename,
      language,
      namespace,
      imports: [],
      codeBlocks: [],
      metadata: {}
    };
    this.files.push(file);
    return file;
  }

  protected addCodeBlock(
    fileId: string,
    type: CodeBlock['type'],
    name: string,
    content: string,
    dependencies: string[] = [],
    metadata: Record<string, any> = {}
  ): CodeBlock | null {
    const file = this.files.find(f => f.id === fileId);
    if (!file) return null;

    const block: CodeBlock = {
      id: uuidv4(),
      type,
      name,
      content,
      dependencies,
      metadata
    };

    file.codeBlocks.push(block);
    return block;
  }

  protected addImport(fileId: string, importStatement: string): boolean {
    const file = this.files.find(f => f.id === fileId);
    if (!file) return false;

    if (!file.imports.includes(importStatement)) {
      file.imports.push(importStatement);
    }
    return true;
  }

  public getFiles(): CodeFile[] {
    return this.files;
  }

  public getFileById(fileId: string): CodeFile | null {
    return this.files.find(f => f.id === fileId) || null;
  }

  abstract validate(fileId: string): ValidationResult;
  abstract generateCode(fileId: string): string;
} 