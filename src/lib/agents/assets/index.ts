export * from './AssetGenerator';
export * from './SpriteGenerator';
export * from './BackgroundGenerator';

import { SpriteGenerator } from './SpriteGenerator';
import { BackgroundGenerator } from './BackgroundGenerator';
import { AssetMetadata, GenerationOptions } from './AssetGenerator';
import path from 'path';

export class AssetSynthesizer {
  private spriteGenerator: SpriteGenerator;
  private backgroundGenerator: BackgroundGenerator;
  private outputDirectory: string;

  constructor(outputDirectory: string) {
    this.outputDirectory = outputDirectory;
    this.spriteGenerator = new SpriteGenerator(path.join(outputDirectory, 'sprites'));
    this.backgroundGenerator = new BackgroundGenerator(path.join(outputDirectory, 'backgrounds'));
  }

  public async generateSprite(
    name: string,
    options: GenerationOptions & {
      frameCount?: number;
      frameDelay?: number;
      isAnimated?: boolean;
      transparentBackground?: boolean;
      palette?: string[];
    }
  ): Promise<AssetMetadata | null> {
    return this.spriteGenerator.generateAsset(name, options);
  }

  public async generateBackground(
    name: string,
    options: GenerationOptions & {
      style: 'solid' | 'gradient' | 'pattern' | 'parallax' | 'noise';
      colors: string[];
      pattern?: {
        type: 'dots' | 'lines' | 'grid' | 'custom';
        size: number;
        spacing: number;
        rotation?: number;
        customSvg?: string;
      };
      parallax?: {
        layers: Array<{
          image: string;
          depth: number;
          opacity: number;
        }>;
        scrollSpeed: number;
      };
      noise?: {
        type: 'perlin' | 'simplex' | 'worley';
        scale: number;
        octaves: number;
        persistence: number;
        seed?: number;
      };
    }
  ): Promise<AssetMetadata | null> {
    return this.backgroundGenerator.generateAsset(name, options);
  }

  public async optimizeAssets(
    assetIds: string[],
    settings?: {
      algorithm?: 'deflate' | 'webp' | 'jpeg' | 'png';
      quality?: number;
      lossless?: boolean;
    }
  ): Promise<Array<{ assetId: string; optimizationResult: any | null }>> {
    const results = [];

    for (const assetId of assetIds) {
      // Try to find the asset in both generators
      const spriteAsset = this.spriteGenerator.getAsset(assetId);
      const backgroundAsset = this.backgroundGenerator.getAsset(assetId);

      if (spriteAsset) {
        const result = await this.spriteGenerator.optimize(assetId, settings);
        results.push({ assetId, optimizationResult: result });
      } else if (backgroundAsset) {
        const result = await this.backgroundGenerator.optimize(assetId, settings);
        results.push({ assetId, optimizationResult: result });
      } else {
        results.push({ assetId, optimizationResult: null });
      }
    }

    return results;
  }

  public getAssetMetadata(assetId: string): AssetMetadata | undefined {
    return this.spriteGenerator.getAsset(assetId) || this.backgroundGenerator.getAsset(assetId);
  }

  public getAssetsByType(type: 'sprite' | 'background'): AssetMetadata[] {
    return type === 'sprite'
      ? this.spriteGenerator.getAssetsByType('sprite')
      : this.backgroundGenerator.getAssetsByType('background');
  }

  public getAssetsByTag(tag: string): AssetMetadata[] {
    return [
      ...this.spriteGenerator.getAssetsByTag(tag),
      ...this.backgroundGenerator.getAssetsByTag(tag)
    ];
  }
} 