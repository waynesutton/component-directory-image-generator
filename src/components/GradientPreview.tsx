import { useEffect, RefObject } from "react";
import { GradientConfig } from "./GradientGenerator";

type Props = {
  config: GradientConfig;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onExport: () => void;
  overlayImage: HTMLImageElement | null;
  overlaySize: number;
  centerImage: HTMLImageElement | null;
  centerSize: number;
};

export function GradientPreview({ config, canvasRef, onExport, overlayImage, overlaySize, centerImage, centerSize }: Props) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = 1536;
    const height = 864;

    canvas.width = width;
    canvas.height = height;

    // Pastel gradient mode
    const angleRad = (config.angle * Math.PI) / 180;
    const x0 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y0 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x1 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 + (Math.sin(angleRad) * height) / 2;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    config.colorStops.forEach((stop) => {
      // Only add valid hex colors
      if (/^#[0-9A-Fa-f]{6}$/.test(stop.color)) {
        gradient.addColorStop(stop.position / 100, stop.color);
      }
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Apply grain texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 255 * config.grainIntensity;
      data[i] += grain;
      data[i + 1] += grain;
      data[i + 2] += grain;
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw overlay image if present (top-left)
    if (overlayImage) {
      const padding = 64;
      
      let drawWidth = overlayImage.width;
      let drawHeight = overlayImage.height;
      
      const scale = Math.min(overlaySize / drawWidth, overlaySize / drawHeight);
      drawWidth = drawWidth * scale;
      drawHeight = drawHeight * scale;
      
      ctx.drawImage(overlayImage, padding, padding, drawWidth, drawHeight);
    }

    // Draw center image if present
    if (centerImage) {
      let drawWidth = centerImage.width;
      let drawHeight = centerImage.height;
      
      const scale = Math.min(centerSize / drawWidth, centerSize / drawHeight);
      drawWidth = drawWidth * scale;
      drawHeight = drawHeight * scale;
      
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      
      ctx.drawImage(centerImage, x, y, drawWidth, drawHeight);
    }
  }, [config, canvasRef, overlayImage, overlaySize, centerImage, centerSize]);

  const handleExport = () => {
    if (!canvasRef.current) return;
    
    const timestamp = Date.now();
    const slug = config.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const filename = `component-gradient-${slug}-${timestamp}.png`;
    
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    
    onExport();
  };

  return (
    <div className="bg-[#f5f3f0] rounded-lg border border-[#e6e4e1] shadow-sm p-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl font-semibold text-[#1a1a1a]">Preview</h2>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto px-4 py-2 bg-[#EB5601] text-white rounded-lg hover:bg-[#d14a01] transition-colors font-medium text-sm sm:text-base"
        >
          Export PNG (1536×864)
        </button>
      </div>

      <div className="relative w-full bg-[#faf8f5] rounded-lg overflow-hidden border border-[#e6e4e1]">
        <div className="aspect-[16/9] relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <div className="text-sm text-[#6b6b6b] text-center">
        16:9 aspect ratio • 1536 × 864 pixels • Pastel Mode
      </div>
    </div>
  );
}
