import { AssetGenerator, AssetMetadata, GenerationOptions, CompressionSettings, OptimizationResult } from './AssetGenerator';
import sharp from 'sharp';
import path from 'path';

export interface SpriteGenerationOptions extends GenerationOptions {
  frameCount?: number;
  frameDelay?: number;
  isAnimated?: boolean;
  transparentBackground?: boolean;
  palette?: string[]; // Array of hex colors
}

export interface SpriteMetadata {
  frameCount: number;
  frameDelay: number;
  isAnimated: boolean;
  palette: string[];
  transparentBackground: boolean;
}

export class SpriteGenerator extends AssetGenerator {
  constructor(outputDirectory: string) {
    super(outputDirectory);
  }

  public async generateAsset(
    name: string,
    options: SpriteGenerationOptions
  ): Promise<AssetMetadata | null> {
    try {
      const {
        dimensions,
        format,
        frameCount = 1,
        frameDelay = 100,
        isAnimated = false,
        transparentBackground = true,
        palette = [],
        compression,
        metadata = {}
      } = options;

      // Register the asset first
      const asset = this.registerAsset(name, 'sprite', format, options);

      // Update sprite-specific metadata
      const spriteMetadata: SpriteMetadata = {
        frameCount,
        frameDelay,
        isAnimated,
        palette,
        transparentBackground
      };

      this.updateAssetMetadata(asset.id, {
        ...metadata,
        sprite: spriteMetadata
      });

      // Generate the sprite
      const buffer = await this.generateSpriteBuffer(dimensions, spriteMetadata);

      // Save the sprite
      const outputPath = path.join(this.outputDirectory, `${name}.${format}`);
      await this.saveSpriteToFile(buffer, outputPath, format);

      // Get the file size
      const stats = await sharp(outputPath).metadata();
      asset.size = stats.size;

      // Optimize if compression settings are provided
      if (compression) {
        await this.optimizeAsset(asset.id, compression);
      }

      return asset;
    } catch (error) {
      console.error(`Failed to generate sprite ${name}:`, error);
      return null;
    }
  }

  private async generateSpriteBuffer(
    dimensions: { width: number; height: number },
    metadata: SpriteMetadata
  ): Promise<Buffer> {
    const { width, height } = dimensions;
    const { transparentBackground, palette } = metadata;

    // Create a new image with the specified dimensions
    let image = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: transparentBackground ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 }
      }
    });

    // If we have a palette, create a gradient or pattern using the colors
    if (palette.length > 0) {
      // Implementation of pattern/gradient generation would go here
      // This is a placeholder that creates a simple gradient
      const gradient = await this.createGradientFromPalette(dimensions, palette);
      image = sharp(gradient);
    }

    return image.toBuffer();
  }

  private async createGradientFromPalette(
    dimensions: { width: number; height: number },
    palette: string[]
  ): Promise<Buffer> {
    // This is a simplified gradient generation
    // A more sophisticated implementation would create proper gradients
    const { width, height } = dimensions;
    const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            ${palette.map((color, index) => `
              <stop offset="${(index * 100) / (palette.length - 1)}%" 
                    style="stop-color:${color};stop-opacity:1" />
            `).join('')}
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
      </svg>
    `;

    return sharp(Buffer.from(svg)).toBuffer();
  }

  private async saveSpriteToFile(
    buffer: Buffer,
    outputPath: string,
    format: string
  ): Promise<void> {
    const image = sharp(buffer);

    switch (format) {
      case 'png':
        await image.png().toFile(outputPath);
        break;
      case 'jpg':
        await image.jpeg().toFile(outputPath);
        break;
      case 'webp':
        await image.webp().toFile(outputPath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  protected async compressAsset(
    asset: AssetMetadata,
    settings: CompressionSettings
  ): Promise<OptimizationResult> {
    const inputPath = path.join(this.outputDirectory, `${asset.name}.${asset.format}`);
    const originalSize = (await sharp(inputPath).metadata()).size || 0;

    let image = sharp(inputPath);
    const { algorithm, quality, lossless } = settings;

    switch (algorithm) {
      case 'webp':
        image = image.webp({ quality, lossless });
        break;
      case 'jpeg':
        image = image.jpeg({ quality });
        break;
      case 'png':
        image = image.png({ quality });
        break;
      default:
        throw new Error(`Unsupported compression algorithm: ${algorithm}`);
    }

    const outputBuffer = await image.toBuffer();
    const optimizedSize = outputBuffer.length;

    // Save the optimized version
    const optimizedPath = path.join(
      this.outputDirectory,
      `${asset.name}_optimized.${algorithm === 'jpeg' ? 'jpg' : algorithm}`
    );
    await image.toFile(optimizedPath);

    return {
      originalSize,
      optimizedSize,
      compressionRatio: originalSize / optimizedSize,
      format: algorithm === 'jpeg' ? 'jpg' : algorithm as any,
      quality
    };
  }
} 