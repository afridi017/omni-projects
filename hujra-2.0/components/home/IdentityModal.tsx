"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { randomName } from "@/lib/utils";
import { setUserName } from "@/lib/demo-store";

export function IdentityModal({
  currentName,
  onClose,
  onSaved,
}: {
  currentName: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(currentName);

  const save = () => {
    const final = name.trim() || randomName();
    setUserName(final);
    onSaved(final);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="glass-strong w-full max-w-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">
            Aap ka naam kya hai?
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="Guest"
          className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-[#a3e635]/50"
        />

        <button
          onClick={() => setName(randomName())}
          className="mt-3 text-xs font-semibold text-[#a3e635] hover:underline"
        >
          🎲 Random naam chuno
        </button>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">
            Baad me
          </button>
          <button onClick={save} className="btn-lime flex-1">
            <Check className="h-4 w-4" />
            Save karo
          </button>
        </div>
      </div>
    </div>
  );
}
