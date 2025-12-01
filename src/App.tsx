import { useState } from "react";
import { Toaster } from "sonner";
import { GradientGenerator } from "./components/GradientGenerator";
import { SimpleView } from "./components/SimpleView";

type ViewMode = "simple" | "advanced";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("simple");

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5]">
      <header className="px-8 pt-8 pb-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold text-[#1a1a1a]">
              Component Directory Image Generator
            </h1>

            {/* View Mode Navigation */}
            <nav className="flex items-center gap-1 bg-[#f5f3f0] rounded-lg p-1 border border-[#e6e4e1]">
              <button
                onClick={() => setViewMode("simple")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "simple"
                    ? "bg-[#EB5601] text-white"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-white"
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setViewMode("advanced")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "advanced"
                    ? "bg-[#EB5601] text-white"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a] hover:bg-white"
                }`}
              >
                Advanced
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 pb-8">
        <div className="w-full max-w-6xl mx-auto">
          {viewMode === "simple" ? <SimpleView /> : <GradientGenerator />}
        </div>
      </main>

      {/* Footer Links */}
      <footer className="px-8 py-6">
        <div className="w-full max-w-6xl mx-auto flex justify-center items-center gap-6">
          <a
            href="https://convex.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#6b6b6b] hover:text-[#EB5601] transition-colors"
          >
            Convex
          </a>
          <span className="text-[#e6e4e1]">•</span>
          <a
            href="https://www.convex.dev/components"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#6b6b6b] hover:text-[#EB5601] transition-colors"
          >
            Components Directory
          </a>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
