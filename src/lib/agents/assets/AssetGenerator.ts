import { v4 as uuidv4 } from 'uuid';

export interface AssetMetadata {
  id: string;
  name: string;
  type: AssetType;
  format: AssetFormat;
  dimensions?: { width: number; height: number };
  size?: number; // in bytes
  compression?: CompressionSettings;
  tags: string[];
  metadata: Record<string, any>;
}

export type AssetType = 'sprite' | 'background' | 'tileset' | 'animation' | 'particle';
export type AssetFormat = 'png' | 'jpg' | 'webp' | 'svg';

export interface CompressionSettings {
  algorithm: 'deflate' | 'webp' | 'jpeg' | 'png';
  quality: number; // 0-100
  lossless: boolean;
}

export interface GenerationOptions {
  dimensions: { width: number; height: number };
  format: AssetFormat;
  compression?: Partial<CompressionSettings>;
  metadata?: Record<string, any>;
}

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: AssetFormat;
  quality: number;
}

export abstract class AssetGenerator {
  protected assets: Map<string, AssetMetadata>;
  protected outputDirectory: string;

  constructor(outputDirectory: string) {
    this.assets = new Map();
    this.outputDirectory = outputDirectory;
  }

  protected registerAsset(
    name: string,
    type: AssetType,
    format: AssetFormat,
    options: Partial<GenerationOptions> = {}
  ): AssetMetadata {
    const asset: AssetMetadata = {
      id: uuidv4(),
      name,
      type,
      format,
      dimensions: options.dimensions,
      tags: [],
      metadata: options.metadata || {}
    };

    this.assets.set(asset.id, asset);
    return asset;
  }

  protected async optimizeAsset(
    assetId: string,
    settings?: Partial<CompressionSettings>
  ): Promise<OptimizationResult | null> {
    const asset = this.assets.get(assetId);
    if (!asset) return null;

    const defaultSettings: CompressionSettings = {
      algorithm: 'webp',
      quality: 85,
      lossless: false
    };

    const finalSettings = { ...defaultSettings, ...settings };
    
    try {
      // Implement optimization logic based on the asset type and settings
      const result = await this.compressAsset(asset, finalSettings);
      
      // Update asset metadata with new size and compression info
      asset.size = result.optimizedSize;
      asset.compression = finalSettings;
      
      return result;
    } catch (error) {
      console.error(`Failed to optimize asset ${asset.name}:`, error);
      return null;
    }
  }

  protected abstract compressAsset(
    asset: AssetMetadata,
    settings: CompressionSettings
  ): Promise<OptimizationResult>;

  public getAsset(assetId: string): AssetMetadata | undefined {
    return this.assets.get(assetId);
  }

  public getAssetsByType(type: AssetType): AssetMetadata[] {
    return Array.from(this.assets.values()).filter(asset => asset.type === type);
  }

  public getAssetsByTag(tag: string): AssetMetadata[] {
    return Array.from(this.assets.values()).filter(asset => asset.tags.includes(tag));
  }

  public addAssetTag(assetId: string, tag: string): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;

    if (!asset.tags.includes(tag)) {
      asset.tags.push(tag);
    }
    return true;
  }

  public updateAssetMetadata(
    assetId: string,
    metadata: Record<string, any>
  ): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;

    asset.metadata = { ...asset.metadata, ...metadata };
    return true;
  }

  public async optimize(
    assetId: string,
    settings?: Partial<CompressionSettings>
  ): Promise<OptimizationResult | null> {
    return this.optimizeAsset(assetId, settings);
  }

  abstract generateAsset(
    name: string,
    options: GenerationOptions
  ): Promise<AssetMetadata | null>;
} 