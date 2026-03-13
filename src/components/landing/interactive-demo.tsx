'use client';

import { motion } from 'framer-motion';
import { Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════════
// InteractiveDemo — FUNCTIONAL mini-generator on the landing
// Real device search + real sensitivity generation
// Fallback to demo values if API unavailable
// ═══════════════════════════════════════════════════════════════

interface DeviceResult {
  id: string;
  brand: string;
  model: string;
  tier: string;
}

interface SensitivityResult {
  general: number;
  redPoint: number;
  scope2x: number;
  scope4x: number;
  sniperScope: number;
  freeView: number;
}

const DEMO_FALLBACK: { device: DeviceResult; sensitivity: SensitivityResult } = {
  device: { id: 'demo', brand: 'Samsung', model: 'Galaxy A54', tier: 'HIGH' },
  sensitivity: {
    general: 174,
    redPoint: 159,
    scope2x: 144,
    scope4x: 129,
    sniperScope: 114,
    freeView: 16,
  },
};

const SENSI_LABELS: { key: keyof SensitivityResult; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'redPoint', label: 'Punto Rojo' },
  { key: 'scope2x', label: 'Mira 2x' },
  { key: 'scope4x', label: 'Mira 4x' },
  { key: 'sniperScope', label: 'AWM' },
  { key: 'freeView', label: 'Vista Libre' },
];

export function InteractiveDemo() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DeviceResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceResult | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [revealedBars, setRevealedBars] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const revealIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced device search
  const searchDevices = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/devices?search=${encodeURIComponent(q)}&limit=5`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setResults(json.data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          brand: d.brand as string,
          model: d.model as string,
          tier: d.tier as string,
        })));
        setShowDropdown(true);
      }
    } catch {
      // API not available — no results
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedDevice(null);
    setSensitivity(null);
    setRevealedBars(0);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDevices(value), 300);
  };

  // Generate sensitivity for selected device
  const handleSelectDevice = async (device: DeviceResult) => {
    setSelectedDevice(device);
    setQuery(`${device.brand} ${device.model}`);
    setShowDropdown(false);
    setResults([]);
    setSensitivity(null);
    setRevealedBars(0);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: device.id,
          style: 'BALANCED',
          includeGyro: false,
        }),
      });
      const json = await res.json();
      if (json.success && json.data?.sensitivity) {
        setSensitivity(json.data.sensitivity as SensitivityResult);
        revealBarsSequentially();
      } else {
        // Fallback
        applyFallback();
      }
    } catch {
      applyFallback();
    } finally {
      setIsGenerating(false);
    }
  };

  const applyFallback = () => {
    setSensitivity(DEMO_FALLBACK.sensitivity);
    revealBarsSequentially();
  };

  const revealBarsSequentially = () => {
    if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
    let count = 0;
    revealIntervalRef.current = setInterval(() => {
      count++;
      setRevealedBars(count);
      if (count >= 6) {
        clearInterval(revealIntervalRef.current);
        revealIntervalRef.current = undefined;
      }
    }, 100);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
    };
  }, []);

  // Free Fire max sensitivity = 200 (desde OB44, abril 2024)
  // Vista Libre rango real: 12-25, usamos 30 como techo visual
  const SENSITIVITY_MAX = 200;
  const FREE_VIEW_MAX = 30;

  return (
    <section className="py-20 md:py-28 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-display font-bold text-center text-white"
        >
          Pruébalo ahora
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-3 text-center text-slate-400 text-sm"
        >
          Busca tu celular y ve tu sensibilidad en tiempo real. Sin registro.
        </motion.p>

        {/* Demo container */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-10 rounded-[20px] p-6 md:p-8 relative"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(6, 182, 212, 0.1)',
            boxShadow: '0 0 60px rgba(6, 182, 212, 0.05), 0 20px 60px rgba(0, 0, 0, 0.3)',
          }}
        >
          {/* Search input */}
          <div className="relative">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-black/30 border border-white/10 focus-within:border-cyan-500/40 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all duration-200">
              <Search size={18} className="text-slate-500 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Escribe tu celular... ej: Samsung Galaxy A54"
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-base outline-none"
                style={{ fontSize: '16px' }} // Prevent iOS zoom
              />
              {isSearching && (
                <div className="w-4 h-4 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin shrink-0" />
              )}
            </div>

            {/* Dropdown results */}
            {showDropdown && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[rgba(10,15,30,0.95)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-20">
                {results.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => handleSelectDevice(device)}
                      className="w-full flex items-center px-4 py-3 hover:bg-cyan-500/5 transition-colors text-left min-h-[44px]"
                    >
                      <span className="text-sm text-white">
                        {device.brand} {device.model}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Selected device badge */}
          {selectedDevice && (
            <div className="mt-4">
              <span className="text-sm text-slate-300">
                {selectedDevice.brand} {selectedDevice.model}
              </span>
            </div>
          )}

          {/* Sensitivity bars */}
          <div className="mt-6 space-y-3">
            {SENSI_LABELS.map((s, i) => {
              const value = sensitivity ? sensitivity[s.key] : 0;
              const isRevealed = i < revealedBars;
              const barMax = s.key === 'freeView' ? FREE_VIEW_MAX : SENSITIVITY_MAX;
              const barWidth = value > 0 ? Math.min((value / barMax) * 100, 100) : 0;

              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-20 text-right shrink-0">{s.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
                      style={{
                        width: isRevealed ? `${barWidth}%` : '0%',
                        transitionDelay: `${i * 100}ms`,
                      }}
                    />
                  </div>
                  <span className={`text-lg font-heading font-bold w-12 text-right tabular-nums transition-opacity duration-300 ${
                    isRevealed ? 'text-cyan-400/60 opacity-100 blur-[6px] select-none' : 'opacity-0'
                  }`}>
                    {isRevealed ? '???' : ''}
                  </span>
                </div>
              );
            })}

            {/* Empty state */}
            {!sensitivity && !isGenerating && (
              <p className="text-center text-xs text-slate-600 py-4">
                Los valores aparecerán aquí
              </p>
            )}

            {/* Loading state */}
            {isGenerating && (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
              </div>
            )}
          </div>

          {/* CTA to generator */}
          {sensitivity && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                href="/generator"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 min-h-[44px] bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-[1.03] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                Ve al Generador para ver tus resultados
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
