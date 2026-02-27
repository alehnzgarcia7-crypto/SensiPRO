'use client';

import { Ticket, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ══════════════════════════════════════════════════════════
// RedeemCode — Componente para canjear codigos de activacion
// Formato esperado: ARES-XXXX-XXXX-XXXX
// ══════════════════════════════════════════════════════════

type RedeemStatus = 'idle' | 'validating' | 'redeeming' | 'success' | 'error';

interface RedeemResult {
  tier: string;
  expiresAt: string;
}

export function RedeemCode() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<RedeemStatus>('idle');
  const [message, setMessage] = useState('');

  // Auto-formatear: insertar guiones en las posiciones correctas
  const handleChange = useCallback((value: string) => {
    // Limpiar todo lo que no sea alfanumerico
    const clean = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Dividir en segmentos de 4
    const segments = [
      clean.slice(0, 4),
      clean.slice(4, 8),
      clean.slice(8, 12),
      clean.slice(12, 16),
    ].filter(Boolean);

    setCode(segments.join('-'));

    // Reset status cuando editan
    if (status === 'error') {
      setStatus('idle');
      setMessage('');
    }
  }, [status]);

  const isCodeComplete = code.replace(/-/g, '').length === 16;
  const isLoading = status === 'validating' || status === 'redeeming';

  const handleRedeem = useCallback(async () => {
    if (!isCodeComplete) return;
    setStatus('redeeming');
    setMessage('');

    try {
      const res = await fetch('/api/activation-codes/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data: {
        success: boolean;
        data?: RedeemResult;
        error?: { message: string };
      } = await res.json();

      if (data.success && data.data) {
        setStatus('success');
        const fechaExpiracion = new Date(data.data.expiresAt).toLocaleDateString(
          'es-MX',
          { year: 'numeric', month: 'long', day: 'numeric' },
        );
        setMessage(
          `Tu cuenta es ahora ${data.data.tier} hasta el ${fechaExpiracion}`,
        );
      } else {
        setStatus('error');
        setMessage(data.error?.message ?? 'Codigo invalido');
      }
    } catch {
      setStatus('error');
      setMessage('Error de conexion. Verifica tu internet e intenta de nuevo.');
    }
  }, [code, isCodeComplete]);

  return (
    <div className="rounded-gaming border border-white/10 bg-background-card p-6">
      <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-white">
        <Ticket size={20} className="text-fire-500" />
        Codigo de Activacion
      </h3>
      <p className="mb-4 text-sm text-slate-400">
        Ingresa tu codigo <span className="font-mono text-slate-300">ARES-XXXX-XXXX-XXXX</span> para
        activar Premium o VIP
      </p>

      <div className="flex gap-3">
        <Input
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="ARES-XXXX-XXXX-XXXX"
          className="font-mono text-base tracking-widest"
          maxLength={19}
          disabled={status === 'success'}
          icon={<Ticket size={16} />}
        />
        <Button
          variant="primary"
          onClick={handleRedeem}
          isLoading={isLoading}
          disabled={!isCodeComplete || isLoading || status === 'success'}
          className="shrink-0"
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            'Activar'
          )}
        </Button>
      </div>

      {/* Resultado exitoso */}
      {status === 'success' && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <Check size={18} className="mt-0.5 shrink-0 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-emerald-300">
              Codigo activado exitosamente
            </p>
            <p className="mt-0.5 text-xs text-emerald-400/80">{message}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div>
            <p className="text-sm font-medium text-red-300">
              No se pudo activar
            </p>
            <p className="mt-0.5 text-xs text-red-400/80">{message}</p>
          </div>
        </div>
      )}

      {/* Hint de formato */}
      {status === 'idle' && code.length > 0 && !isCodeComplete && (
        <p className="mt-2 text-xs text-slate-500">
          Formato: ARES-XXXX-XXXX-XXXX (16 caracteres alfanumericos)
        </p>
      )}
    </div>
  );
}
