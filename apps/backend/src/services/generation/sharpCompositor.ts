import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SharpCompositeOptions {
  width?: number; // default 1080
  height?: number; // default 1350
  heading: string;
  subtext: string;
  badge?: string;
  brandHandle?: string;
  brandName?: string;
  logoPath?: string;
  colors?: {
    accent?: string;
    bg?: string;
    text?: string;
    subtext?: string;
  };
  slideIndex: number;
  totalSlides: number;
}

@Injectable()
export class SharpCompositorService {
  private readonly logger = new Logger(SharpCompositorService.name);

  /**
   * Generates a high-resolution SVG overlay for the 1080x1350 Instagram portrait canvas.
   * Includes:
   * - Top branding bar (brand handle & badge)
   * - Slide index indicator (e.g., 01 / 05)
   * - Cybernetic glow container and borders
   * - Punchy uppercase headline
   * - Legible subtext body typography
   * - Footer brand tag and swipe indicator (✦ SWIPE FOR MORE)
   */
  generateSlideSvgOverlay(options: SharpCompositeOptions): string {
    const w = options.width || 1080;
    const h = options.height || 1350;

    const accent = options.colors?.accent || '#10b981';
    const textColor = options.colors?.text || '#ffffff';
    const subtextColor = options.colors?.subtext || '#d1d5db';
    const brandHandle = options.brandHandle || '@theaiseed';
    const badge = options.badge || (options.slideIndex === 1 ? 'BREAKING INTEL' : `STORY 0${options.slideIndex}`);
    const isLast = options.slideIndex === options.totalSlides;
    const swipeText = isLast ? 'SAVE & FOLLOW ✦' : 'SWIPE FOR MORE ››';

    // Escape XML entities
    const escapeXml = (str: string) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const escapedHeading = escapeXml(options.heading.toUpperCase());
    const escapedSubtext = escapeXml(options.subtext);
    const escapedBadge = escapeXml(badge);
    const escapedHandle = escapeXml(brandHandle);

    return `
      <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="overlayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#050508" stop-opacity="0.85" />
            <stop offset="45%" stop-color="#050508" stop-opacity="0.30" />
            <stop offset="70%" stop-color="#050508" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#050508" stop-opacity="0.95" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Dark Gradient Overlay for optimal text legibility -->
        <rect width="${w}" height="${h}" fill="url(#overlayGrad)" />

        <!-- Cybernetic Frame Outline -->
        <rect x="36" y="36" width="${w - 72}" height="${h - 72}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" rx="20" />

        <!-- Top Header Bar -->
        <g id="top-bar">
          <!-- Slide Number Badge -->
          <rect x="70" y="70" width="110" height="36" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <text x="125" y="93" fill="${accent}" font-family="monospace, -apple-system, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" letter-spacing="2">
            0${options.slideIndex} / 0${options.totalSlides}
          </text>

          <!-- Category Chip -->
          <rect x="200" y="70" width="180" height="36" rx="8" fill="rgba(16,185,129,0.12)" stroke="${accent}" stroke-width="1" stroke-opacity="0.4" />
          <text x="290" y="93" fill="${accent}" font-family="monospace, -apple-system, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" letter-spacing="1.5">
            ${escapedBadge}
          </text>

          <!-- Brand Handle Right -->
          <text x="${w - 70}" y="93" fill="#9ca3af" font-family="-apple-system, sans-serif" font-size="15" font-weight="600" text-anchor="end">
            ${escapedHandle}
          </text>
        </g>

        <!-- Middle Visual Frame Placeholder Outline (image shines through) -->
        <rect x="70" y="140" width="${w - 140}" height="680" rx="16" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5" />

        <!-- Bottom Typography Area -->
        <g id="bottom-content">
          <!-- Main Headline -->
          <text x="70" y="900" fill="${textColor}" font-family="'Inter', -apple-system, sans-serif" font-size="52" font-weight="900" letter-spacing="-1">
            ${escapedHeading.slice(0, 36)}
          </text>

          <!-- Subtext Body -->
          <foreignObject x="70" y="940" width="${w - 140}" height="240">
            <div xmlns="http://www.w3.org/1999/xhtml" style="color: ${subtextColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; line-height: 1.5; font-weight: 400;">
              ${escapedSubtext}
            </div>
          </foreignObject>
        </g>

        <!-- Bottom Footer -->
        <g id="footer">
          <line x1="70" y1="${h - 110}" x2="${w - 70}" y2="${h - 110}" stroke="rgba(255,255,255,0.1)" stroke-width="1" />

          <!-- Left Brand -->
          <text x="70" y="${h - 70}" fill="#9ca3af" font-family="-apple-system, sans-serif" font-size="16" font-weight="bold" letter-spacing="1">
            ${options.brandName ? escapeXml(options.brandName.toUpperCase()) : 'THE AI SEED'} • DAILY INTEL
          </text>

          <!-- Right Call to Action -->
          <text x="${w - 70}" y="${h - 70}" fill="${accent}" font-family="monospace, -apple-system, sans-serif" font-size="15" font-weight="bold" text-anchor="end" letter-spacing="1">
            ${swipeText}
          </text>
        </g>
      </svg>
    `.trim();
  }

  /**
   * Composites background image + SVG overlay + logo using Node.js + Sharp (if available),
   * or returns high-resolution rendered SVG/JPEG buffer.
   */
  async compositeSlide(
    backgroundImageBuffer: Buffer,
    options: SharpCompositeOptions,
  ): Promise<Buffer> {
    const svgOverlay = Buffer.from(this.generateSlideSvgOverlay(options));

    try {
      // Dynamic import of sharp to support systems with or without native binary
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const sharp = require('sharp');
      this.logger.log(`Executing Node.js + Sharp composite for slide ${options.slideIndex}/${options.totalSlides}`);

      const composites: any[] = [{ input: svgOverlay, top: 0, left: 0 }];

      if (options.logoPath && fs.existsSync(options.logoPath)) {
        composites.push({
          input: options.logoPath,
          top: 60,
          left: (options.width || 1080) - 200,
        });
      }

      return await sharp(backgroundImageBuffer)
        .resize(options.width || 1080, options.height || 1350, { fit: 'cover' })
        .composite(composites)
        .jpeg({ quality: 92 })
        .toBuffer();
    } catch {
      this.logger.log(`Sharp native module not active; using procedural slide compositing.`);
      return svgOverlay;
    }
  }
}

export const sharpCompositor = new SharpCompositorService();

