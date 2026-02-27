'use client';

import { FlaskConical, Plus, ToggleLeft, ToggleRight, BarChart3 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

// ═══════════════════════════════════════════════════════════════
// Tipos locales para la página de A/B Testing
// ═══════════════════════════════════════════════════════════════

interface ABVariantData {
  id: string;
  key: string;
  label: string;
  weight: number;
}

interface ABExperimentData {
  id: string;
  key: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  variants: ABVariantData[];
  _count: { assignments: number };
}

interface ExperimentResultVariant {
  variant: string;
  label: string;
  participants: number;
  conversions: number;
  conversionRate: string;
}

interface ExperimentResultData {
  experiment: { key: string; name: string; isActive: boolean };
  results: ExperimentResultVariant[];
  totalParticipants: number;
}

// ═══════════════════════════════════════════════════════════════
// Componente principal
// ═══════════════════════════════════════════════════════════════

export default function ABTestingPage() {
  const [experiments, setExperiments] = useState<ABExperimentData[]>([]);
  const [selectedResults, setSelectedResults] = useState<ExperimentResultData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchExperiments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/ab-tests');
      const data = await res.json();
      if (data.success) setExperiments(data.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExperiments();
  }, [fetchExperiments]);

  const handleToggle = async (key: string, currentActive: boolean) => {
    await fetch(`/api/admin/ab-tests/${key}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    void fetchExperiments();
  };

  const handleViewResults = async (key: string) => {
    const res = await fetch(`/api/admin/ab-tests/${key}/results`);
    const data = await res.json();
    if (data.success) setSelectedResults(data.data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
            <FlaskConical className="text-fire-500" size={24} />
            A/B Testing
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Experimenta con pricing, CTAs y variantes de landing
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreate(!showCreate)}
        >
          Nuevo Experimento
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <CreateExperimentForm
          onCreated={() => {
            setShowCreate(false);
            void fetchExperiments();
          }}
        />
      )}

      {/* Experiments list */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando experimentos...</div>
      ) : experiments.length === 0 ? (
        <Card className="p-12 text-center">
          <FlaskConical className="mx-auto mb-4 text-slate-600" size={48} />
          <p className="text-slate-400">No hay experimentos creados aún</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {experiments.map((exp) => (
            <Card key={exp.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display font-bold text-white">{exp.name}</h3>
                    <Badge variant={exp.isActive ? 'premium' : 'free'}>
                      {exp.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mb-2">{exp.key}</p>
                  {exp.description && (
                    <p className="text-sm text-slate-400 mb-3">{exp.description}</p>
                  )}

                  {/* Variantes */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {exp.variants.map((v) => (
                      <span
                        key={v.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/5 text-xs text-slate-300"
                      >
                        <span className="font-mono text-fire-400">{v.key}</span>
                        <span className="text-slate-500">({v.weight}%)</span>
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-500">
                    {exp._count.assignments} participantes asignados
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewResults(exp.key)}
                    leftIcon={<BarChart3 size={14} />}
                  >
                    Resultados
                  </Button>
                  <button
                    onClick={() => handleToggle(exp.key, exp.isActive)}
                    className="text-slate-400 hover:text-white transition-colors"
                    title={exp.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {exp.isActive ? (
                      <ToggleRight size={24} className="text-green-500" />
                    ) : (
                      <ToggleLeft size={24} />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Results modal */}
      {selectedResults && (
        <ResultsPanel
          data={selectedResults}
          onClose={() => setSelectedResults(null)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Formulario de creación de experimentos
// ═══════════════════════════════════════════════════════════════

function CreateExperimentForm({ onCreated }: { onCreated: () => void }) {
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState([
    { key: 'control', label: 'Control', weight: 50 },
    { key: 'variant_a', label: 'Variante A', weight: 50 },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addVariant = () => {
    if (variants.length >= 5) return;
    setVariants([
      ...variants,
      { key: `variant_${String.fromCharCode(97 + variants.length - 1)}`, label: '', weight: 50 },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: 'key' | 'label' | 'weight', value: string | number) => {
    const updated = [...variants];
    const current = updated[index];
    if (!current) return;
    if (field === 'weight') {
      updated[index] = { key: current.key, label: current.label, weight: Number(value) };
    } else {
      updated[index] = { key: current.key, label: current.label, weight: current.weight, [field]: String(value) };
    }
    setVariants(updated);
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/ab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, name, description: description || undefined, variants }),
      });
      const data = await res.json();

      if (data.success) {
        onCreated();
      } else {
        setError(data.error?.message ?? 'Error al crear experimento');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5 border-fire-500/30">
      <h3 className="font-display font-bold text-white mb-4">Nuevo Experimento</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs text-slate-400 font-ui mb-1 block">Key (único)</label>
          <Input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="pricing-test-v1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-ui mb-1 block">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Test de Pricing Q1"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs text-slate-400 font-ui mb-1 block">Descripción (opcional)</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Probar si $39 MXN convierte mejor que $49 MXN"
        />
      </div>

      {/* Variantes */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-slate-400 font-ui">Variantes</label>
          <button
            onClick={addVariant}
            disabled={variants.length >= 5}
            className="text-xs text-fire-400 hover:text-fire-300 disabled:opacity-50"
          >
            + Agregar variante
          </button>
        </div>

        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="flex-1"
                value={v.key}
                onChange={(e) => updateVariant(i, 'key', e.target.value)}
                placeholder="key"
              />
              <Input
                className="flex-1"
                value={v.label}
                onChange={(e) => updateVariant(i, 'label', e.target.value)}
                placeholder="Label"
              />
              <Input
                className="w-20"
                type="number"
                value={String(v.weight)}
                onChange={(e) => updateVariant(i, 'weight', e.target.value)}
                placeholder="50"
              />
              {variants.length > 2 && (
                <button
                  onClick={() => removeVariant(i)}
                  className="text-red-400 hover:text-red-300 text-sm px-2"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      <Button variant="primary" onClick={handleSubmit} isLoading={submitting}>
        Crear Experimento
      </Button>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// Panel de resultados
// ═══════════════════════════════════════════════════════════════

function ResultsPanel({
  data,
  onClose,
}: {
  data: ExperimentResultData;
  onClose: () => void;
}) {
  const maxParticipants = Math.max(...data.results.map((r) => r.participants), 1);

  return (
    <Card className="p-5 border-fire-500/20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-white">{data.experiment.name}</h3>
          <p className="text-xs text-slate-500 font-mono">{data.experiment.key}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
          Cerrar
        </button>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Total participantes: <span className="text-white font-bold">{data.totalParticipants}</span>
      </p>

      <div className="space-y-3">
        {data.results.map((result) => {
          const barWidth = maxParticipants > 0
            ? (result.participants / maxParticipants) * 100
            : 0;
          const rate = parseFloat(result.conversionRate);

          return (
            <div key={result.variant} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white font-medium">
                  {result.label}{' '}
                  <span className="text-slate-500 font-mono text-xs">({result.variant})</span>
                </span>
                <span className={`font-bold ${rate > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                  {result.conversionRate}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded bg-gradient-to-r from-fire-500 to-fire-600 transition-all"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-24 text-right">
                  {result.conversions}/{result.participants}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
