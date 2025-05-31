import { CodeGenerator, CodeFile, CodeBlock, ValidationResult } from './CodeGenerator';

export interface UnityScriptMetadata {
  scriptType: 'MonoBehaviour' | 'ScriptableObject' | 'EditorWindow' | 'Editor';
  requiredComponents?: string[];
  menuPath?: string;
  executeInEditMode?: boolean;
}

export class UnityGenerator extends CodeGenerator {
  public createUnityScript(
    filename: string,
    scriptType: UnityScriptMetadata['scriptType'],
    namespace?: string,
    metadata: Partial<UnityScriptMetadata> = {}
  ): CodeFile {
    const file = this.createFile(`${filename}.cs`, 'csharp', namespace);

    // Add Unity-specific imports
    this.addImport(file.id, 'using UnityEngine;');
    if (scriptType === 'EditorWindow' || scriptType === 'Editor') {
      this.addImport(file.id, 'using UnityEditor;');
    }
    if (namespace) {
      this.addImport(file.id, 'using System;');
    }

    // Add script metadata
    file.metadata = {
      ...file.metadata,
      scriptType,
      ...metadata
    };

    return file;
  }

  public addMonoBehaviourClass(
    fileId: string,
    className: string,
    requiredComponents: string[] = []
  ): CodeBlock | null {
    const template = this.generateMonoBehaviourTemplate(className, requiredComponents);
    return this.addCodeBlock(fileId, 'class', className, template, ['UnityEngine.MonoBehaviour']);
  }

  public addScriptableObjectClass(
    fileId: string,
    className: string,
    menuPath: string
  ): CodeBlock | null {
    const template = this.generateScriptableObjectTemplate(className, menuPath);
    return this.addCodeBlock(fileId, 'class', className, template, ['UnityEngine.ScriptableObject']);
  }

  public addMethod(
    fileId: string,
    methodName: string,
    parameters: string[] = [],
    returnType: string = 'void',
    content: string = '',
    isCoroutine: boolean = false
  ): CodeBlock | null {
    const template = this.generateMethodTemplate(methodName, parameters, returnType, content, isCoroutine);
    return this.addCodeBlock(fileId, 'method', methodName, template);
  }

  private generateMonoBehaviourTemplate(className: string, requiredComponents: string[]): string {
    const attributes = requiredComponents.map(comp => `[RequireComponent(typeof(${comp}))]`).join('\n');
    return `${attributes}${attributes ? '\n' : ''}public class ${className} : MonoBehaviour
{
    private void Awake()
    {
        // Initialization code
    }

    private void Start()
    {
        // Start code
    }

    private void Update()
    {
        // Update code
    }
}`;
  }

  private generateScriptableObjectTemplate(className: string, menuPath: string): string {
    return `[CreateAssetMenu(fileName = "${className}", menuName = "${menuPath}")]
public class ${className} : ScriptableObject
{
    // ScriptableObject properties
}`;
  }

  private generateMethodTemplate(
    methodName: string,
    parameters: string[],
    returnType: string,
    content: string,
    isCoroutine: boolean
  ): string {
    const paramList = parameters.join(', ');
    const returnTypeStr = isCoroutine ? 'IEnumerator' : returnType;
    const coroutineAttribute = isCoroutine ? '[System.Collections.IEnumerator]\n    ' : '';

    return `${coroutineAttribute}public ${returnTypeStr} ${methodName}(${paramList})
    {
        ${content}
    }`;
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
    if (!file.namespace && file.metadata.scriptType !== 'Editor') {
      warnings.push({
        type: 'best-practice',
        message: 'Consider adding a namespace to organize your code',
        severity: 'warning'
      });
    }

    // Validate code blocks
    for (const block of file.codeBlocks) {
      if (block.type === 'class') {
        // Validate class naming convention
        if (!block.name.match(/^[A-Z][a-zA-Z0-9]*$/)) {
          errors.push({
            type: 'semantic',
            message: `Class name "${block.name}" does not follow C# naming conventions`,
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

    // Add imports
    lines.push(...file.imports);
    lines.push('');

    // Add namespace if specified
    if (file.namespace) {
      lines.push(`namespace ${file.namespace}\n{`);
    }

    // Add code blocks
    for (const block of file.codeBlocks) {
      lines.push(block.content);
      lines.push('');
    }

    // Close namespace
    if (file.namespace) {
      lines.push('}');
    }

    return lines.join('\n');
  }
} 