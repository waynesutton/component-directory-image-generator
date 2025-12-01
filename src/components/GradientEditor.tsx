import { useRef, useState } from "react";
import { GradientConfig, ColorStop } from "./GradientGenerator";

type Props = {
  config: GradientConfig;
  onConfigChange: (config: GradientConfig) => void;
  onSave: () => void;
  onSaveAsNew: () => void;
  onDelete?: () => void;
  onGenerateVariant: (colorCount: number) => void;
  onAddNewPresets: () => void;
  overlayImage: HTMLImageElement | null;
  overlayDimensions: { width: number; height: number } | null;
  overlaySize: number;
  onOverlaySizeChange: (size: number) => void;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
  centerImage: HTMLImageElement | null;
  centerDimensions: { width: number; height: number } | null;
  centerSize: number;
  onCenterSizeChange: (size: number) => void;
  onCenterImageUpload: (file: File) => void;
  onRemoveCenterImage: () => void;
};

export function GradientEditor({
  config,
  onConfigChange,
  onSave,
  onSaveAsNew,
  onDelete,
  onGenerateVariant,
  onAddNewPresets,
  overlayImage,
  overlayDimensions,
  overlaySize,
  onOverlaySizeChange,
  onImageUpload,
  onRemoveImage,
  centerImage,
  centerDimensions,
  centerSize,
  onCenterSizeChange,
  onCenterImageUpload,
  onRemoveCenterImage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const centerFileInputRef = useRef<HTMLInputElement>(null);
  const [colorStopCount, setColorStopCount] = useState(3);

  const updateColorStop = (index: number, updates: Partial<ColorStop>) => {
    const newStops = [...config.colorStops];
    newStops[index] = { ...newStops[index], ...updates };
    onConfigChange({ ...config, colorStops: newStops });
  };

  const addColorStop = () => {
    if (config.colorStops.length >= 4) return;
    const newStops = [
      ...config.colorStops,
      { color: "#FFFFFF", position: 50 },
    ].sort((a, b) => a.position - b.position);
    onConfigChange({ ...config, colorStops: newStops });
  };

  const removeColorStop = (index: number) => {
    if (config.colorStops.length <= 2) return;
    const newStops = config.colorStops.filter((_, i) => i !== index);
    onConfigChange({ ...config, colorStops: newStops });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleCenterFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCenterImageUpload(file);
    }
    if (centerFileInputRef.current) {
      centerFileInputRef.current.value = "";
    }
  };

  const triggerCenterFileInput = () => {
    centerFileInputRef.current?.click();
  };

  return (
    <div className="bg-[#f5f3f0] rounded-lg border border-[#e6e4e1] shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-[#1a1a1a]">Editor</h2>

      <div>
        <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
          Angle: {Math.round(config.angle)}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={config.angle}
          onChange={(e) =>
            onConfigChange({ ...config, angle: Number(e.target.value) })
          }
          className="w-full accent-[#EB5601]"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-[#1a1a1a]">
            Color Stops (2-4 max)
          </label>
          {config.colorStops.length < 4 && (
            <button
              onClick={addColorStop}
              className="text-sm text-[#EB5601] hover:text-[#d14a01] font-medium"
            >
              + Add Stop
            </button>
          )}
        </div>
        <div className="space-y-3">
          {config.colorStops.map((stop, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) =>
                  updateColorStop(index, { color: e.target.value })
                }
                className="w-12 h-10 rounded border border-[#e6e4e1] cursor-pointer"
              />
              <input
                type="text"
                value={stop.color}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith('#') && value.length <= 7) {
                    updateColorStop(index, { color: value });
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                    updateColorStop(index, { color: stop.color });
                  }
                }}
                className="flex-1 px-3 py-2 bg-white border border-[#e6e4e1] rounded-lg text-sm font-mono text-[#1a1a1a]"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={stop.position}
                onChange={(e) =>
                  updateColorStop(index, { position: Number(e.target.value) })
                }
                className="w-20 px-3 py-2 bg-white border border-[#e6e4e1] rounded-lg text-sm text-[#1a1a1a]"
              />
              <span className="text-sm text-[#6b6b6b]">%</span>
              {config.colorStops.length > 2 && (
                <button
                  onClick={() => removeColorStop(index)}
                  className="text-[#EB5601] hover:text-[#d14a01] px-2 text-xl"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e6e4e1] pt-6">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Top-Left Overlay Image</h3>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,.png,.svg"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!overlayImage ? (
          <button
            onClick={triggerFileInput}
            className="w-full px-4 py-3 bg-[#EB5601] text-[#faf8f5] rounded-lg hover:bg-[#d14a01] transition-colors font-medium"
          >
            Upload PNG or SVG
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-[#e6e4e1] rounded-lg">
              <img
                src={overlayImage.src}
                alt="Overlay thumbnail"
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1a1a1a]">Overlay Image</p>
                {overlayDimensions && (
                  <p className="text-xs text-[#6b6b6b]">
                    {overlayDimensions.width} × {overlayDimensions.height} px
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Image Size: {overlaySize}px
              </label>
              <input
                type="range"
                min="50"
                max="400"
                step="10"
                value={overlaySize}
                onChange={(e) => onOverlaySizeChange(Number(e.target.value))}
                className="w-full accent-[#EB5601]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={triggerFileInput}
                className="flex-1 px-4 py-2 bg-[#EB5601] text-[#faf8f5] rounded-lg hover:bg-[#d14a01] transition-colors font-medium"
              >
                Replace Image
              </button>
              <button
                onClick={onRemoveImage}
                className="flex-1 px-4 py-2 bg-[#6b6b6b] text-[#faf8f5] rounded-lg hover:bg-[#5a5a5a] transition-colors font-medium"
              >
                Remove Image
              </button>
            </div>
          </div>
        )}
        
        <p className="text-xs text-[#6b6b6b] mt-2">
          PNG or SVG • Max 3 MB • Appears in top-left corner
        </p>
      </div>

      <div className="border-t border-[#e6e4e1] pt-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[#1a1a1a]">Center Overlay Image</h3>
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
          <button
            onClick={triggerCenterFileInput}
            className="w-full px-4 py-3 bg-[#EB5601] text-[#faf8f5] rounded-lg hover:bg-[#d14a01] transition-colors font-medium"
          >
            Upload PNG or SVG
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white border border-[#e6e4e1] rounded-lg">
              <img
                src={centerImage.src}
                alt="Center overlay thumbnail"
                className="w-16 h-16 object-contain"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#1a1a1a]">Center Image</p>
                {centerDimensions && (
                  <p className="text-xs text-[#6b6b6b]">
                    {centerDimensions.width} × {centerDimensions.height} px
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
                min="50"
                max="600"
                step="10"
                value={centerSize}
                onChange={(e) => onCenterSizeChange(Number(e.target.value))}
                className="w-full accent-[#EB5601]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={triggerCenterFileInput}
                className="flex-1 px-4 py-2 bg-[#EB5601] text-[#faf8f5] rounded-lg hover:bg-[#d14a01] transition-colors font-medium"
              >
                Replace Image
              </button>
              <button
                onClick={onRemoveCenterImage}
                className="flex-1 px-4 py-2 bg-[#6b6b6b] text-[#faf8f5] rounded-lg hover:bg-[#5a5a5a] transition-colors font-medium"
              >
                Remove Image
              </button>
            </div>
          </div>
        )}
        
        <p className="text-xs text-[#6b6b6b] mt-2">
          PNG or SVG • Max 3 MB • Appears in center
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-[#e6e4e1]">
        <button
          onClick={onSave}
          className="flex-1 px-4 py-2 bg-[#EB5601] text-white rounded-lg hover:bg-[#d14a01] transition-colors font-medium"
        >
          Save
        </button>
        <button
          onClick={onSaveAsNew}
          className="flex-1 px-4 py-2 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6449] transition-colors font-medium"
        >
          Save as New
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-[#6b6b6b] text-white rounded-lg hover:bg-[#5a5a5a] transition-colors font-medium"
          >
            Delete
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
            Number of Colors
          </label>
          <div className="flex gap-2">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                onClick={() => setColorStopCount(count)}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                  colorStopCount === count
                    ? "bg-[#EB5601] text-white"
                    : "bg-white border border-[#e6e4e1] text-[#1a1a1a] hover:border-[#8b7355]"
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onGenerateVariant(colorStopCount)}
          className="w-full px-4 py-2 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6449] transition-colors font-medium"
        >
          Generate Random Variant
        </button>
        <button
          onClick={onAddNewPresets}
          className="w-full px-4 py-2 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6449] transition-colors font-medium"
        >
          Add New Presets
        </button>
      </div>
    </div>
  );
}
