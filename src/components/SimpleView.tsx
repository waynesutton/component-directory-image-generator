import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// Default Image preset configuration (matches backend)
const DEFAULT_GRADIENT = {
  name: "Default Image",
  angle: 135,
  colorStops: [
    { color: "#fdcbba", position: 0 },
    { color: "#fbe0c1", position: 40 },
    { color: "#fdf2e2", position: 100 },
  ],
  grainIntensity: 0.15,
};

export function SimpleView() {
  const [centerImage, setCenterImage] = useState<HTMLImageElement | null>(null);
  const [centerDimensions, setCenterDimensions] = useState<{ width: number; height: number } | null>(null);
  const [centerSize, setCenterSize] = useState<number>(400);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const centerFileInputRef = useRef<HTMLInputElement>(null);

  // Render canvas with default gradient and center image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const width = 1536;
    const height = 864;

    canvas.width = width;
    canvas.height = height;

    // Draw the default gradient
    const angleRad = (DEFAULT_GRADIENT.angle * Math.PI) / 180;
    const x0 = width / 2 - (Math.cos(angleRad) * width) / 2;
    const y0 = height / 2 - (Math.sin(angleRad) * height) / 2;
    const x1 = width / 2 + (Math.cos(angleRad) * width) / 2;
    const y1 = height / 2 + (Math.sin(angleRad) * height) / 2;

    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    DEFAULT_GRADIENT.colorStops.forEach((stop) => {
      gradient.addColorStop(stop.position / 100, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Apply grain texture
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const grain = (Math.random() - 0.5) * 255 * DEFAULT_GRADIENT.grainIntensity;
      data[i] += grain;
      data[i + 1] += grain;
      data[i + 2] += grain;
    }

    ctx.putImageData(imageData, 0, 0);

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
  }, [centerImage, centerSize]);

  // Handle center image upload (PNG or SVG)
  const handleCenterImageUpload = (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size must be less than 3 MB");
      return;
    }

    const validTypes = ["image/png", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only PNG and SVG files are supported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setCenterImage(img);
        setCenterDimensions({ width: img.width, height: img.height });
        toast.success("Image uploaded successfully");
      };
      img.onerror = () => {
        toast.error("Failed to load image");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle file input change
  const handleCenterFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCenterImageUpload(file);
    }
    if (centerFileInputRef.current) {
      centerFileInputRef.current.value = "";
    }
  };

  // Trigger file input
  const triggerCenterFileInput = () => {
    centerFileInputRef.current?.click();
  };

  // Remove center image
  const handleRemoveCenterImage = () => {
    setCenterImage(null);
    setCenterDimensions(null);
    toast.success("Image removed");
  };

  // Export the image
  const handleExport = () => {
    if (!canvasRef.current) return;

    const timestamp = Date.now();
    const filename = `component-gradient-default-image-${timestamp}.png`;

    const link = document.createElement("a");
    link.download = filename;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    toast.success("PNG downloaded at 1536 × 864");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview Section */}
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
            16:9 aspect ratio • 1536 × 864 pixels • Default Image Gradient
          </div>
        </div>

        {/* Editor Section */}
        <div className="bg-[#f5f3f0] rounded-lg border border-[#e6e4e1] shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a1a]">Center Overlay Image</h2>
            <p className="text-sm text-[#6b6b6b] mt-1">Upload a logo or artwork for component thumbnail image</p>
          </div>
          
          <input
            ref={centerFileInputRef}
            type="file"
            accept="image/png,image/svg+xml,.png,.svg"
            onChange={handleCenterFileSelect}
            className="hidden"
          />

          {!centerImage ? (
            <div className="space-y-4">
              <button
                onClick={triggerCenterFileInput}
                className="w-full px-4 py-4 bg-[#EB5601] text-[#faf8f5] rounded-lg hover:bg-[#d14a01] transition-colors font-medium text-lg"
              >
                Upload PNG or SVG
              </button>
              <p className="text-sm text-[#6b6b6b] text-center">
                PNG or SVG • Max 3 MB • Appears in center of image
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white border border-[#e6e4e1] rounded-lg">
                <img
                  src={centerImage.src}
                  alt="Center overlay thumbnail"
                  className="w-20 h-20 object-contain"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#1a1a1a]">Center Image</p>
                  {centerDimensions && (
                    <p className="text-xs text-[#6b6b6b]">
                      Original: {centerDimensions.width} × {centerDimensions.height} px
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Image Size: {centerSize}px
                </label>
                <input
                  type="range"
                  min="100"
                  max="800"
                  step="10"
                  value={centerSize}
                  onChange={(e) => setCenterSize(Number(e.target.value))}
                  className="w-full accent-[#EB5601]"
                />
                <div className="flex justify-between text-xs text-[#6b6b6b] mt-1">
                  <span>100px</span>
                  <span>800px</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={triggerCenterFileInput}
                  className="flex-1 px-4 py-3 bg-[#EB5601] text-[#faf8f5] rounded-lg hover:bg-[#d14a01] transition-colors font-medium"
                >
                  Replace Image
                </button>
                <button
                  onClick={handleRemoveCenterImage}
                  className="flex-1 px-4 py-3 bg-[#6b6b6b] text-[#faf8f5] rounded-lg hover:bg-[#5a5a5a] transition-colors font-medium"
                >
                  Remove Image
                </button>
              </div>
            </div>
          )}

          <p className="text-xs text-[#6b6b6b] text-center pt-4 border-t border-[#e6e4e1]">
            Switch to Advanced view to customize gradients
          </p>
        </div>
      </div>
    </div>
  );
}
