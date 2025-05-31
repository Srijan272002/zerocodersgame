import { CodeGenerator, CodeFile, CodeBlock, ValidationResult } from './CodeGenerator';

export interface GodotScriptMetadata {
  extends: string;
  signals: string[];
  autoload?: boolean;
  tool?: boolean;
}

export class GodotGenerator extends CodeGenerator {
  public createGodotScript(
    filename: string,
    baseClass: string,
    metadata: Partial<GodotScriptMetadata> = {}
  ): CodeFile {
    const file = this.createFile(`${filename}.gd`, 'gdscript');

    // Add script metadata
    file.metadata = {
      extends: baseClass,
      signals: [],
      ...metadata
    };

    // Add base template
    this.addCodeBlock(
      file.id,
      'class',
      filename,
      this.generateClassTemplate(baseClass, metadata.tool || false)
    );

    return file;
  }

  public addSignal(fileId: string, signalName: string, parameters: string[] = []): boolean {
    const file = this.getFileById(fileId);
    if (!file) return false;

    const signalDef = parameters.length > 0
      ? `signal ${signalName}(${parameters.join(', ')})`
      : `signal ${signalName}`;

    (file.metadata as GodotScriptMetadata).signals.push(signalDef);
    return true;
  }

  public addMethod(
    fileId: string,
    methodName: string,
    parameters: string[] = [],
    content: string = '',
    isVirtual: boolean = false
  ): CodeBlock | null {
    const template = this.generateMethodTemplate(methodName, parameters, content, isVirtual);
    return this.addCodeBlock(fileId, 'method', methodName, template);
  }

  public addExportVar(
    fileId: string,
    varName: string,
    type: string,
    defaultValue?: string,
    hint?: string
  ): CodeBlock | null {
    const template = this.generateExportVarTemplate(varName, type, defaultValue, hint);
    return this.addCodeBlock(fileId, 'property', varName, template);
  }

  private generateClassTemplate(baseClass: string, isTool: boolean): string {
    const toolDirective = isTool ? '@tool\\n' : '';
    return `${toolDirective}extends ${baseClass}

# Class member variables
var _private_var: int = 0

# Called when the node enters the scene tree
func _ready() -> void:
    pass

# Called every frame
func _process(delta: float) -> void:
    pass`;
  }

  private generateMethodTemplate(
    methodName: string,
    parameters: string[],
    content: string,
    isVirtual: boolean
  ): string {
    const paramList = parameters.join(', ');
    const virtualPrefix = isVirtual ? '_' : '';
    
    return `func ${virtualPrefix}${methodName}(${paramList}) -> void:
    ${content || 'pass'}`;
  }

  private generateExportVarTemplate(
    varName: string,
    type: string,
    defaultValue?: string,
    hint?: string
  ): string {
    const hintStr = hint ? `(${hint})` : '';
    const defaultStr = defaultValue ? ` = ${defaultValue}` : '';
    
    return `@export${hintStr} var ${varName}: ${type}${defaultStr}`;
  }

  public override validate(fileId: string): ValidationResult {
    const file = this.getFileById(fileId);
    if (!file) {
      return {
        isValid: false,
        errors: [{
          type: 'dependency',
          message: 'File not found',
          severity: 'error'
        }],
        warnings: []
      };
    }

    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate file structure
    const metadata = file.metadata as GodotScriptMetadata;
    if (!metadata.extends) {
      errors.push({
        type: 'semantic',
        message: 'GDScript file must specify a base class using "extends"',
        severity: 'error'
      });
    }

    // Validate code blocks
    for (const block of file.codeBlocks) {
      if (block.type === 'method') {
        // Validate method naming convention
        if (!block.name.match(/^[a-z_][a-zA-Z0-9_]*$/)) {
          errors.push({
            type: 'semantic',
            message: `Method name "${block.name}" does not follow GDScript naming conventions`,
            severity: 'error'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  public override generateCode(fileId: string): string {
    const file = this.getFileById(fileId);
    if (!file) return '';

    const lines: string[] = [];
    const metadata = file.metadata as GodotScriptMetadata;

    // Add tool directive if needed
    if (metadata.tool) {
      lines.push('@tool');
    }

    // Add extends
    lines.push(`extends ${metadata.extends}`);
    lines.push('');

    // Add signals
    if (metadata.signals.length > 0) {
      lines.push('# Signals');
      lines.push(...metadata.signals);
      lines.push('');
    }

    // Add code blocks
    for (const block of file.codeBlocks) {
      lines.push(block.content);
      lines.push('');
    }

    return lines.join('\n');
  }
} 