export * from './CodeGenerator';
export * from './UnityGenerator';
export * from './GodotGenerator';

import { UnityGenerator } from './UnityGenerator';
import { GodotGenerator } from './GodotGenerator';
import { ValidationResult } from './CodeGenerator';

export class CodeSynthesizer {
  private unityGenerator: UnityGenerator;
  private godotGenerator: GodotGenerator;

  constructor() {
    this.unityGenerator = new UnityGenerator();
    this.godotGenerator = new GodotGenerator();
  }

  public generateUnityScript(
    filename: string,
    scriptType: 'MonoBehaviour' | 'ScriptableObject' | 'EditorWindow' | 'Editor',
    namespace?: string
  ) {
    const file = this.unityGenerator.createUnityScript(filename, scriptType, namespace);
    
    if (scriptType === 'MonoBehaviour') {
      this.unityGenerator.addMonoBehaviourClass(file.id, filename);
    } else if (scriptType === 'ScriptableObject') {
      this.unityGenerator.addScriptableObjectClass(file.id, filename, `ScriptableObjects/${filename}`);
    }

    return {
      fileId: file.id,
      code: this.unityGenerator.generateCode(file.id),
      validation: this.unityGenerator.validate(file.id)
    };
  }

  public generateGodotScript(
    filename: string,
    baseClass: string = 'Node',
    isTool: boolean = false
  ) {
    const file = this.godotGenerator.createGodotScript(filename, baseClass, { tool: isTool });

    return {
      fileId: file.id,
      code: this.godotGenerator.generateCode(file.id),
      validation: this.godotGenerator.validate(file.id)
    };
  }

  public addUnityMethod(
    fileId: string,
    methodName: string,
    parameters: string[] = [],
    returnType: string = 'void',
    content: string = '',
    isCoroutine: boolean = false
  ) {
    const method = this.unityGenerator.addMethod(
      fileId,
      methodName,
      parameters,
      returnType,
      content,
      isCoroutine
    );

    return method ? {
      methodId: method.id,
      validation: this.unityGenerator.validate(fileId)
    } : null;
  }

  public addGodotMethod(
    fileId: string,
    methodName: string,
    parameters: string[] = [],
    content: string = '',
    isVirtual: boolean = false
  ) {
    const method = this.godotGenerator.addMethod(
      fileId,
      methodName,
      parameters,
      content,
      isVirtual
    );

    return method ? {
      methodId: method.id,
      validation: this.godotGenerator.validate(fileId)
    } : null;
  }

  public validateCode(fileId: string, engine: 'unity' | 'godot'): ValidationResult {
    return engine === 'unity'
      ? this.unityGenerator.validate(fileId)
      : this.godotGenerator.validate(fileId);
  }

  public getGeneratedCode(fileId: string, engine: 'unity' | 'godot'): string {
    return engine === 'unity'
      ? this.unityGenerator.generateCode(fileId)
      : this.godotGenerator.generateCode(fileId);
  }
} 