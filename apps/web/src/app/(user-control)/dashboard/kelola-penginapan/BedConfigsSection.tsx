import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { adminActionDelete, adminActionIcon } from "../adminActionStyles";
import { BedConfig } from "./types";

interface BedConfigsSectionProps {
  bedConfigs: BedConfig[];
  onChange: (configs: BedConfig[]) => void;
}

const EMPTY_CONFIG: BedConfig = {
  maxKasur: 1,
  maxAdult: 1,
  maxChild: 0,
  maxKamar: 1,
  harga: 0,
  hargaPerChild: 0,
};

// Input number yang bisa menampilkan "0" dengan benar
function NumericInput({
  value,
  min,
  onChange,
  required,
}: {
  value: number;
  min: number;
  onChange: (val: number) => void;
  required?: boolean;
}) {
  const [raw, setRaw] = useState(String(value));

  // Sync jika value dari luar berubah (misal saat edit penginapan)
  useEffect(() => {
    setRaw(String(value));
  }, [value]);

  return (
    <input
      required={required}
      type="number"
      min={min}
      value={raw}
      onChange={(e) => {
        setRaw(e.target.value);
        const num = Number(e.target.value);
        if (e.target.value !== "" && !isNaN(num)) {
          onChange(num);
        }
      }}
      onBlur={() => {
        const num = Number(raw);
        if (raw === "" || isNaN(num) || num < min) {
          setRaw(String(min));
          onChange(min);
        } else {
          setRaw(String(num));
          onChange(num);
        }
      }}
      className="w-full bg-white border-2 border-black p-2 font-bold text-xs rounded-xl text-center outline-none focus:ring-4 focus:ring-[#ffcc00]/20"
    />
  );
}

export const BedConfigsSection: React.FC<BedConfigsSectionProps> = ({ bedConfigs, onChange }) => {
  const canAdd = bedConfigs.length === 0;

  const addBedConfig = () => {
    if (!canAdd) return;
    onChange([{ ...EMPTY_CONFIG }]);
  };

  const removeBedConfig = () => {
    onChange([]);
  };

  const updateBedConfig = (updatedFields: Partial<BedConfig>) => {
    if (bedConfigs.length === 0) return;
    onChange([{ ...bedConfigs[0], ...updatedFields }]);
  };

  const config = bedConfigs[0];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center border-b-2 border-black pb-2">
        <div>
          <span className="block font-black uppercase text-[10px] tracking-wider text-black">
            Kamar Tersedia
          </span>
          <span className="block text-[8px] font-bold text-stone-400 uppercase mt-0.5">
            Maksimum 1 tipe kamar per penginapan
          </span>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={addBedConfig}
            className="bg-black text-white hover:bg-[#ffcc00] hover:text-black border-2 border-black px-3 py-1 rounded-xl font-black text-[9px] uppercase shadow-[2.5px_2.5px_0px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          >
            + Tambah Kamar
          </button>
        )}
      </div>

      <div className="space-y-3">
        {!config ? (
          <div className="text-center py-4 text-[9px] font-bold uppercase text-stone-400 italic bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
            Belum ada konfigurasi kamar
          </div>
        ) : (
          <div className="bg-stone-50 border-[3px] border-black p-4 rounded-2xl relative shadow-[4px_4px_0px_0px_black] space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-black">
                Kamar #1
              </span>
              <button
                type="button"
                onClick={removeBedConfig}
                title="Hapus konfigurasi kamar"
                aria-label="Hapus konfigurasi kamar"
                className={`${adminActionDelete} rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none`}
              >
                <FaTrash className={`${adminActionIcon} text-inherit`} />
              </button>
            </div>

            {/* Row 1: Max Kasur | Max Adult | Max Child */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Max Kasur</span>
                <NumericInput
                  required
                  min={1}
                  value={config.maxKasur}
                  onChange={(val) => updateBedConfig({ maxKasur: val })}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Max Adult</span>
                <NumericInput
                  required
                  min={1}
                  value={config.maxAdult}
                  onChange={(val) => updateBedConfig({ maxAdult: val })}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Max Child</span>
                <NumericInput
                  required
                  min={0}
                  value={config.maxChild}
                  onChange={(val) => updateBedConfig({ maxChild: val })}
                />
              </div>
            </div>

            {/* Row 2: Max Kamar | Harga */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Max Kamar</span>
                <NumericInput
                  required
                  min={1}
                  value={config.maxKamar}
                  onChange={(val) => updateBedConfig({ maxKamar: val })}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Harga (Rp)</span>
                <NumericInput
                  required
                  min={0}
                  value={config.harga}
                  onChange={(val) => updateBedConfig({ harga: val })}
                />
              </div>
            </div>

            {/* Row 3: Harga Per Child (only if maxChild > 0) */}
            {config.maxChild > 0 && (
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest mb-1.5">
                  Harga Per Child (Rp)
                  <span className="ml-1 text-stone-300 normal-case font-bold">— tambahan per anak</span>
                </span>
                <NumericInput
                  required
                  min={0}
                  value={config.hargaPerChild}
                  onChange={(val) => updateBedConfig({ hargaPerChild: val })}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
