import { Product } from "@/types";
import { Cpu, MemoryStick, HardDrive, Monitor, Battery, Shield, Layers } from "lucide-react";

interface ProductSpecsProps {
  product: Product;
}

const specRows = [
  { key: "processor", label: "Processor", icon: Cpu },
  { key: "ram", label: "RAM", icon: MemoryStick },
  { key: "storage", label: "Storage", icon: HardDrive },
  { key: "gpu", label: "Graphics Card", icon: Layers },
  { key: "display", label: "Display", icon: Monitor },
  { key: "battery", label: "Battery", icon: Battery },
  { key: "warranty", label: "Warranty", icon: Shield },
] as const;

export default function ProductSpecs({ product }: ProductSpecsProps) {
  const availableSpecs = specRows.filter((s) => product[s.key]);

  if (availableSpecs.length === 0) return null;

  return (
    <div className="rounded-2xl bg-slate-900/60 border border-white/8 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/8">
        <h3 className="text-white font-semibold text-base">Full Specifications</h3>
      </div>
      <div className="divide-y divide-white/5">
        {availableSpecs.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-start gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors duration-150">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mt-0.5">
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs mb-0.5">{label}</p>
              <p className="text-white text-sm font-medium">{product[key]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
