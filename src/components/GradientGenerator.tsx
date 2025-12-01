import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { GradientPreview } from "./GradientPreview";
import { GradientEditor } from "./GradientEditor";
import { GradientGallery } from "./GradientGallery";

export type ColorStop = {
  color: string;
  position: number;
};

export type GradientConfig = {
  name: string;
  angle: number;
  colorStops: ColorStop[];
  grainIntensity: number;
  tags: string[];
};

export function GradientGenerator() {
  const gradients = useQuery(api.gradients.list, {});
  const createGradient = useMutation(api.gradients.create);
  const updateGradient = useMutation(api.gradients.update);
  const removeGradient = useMutation(api.gradients.remove);
  const initializePresets = useMutation(api.gradients.initializePresets);
  const addNewPresets = useMutation(api.gradients.addNewPresets);
  const ensureDefaultImagePreset = useMutation(api.gradients.ensureDefaultImagePreset);

  const [selectedId, setSelectedId] = useState<Id<"gradients"> | null>(null);
  const [config, setConfig] = useState<GradientConfig>({
    name: "Default Image",
    angle: 135,
    colorStops: [
      { color: "#fdcbba", position: 0 },
      { color: "#fbe0c1", position: 40 },
      { color: "#fdf2e2", position: 100 },
    ],
    grainIntensity: 0.15,
    tags: ["warm", "soft", "default"],
  });
  const [overlayImage, setOverlayImage] = useState<HTMLImageElement | null>(null);
  const [overlayDimensions, setOverlayDimensions] = useState<{ width: number; height: number } | null>(null);
  const [overlaySize, setOverlaySize] = useState<number>(200);
  const [centerImage, setCenterImage] = useState<HTMLImageElement | null>(null);
  const [centerDimensions, setCenterDimensions] = useState<{ width: number; height: number } | null>(null);
  const [centerSize, setCenterSize] = useState<number>(300);
  const [hasInitialized, setHasInitialized] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize presets and ensure Default Image exists
  useEffect(() => {
    if (gradients !== undefined && !hasInitialized) {
      setHasInitialized(true);
      if (gradients.length === 0) {
        initializePresets();
      } else {
        ensureDefaultImagePreset();
      }
    }
  }, [gradients, hasInitialized, initializePresets, ensureDefaultImagePreset]);

  // Select Default Image as the default gradient on load
  useEffect(() => {
    if (gradients && gradients.length > 0 && !selectedId) {
      const defaultGradient = gradients.find((g) => g.name === "Default Image") || gradients[0];
      if (defaultGradient) {
        setSelectedId(defaultGradient._id);
        setConfig({
          name: defaultGradient.name,
          angle: defaultGradient.angle,
          colorStops: defaultGradient.stops.map((s) => ({
            color: s.color,
            position: s.position,
          })),
          grainIntensity: defaultGradient.grainIntensity,
          tags: defaultGradient.tags,
        });
      }
    }
  }, [gradients, selectedId]);

  const generateGradientName = () => {
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `Gradient ${timestamp}`;
  };

  const handleSelectGradient = (id: Id<"gradients">) => {
    const gradient = gradients?.find((g) => g._id === id);
    if (gradient) {
      setSelectedId(id);
      setConfig({
        name: gradient.name,
        angle: gradient.angle,
        colorStops: gradient.stops.map((s) => ({
          color: s.color,
          position: s.position,
        })),
        grainIntensity: gradient.grainIntensity,
        tags: gradient.tags,
      });
    }
  };

  const handleSave = async () => {
    try {
      const stops = config.colorStops.map((s) => ({
        position: s.position,
        color: s.color,
      }));

      if (selectedId) {
        await updateGradient({
          id: selectedId,
          name: config.name,
          angle: config.angle,
          stops,
          tags: [],
          grainIntensity: config.grainIntensity,
        });
        toast.success("Gradient updated!");
      } else {
        const name = generateGradientName();
        const id = await createGradient({
          name,
          angle: config.angle,
          stops,
          tags: [],
          grainIntensity: config.grainIntensity,
        });
        setSelectedId(id);
        setConfig({ ...config, name });
        toast.success("Gradient saved!");
      }
    } catch (error) {
      toast.error("Failed to save gradient");
    }
  };

  const handleSaveAsNew = async () => {
    try {
      const stops = config.colorStops.map((s) => ({
        position: s.position,
        color: s.color,
      }));

      const name = generateGradientName();
      const id = await createGradient({
        name,
        angle: config.angle,
        stops,
        tags: [],
        grainIntensity: config.grainIntensity,
      });
      setSelectedId(id);
      setConfig({ ...config, name });
      toast.success("Saved as new gradient!");
    } catch (error) {
      toast.error("Failed to save gradient");
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      await removeGradient({ id: selectedId });
      setSelectedId(null);
      toast.success("Gradient deleted!");
    } catch (error) {
      toast.error("Failed to delete gradient");
    }
  };

  const handleAddNewPresets = async () => {
    try {
      await addNewPresets();
      toast.success("New presets added!");
    } catch (error) {
      toast.error("Failed to add new presets");
    }
  };

  const handleGenerateVariant = (colorCount: number) => {
    const generateRandomPastelColor = () => {
      const r = Math.floor(Math.random() * 100 + 155);
      const g = Math.floor(Math.random() * 100 + 155);
      const b = Math.floor(Math.random() * 100 + 155);
      return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const newStops: ColorStop[] = [];
    if (colorCount === 2) {
      newStops.push(
        { color: generateRandomPastelColor(), position: 0 },
        { color: generateRandomPastelColor(), position: 100 }
      );
    } else if (colorCount === 3) {
      newStops.push(
        { color: generateRandomPastelColor(), position: 0 },
        { color: generateRandomPastelColor(), position: 50 },
        { color: generateRandomPastelColor(), position: 100 }
      );
    } else if (colorCount === 4) {
      newStops.push(
        { color: generateRandomPastelColor(), position: 0 },
        { color: generateRandomPastelColor(), position: 33 },
        { color: generateRandomPastelColor(), position: 67 },
        { color: generateRandomPastelColor(), position: 100 }
      );
    }

    setConfig({
      ...config,
      angle: Math.floor(Math.random() * 360),
      colorStops: newStops,
      grainIntensity: Math.random() * 0.1 + 0.05,
    });
    setSelectedId(null);
  };

  // Handle top-left overlay image upload (PNG or SVG)
  const handleImageUpload = (file: File) => {
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
        setOverlayImage(img);
        setOverlayDimensions({ width: img.width, height: img.height });
        toast.success("Image uploaded successfully");
      };
      img.onerror = () => {
        toast.error("Failed to load image");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setOverlayImage(null);
    setOverlayDimensions(null);
    toast.success("Image removed");
  };

  // Handle center overlay image upload (PNG or SVG)
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
        toast.success("Center image uploaded successfully");
      };
      img.onerror = () => {
        toast.error("Failed to load image");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCenterImage = () => {
    setCenterImage(null);
    setCenterDimensions(null);
    toast.success("Center image removed");
  };

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
    toast.success("PNG downloaded at 1536 × 864");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <GradientPreview
            config={config}
            canvasRef={canvasRef}
            onExport={handleExport}
            overlayImage={overlayImage}
            overlaySize={overlaySize}
            centerImage={centerImage}
            centerSize={centerSize}
          />
        </div>

        <div className="space-y-6">
          <GradientEditor
            config={config}
            onConfigChange={setConfig}
            onSave={handleSave}
            onSaveAsNew={handleSaveAsNew}
            onDelete={selectedId ? handleDelete : undefined}
            onGenerateVariant={handleGenerateVariant}
            onAddNewPresets={handleAddNewPresets}
            overlayImage={overlayImage}
            overlayDimensions={overlayDimensions}
            overlaySize={overlaySize}
            onOverlaySizeChange={setOverlaySize}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
            centerImage={centerImage}
            centerDimensions={centerDimensions}
            centerSize={centerSize}
            onCenterSizeChange={setCenterSize}
            onCenterImageUpload={handleCenterImageUpload}
            onRemoveCenterImage={handleRemoveCenterImage}
          />
        </div>
      </div>

      <div>
        <GradientGallery
          gradients={gradients || []}
          selectedId={selectedId}
          onSelect={handleSelectGradient}
        />
      </div>
    </div>
  );
}
