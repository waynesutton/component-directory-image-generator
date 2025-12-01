import { Id } from "../../convex/_generated/dataModel";

type Gradient = {
  _id: Id<"gradients">;
  name: string;
  css: string;
  angle: number;
  stops: Array<{ position: number; color: string }>;
  grainIntensity: number;
  source: "preset" | "variant";
  tags: string[];
};

type Props = {
  gradients: Gradient[];
  selectedId: Id<"gradients"> | null;
  onSelect: (id: Id<"gradients">) => void;
};

export function GradientGallery({ gradients, selectedId, onSelect }: Props) {
  const presets = gradients.filter((g) => g.source === "preset");
  const variants = gradients.filter((g) => g.source === "variant");

  const renderGradient = (gradient: Gradient) => {
    return (
      <div key={gradient._id} className="space-y-2">
        <button
          onClick={() => onSelect(gradient._id)}
          className={`relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 transition-all ${
            selectedId === gradient._id
              ? "border-[#EB5601] ring-2 ring-[#EB5601]/20"
              : "border-[#e6e4e1] hover:border-[#8b7355]"
          }`}
        >
          <div
            className="w-full h-full"
            style={{ background: gradient.css }}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a]/80 text-white text-xs p-2 truncate font-medium">
            {gradient.name}
          </div>
        </button>
        <div className="bg-[#1a1a1a] text-[#a8edea] p-2 rounded text-[10px] font-mono overflow-x-auto leading-relaxed">
          {gradient.css}
        </div>
        {gradient.tags && gradient.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {gradient.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-1 bg-[#e6e4e1] text-[#6b6b6b] rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#f5f3f0] rounded-lg border border-[#e6e4e1] shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-semibold text-[#1a1a1a]">Gallery</h2>

      {presets.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {presets.map(renderGradient)}
          </div>
        </div>
      )}

      {variants.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-[#1a1a1a] mb-3">
            My Gradients
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {variants.map(renderGradient)}
          </div>
        </div>
      )}

      {gradients.length === 0 && (
        <div className="text-center text-[#6b6b6b] py-8">
          <p className="text-sm">No gradients yet</p>
          <p className="text-xs mt-1">Create your first gradient!</p>
        </div>
      )}
    </div>
  );
}
