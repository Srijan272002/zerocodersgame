import { AssetGenerator, AssetMetadata, GenerationOptions, CompressionSettings, OptimizationResult } from './AssetGenerator';
import sharp from 'sharp';
import path from 'path';

export interface BackgroundGenerationOptions extends GenerationOptions {
  style: BackgroundStyle;
  colors: string[];
  pattern?: PatternOptions;
  parallax?: ParallaxOptions;
  noise?: NoiseOptions;
}

export type BackgroundStyle = 'solid' | 'gradient' | 'pattern' | 'parallax' | 'noise';

export interface PatternOptions {
  type: 'dots' | 'lines' | 'grid' | 'custom';
  size: number;
  spacing: number;
  rotation?: number;
  customSvg?: string;
}

export interface ParallaxOptions {
  layers: ParallaxLayer[];
  scrollSpeed: number;
}

export interface ParallaxLayer {
  image: string;
  depth: number;
  opacity: number;
}

export interface NoiseOptions {
  type: 'perlin' | 'simplex' | 'worley';
  scale: number;
  octaves: number;
  persistence: number;
  seed?: number;
}

export class BackgroundGenerator extends AssetGenerator {
  constructor(outputDirectory: string) {
    super(outputDirectory);
  }

  public async generateAsset(
    name: string,
    options: BackgroundGenerationOptions
  ): Promise<AssetMetadata | null> {
    try {
      const { dimensions, format, style, colors, pattern, parallax, noise, compression, metadata = {} } = options;

      // Register the asset
      const asset = this.registerAsset(name, 'background', format, options);

      // Generate the background based on style
      let buffer: Buffer;
      switch (style) {
        case 'solid':
          buffer = await this.generateSolidBackground(dimensions, colors[0]);
          break;
        case 'gradient':
          buffer = await this.generateGradientBackground(dimensions, colors);
          break;
        case 'pattern':
          if (!pattern) throw new Error('Pattern options required for pattern style');
          buffer = await this.generatePatternBackground(dimensions, colors, pattern);
          break;
        case 'parallax':
          if (!parallax) throw new Error('Parallax options required for parallax style');
          buffer = await this.generateParallaxBackground(dimensions, parallax);
          break;
        case 'noise':
          if (!noise) throw new Error('Noise options required for noise style');
          buffer = await this.generateNoiseBackground(dimensions, colors, noise);
          break;
        default:
          throw new Error(`Unsupported background style: ${style}`);
      }

      // Save the background
      const outputPath = path.join(this.outputDirectory, `${name}.${format}`);
      await this.saveBackgroundToFile(buffer, outputPath, format);

      // Get the file size
      const stats = await sharp(outputPath).metadata();
      asset.size = stats.size;

      // Optimize if compression settings are provided
      if (compression) {
        await this.optimizeAsset(asset.id, compression);
      }

      return asset;
    } catch (error) {
      console.error(`Failed to generate background ${name}:`, error);
      return null;
    }
  }

  private async generateSolidBackground(
    dimensions: { width: number; height: number },
    color: string
  ): Promise<Buffer> {
    const { width, height } = dimensions;
    return sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: parseInt(color.slice(1, 3), 16), g: parseInt(color.slice(3, 5), 16), b: parseInt(color.slice(5, 7), 16), alpha: 1 }
      }
    }).toBuffer();
  }

  private async generateGradientBackground(
    dimensions: { width: number; height: number },
    colors: string[]
  ): Promise<Buffer> {
    const { width, height } = dimensions;
    const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            ${colors.map((color, index) => `
              <stop offset="${(index * 100) / (colors.length - 1)}%" 
                    style="stop-color:${color};stop-opacity:1" />
            `).join('')}
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
      </svg>
    `;

    return sharp(Buffer.from(svg)).toBuffer();
  }

  private async generatePatternBackground(
    dimensions: { width: number; height: number },
    colors: string[],
    pattern: PatternOptions
  ): Promise<Buffer> {
    const { width, height } = dimensions;
    const { type, size, spacing, rotation = 0, customSvg } = pattern;

    let patternSvg: string;
    if (type === 'custom' && customSvg) {
      patternSvg = customSvg;
    } else {
      // Generate pattern SVG based on type
      switch (type) {
        case 'dots':
          patternSvg = this.generateDotPattern(size, spacing, colors);
          break;
        case 'lines':
          patternSvg = this.generateLinePattern(size, spacing, colors);
          break;
        case 'grid':
          patternSvg = this.generateGridPattern(size, spacing, colors);
          break;
        default:
          throw new Error(`Unsupported pattern type: ${type}`);
      }
    }

    const svg = `
      <svg width="${width}" height="${height}">
        <defs>
          <pattern id="pattern" width="${spacing}" height="${spacing}" 
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(${rotation})">
            ${patternSvg}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pattern)"/>
      </svg>
    `;

    return sharp(Buffer.from(svg)).toBuffer();
  }

  private generateDotPattern(size: number, spacing: number, colors: string[]): string {
    return `<circle cx="${spacing/2}" cy="${spacing/2}" r="${size/2}" fill="${colors[0]}"/>`;
  }

  private generateLinePattern(size: number, spacing: number, colors: string[]): string {
    return `<line x1="0" y1="0" x2="${spacing}" y2="0" 
                  stroke="${colors[0]}" stroke-width="${size}"/>`;
  }

  private generateGridPattern(size: number, spacing: number, colors: string[]): string {
    return `
      <line x1="0" y1="0" x2="${spacing}" y2="0" 
            stroke="${colors[0]}" stroke-width="${size}"/>
      <line x1="0" y1="0" x2="0" y2="${spacing}" 
            stroke="${colors[0]}" stroke-width="${size}"/>
    `;
  }

  private async generateParallaxBackground(
    dimensions: { width: number; height: number },
    options: ParallaxOptions
  ): Promise<Buffer> {
    const { width, height } = dimensions;
    const { layers } = options;

    // Create a composite image with all layers
    const composite = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    });

    // Add each layer with its opacity
    const overlays = await Promise.all(
      layers.map(async layer => ({
        input: await sharp(layer.image)
          .resize(width, height)
          .composite([{
            input: Buffer.from([255, 255, 255, Math.round(layer.opacity * 255)]),
            raw: { width: 1, height: 1, channels: 4 },
            tile: true,
            blend: 'dest-in' as const
          }])
          .toBuffer(),
        blend: 'over' as const
      }))
    );

    return composite.composite(overlays).toBuffer();
  }

  private async generateNoiseBackground(
    dimensions: { width: number; height: number },
    colors: string[],
    options: NoiseOptions
  ): Promise<Buffer> {
    // This is a simplified noise implementation
    // A proper implementation would use actual noise algorithms
    const { width, height } = dimensions;
    const { scale, octaves } = options;

    const canvas = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const value = Math.random() * 255;
        canvas[i] = value;
        canvas[i + 1] = value;
        canvas[i + 2] = value;
        canvas[i + 3] = 255;
      }
    }

    return sharp(canvas, {
      raw: {
        width,
        height,
        channels: 4
      }
    }).toBuffer();
  }

  private async saveBackgroundToFile(
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