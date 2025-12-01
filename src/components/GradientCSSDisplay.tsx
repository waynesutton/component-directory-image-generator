import { GradientConfig } from "./GradientGenerator";
import { toast } from "sonner";

type Props = {
  config: GradientConfig;
};

export function GradientCSSDisplay({ config }: Props) {
  const getCSSGradient = () => {
    const stops = config.colorStops
      .map((s) => `${s.color} ${s.position}%`)
      .join(", ");
    return `linear-gradient(${config.angle}deg, ${stops})`;
  };

  const getTailwindGradient = () => {
    const angleMap: Record<number, string> = {
      0: "to-t",
      45: "to-tr",
      90: "to-r",
      135: "to-br",
      180: "to-b",
      225: "to-bl",
      270: "to-l",
      315: "to-tl",
    };
    const direction = angleMap[config.angle] || `[${config.angle}deg]`;
    return `bg-gradient-${direction}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="bg-[#f5f3f0] rounded-lg border border-[#e6e4e1] shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-[#1a1a1a]">CSS Code</h2>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-[#6b6b6b]">
            CSS Linear Gradient
          </label>
          <button
            onClick={() => copyToClipboard(getCSSGradient(), "CSS gradient")}
            className="text-sm text-[#EB5601] hover:text-[#d14a01] font-medium"
          >
            Copy
          </button>
        </div>
        <div className="bg-[#1a1a1a] text-[#a8edea] p-4 rounded-lg text-sm font-mono overflow-x-auto">
          {getCSSGradient()}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-[#6b6b6b]">
            Tailwind Class (approximate)
          </label>
          <button
            onClick={() =>
              copyToClipboard(getTailwindGradient(), "Tailwind class")
            }
            className="text-sm text-[#EB5601] hover:text-[#d14a01] font-medium"
          >
            Copy
          </button>
        </div>
        <div className="bg-[#1a1a1a] text-[#a8edea] p-4 rounded-lg text-sm font-mono overflow-x-auto">
          {getTailwindGradient()}
        </div>
      </div>
    </div>
  );
}
