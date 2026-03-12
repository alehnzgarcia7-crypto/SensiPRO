'use client';

import {
  DollarSign,
  Shield,
  Crown,
  Megaphone,
  Wrench,
  Eye,
  Save,
  Loader2,
  Check,
  Trash2,
  UserPlus,
  UserMinus,
  Timer,
  Power,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { cn } from '@/lib/cn';

interface AppConfig {
  premiumPrice: string;
  originalPrice: string;
  paywallEnabled: string;
  maintenanceMode: string;
  announcementBanner: string;
  showDemo: string;
  offerEndDate: string;
  offerActive: string;
}

export default function ControlsPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [grantEmail, setGrantEmail] = useState('');
  const [revokeEmail, setRevokeEmail] = useState('');
  const [grantStatus, setGrantStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [revokeStatus, setRevokeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const fetchConfig = useCallback(async () => {
    const res = await fetch('/api/command-center/config');
    if (res.ok) {
      const data = await res.json();
      setConfig(data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const saveConfig = async (key: string, value: string) => {
    setSaving(key);
    await fetch('/api/command-center/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    setSaving(null);
    setSaved(key);
    setTimeout(() => setSaved(null), 2000);
    fetchConfig();
  };

  const handleGrant = async () => {
    if (!grantEmail.trim()) return;
    setGrantStatus('loading');
    try {
      const res = await fetch('/api/command-center/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'grant-premium', email: grantEmail.trim() }),
      });
      setGrantStatus(res.ok ? 'success' : 'error');
      if (res.ok) setGrantEmail('');
    } catch { setGrantStatus('error'); }
    setTimeout(() => setGrantStatus('idle'), 3000);
  };

  const handleRevoke = async () => {
    if (!revokeEmail.trim()) return;
    setRevokeStatus('loading');
    try {
      const res = await fetch('/api/command-center/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke-premium', email: revokeEmail.trim() }),
      });
      setRevokeStatus(res.ok ? 'success' : 'error');
      if (res.ok) setRevokeEmail('');
    } catch { setRevokeStatus('error'); }
    setTimeout(() => setRevokeStatus('idle'), 3000);
  };

  if (loading || !config) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-white font-mono">Controls</h1></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-6 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono">Controls</h1>
        <p className="text-sm text-slate-500 mt-1">Panel de control operativo — Cambios en vivo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Precio Premium */}
        <ControlCard
          icon={DollarSign}
          title="Precio Premium"
          description="Precio de venta en centavos MXN (19900 = $199)"
        >
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={config.premiumPrice}
              onChange={(e) => setConfig({ ...config, premiumPrice: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#080810] border border-[#1a1a2e] text-white font-mono text-sm focus:border-cyan-500/50 focus:outline-none"
            />
            <SaveButton
              onClick={() => saveConfig('premiumPrice', config.premiumPrice)}
              saving={saving === 'premiumPrice'}
              saved={saved === 'premiumPrice'}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            Muestra: ${(parseInt(config.premiumPrice) / 100 || 0).toFixed(0)} MXN
          </p>
        </ControlCard>

        {/* Precio Original */}
        <ControlCard
          icon={DollarSign}
          title="Precio Original (Tachado)"
          description="Precio original para mostrar descuento en centavos"
        >
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={config.originalPrice}
              onChange={(e) => setConfig({ ...config, originalPrice: e.target.value })}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#080810] border border-[#1a1a2e] text-white font-mono text-sm focus:border-cyan-500/50 focus:outline-none"
            />
            <SaveButton
              onClick={() => saveConfig('originalPrice', config.originalPrice)}
              saving={saving === 'originalPrice'}
              saved={saved === 'originalPrice'}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            Muestra: <span className="line-through">${(parseInt(config.originalPrice) / 100 || 0).toFixed(0)}</span> MXN
          </p>
        </ControlCard>

        {/* Paywall Toggle */}
        <ControlCard
          icon={Shield}
          title="Paywall"
          description="Si está OFF, todo el contenido es gratis"
        >
          <ToggleSwitch
            value={config.paywallEnabled === 'true'}
            onChange={(v) => saveConfig('paywallEnabled', String(v))}
            labelOn="Activo"
            labelOff="Desactivado"
          />
        </ControlCard>

        {/* Maintenance Mode */}
        <ControlCard
          icon={Wrench}
          title="Modo Mantenimiento"
          description="Muestra pantalla de mantenimiento a todos los usuarios"
        >
          <ToggleSwitch
            value={config.maintenanceMode === 'true'}
            onChange={(v) => saveConfig('maintenanceMode', String(v))}
            labelOn="En Mantenimiento"
            labelOff="Normal"
            danger={config.maintenanceMode === 'true'}
          />
        </ControlCard>

        {/* Show Demo */}
        <ControlCard
          icon={Eye}
          title="Mostrar Demo"
          description="Toggle para la sección 'Pruébalo ahora' de la landing"
        >
          <ToggleSwitch
            value={config.showDemo === 'true'}
            onChange={(v) => saveConfig('showDemo', String(v))}
            labelOn="Visible"
            labelOff="Oculto"
          />
        </ControlCard>

        {/* Announcement Banner */}
        <ControlCard
          icon={Megaphone}
          title="Banner de Anuncio"
          description="Texto que se muestra en toda la app (vacío = sin banner)"
          className="lg:col-span-2"
        >
          <div className="flex items-start gap-3">
            <textarea
              value={config.announcementBanner}
              onChange={(e) => setConfig({ ...config, announcementBanner: e.target.value })}
              placeholder="Ej: 🔥 Actualizado para OB52 — ¡Nuevos dispositivos!"
              rows={2}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#080810] border border-[#1a1a2e] text-white text-sm resize-none focus:border-cyan-500/50 focus:outline-none"
            />
            <div className="flex flex-col gap-2">
              <SaveButton
                onClick={() => saveConfig('announcementBanner', config.announcementBanner)}
                saving={saving === 'announcementBanner'}
                saved={saved === 'announcementBanner'}
              />
              {config.announcementBanner && (
                <button
                  onClick={() => { setConfig({ ...config, announcementBanner: '' }); saveConfig('announcementBanner', ''); }}
                  className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </ControlCard>

        {/* Offer Countdown */}
        <ControlCard
          icon={Timer}
          title="Fecha Fin de Oferta"
          description="Contador de urgencia — se auto-renueva cada 6 días"
        >
          <div className="flex items-center gap-3">
            <input
              type="datetime-local"
              value={config.offerEndDate ? toLocalDatetimeString(config.offerEndDate) : ''}
              onChange={(e) => {
                const dt = new Date(e.target.value);
                if (!isNaN(dt.getTime())) {
                  setConfig({ ...config, offerEndDate: dt.toISOString() });
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#080810] border border-[#1a1a2e] text-white font-mono text-sm focus:border-cyan-500/50 focus:outline-none [color-scheme:dark]"
            />
            <SaveButton
              onClick={() => saveConfig('offerEndDate', config.offerEndDate)}
              saving={saving === 'offerEndDate'}
              saved={saved === 'offerEndDate'}
            />
          </div>
          <OfferCountdownPreview endDate={config.offerEndDate} active={config.offerActive === 'true'} />
          <p className="text-[10px] text-slate-600 mt-2">
            El contador se auto-renueva cada 6 días automáticamente. Precio siempre $199 MXN.
          </p>
        </ControlCard>

        {/* Offer Active Toggle */}
        <ControlCard
          icon={Power}
          title="Oferta Activa"
          description="Muestra u oculta el contador de oferta en el paywall"
        >
          <ToggleSwitch
            value={config.offerActive === 'true'}
            onChange={(v) => saveConfig('offerActive', String(v))}
            labelOn="Oferta visible"
            labelOff="Oferta oculta"
          />
        </ControlCard>

        {/* Grant Premium */}
        <ControlCard
          icon={UserPlus}
          title="Dar Premium"
          description="Activar premium para un email sin cobrar"
        >
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#080810] border border-[#1a1a2e] text-white text-sm focus:border-cyan-500/50 focus:outline-none"
            />
            <button
              onClick={handleGrant}
              disabled={grantStatus === 'loading' || !grantEmail.trim()}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all',
                grantStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  : grantStatus === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-50'
              )}
            >
              {grantStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> :
               grantStatus === 'success' ? <Check className="w-4 h-4" /> :
               <Crown className="w-4 h-4" />}
              {grantStatus === 'success' ? 'Listo' : 'Activar'}
            </button>
          </div>
        </ControlCard>

        {/* Revoke Premium */}
        <ControlCard
          icon={UserMinus}
          title="Quitar Premium"
          description="Desactivar premium para un email"
        >
          <div className="flex items-center gap-3">
            <input
              type="email"
              value={revokeEmail}
              onChange={(e) => setRevokeEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#080810] border border-[#1a1a2e] text-white text-sm focus:border-cyan-500/50 focus:outline-none"
            />
            <button
              onClick={handleRevoke}
              disabled={revokeStatus === 'loading' || !revokeEmail.trim()}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all',
                revokeStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                  : revokeStatus === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50'
              )}
            >
              {revokeStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> :
               revokeStatus === 'success' ? <Check className="w-4 h-4" /> :
               <Shield className="w-4 h-4" />}
              {revokeStatus === 'success' ? 'Listo' : 'Revocar'}
            </button>
          </div>
        </ControlCard>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════

function ControlCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof DollarSign;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('rounded-xl border border-[#1a1a2e] bg-[#0d0d1a] p-6', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-[10px] text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SaveButton({
  onClick,
  saving,
  saved,
}: {
  onClick: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className={cn(
        'p-2.5 rounded-lg border transition-all',
        saved
          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
      )}
    >
      {saving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <Check className="w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
    </button>
  );
}

function toLocalDatetimeString(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function OfferCountdownPreview({ endDate, active }: { endDate: string; active: boolean }) {
  const [remaining, setRemaining] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const calc = () => {
      if (!active || !endDate) { setRemaining('Oferta desactivada'); return; }
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setRemaining('Expirada — se auto-renovará en el próximo request'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${d}d ${h}h ${m}m`);
    };
    calc();
    intervalRef.current = setInterval(calc, 60000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [endDate, active]);

  return (
    <div className="mt-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
      <span className="text-[10px] text-slate-500 uppercase tracking-wider">Preview del contador</span>
      <p className={cn('text-sm font-mono mt-0.5', active ? 'text-slate-200' : 'text-slate-600')}>
        {remaining}
      </p>
    </div>
  );
}

function ToggleSwitch({
  value,
  onChange,
  labelOn,
  labelOff,
  danger,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  labelOn: string;
  labelOff: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="flex items-center gap-3"
    >
      <div
        className={cn(
          'w-12 h-6 rounded-full relative transition-colors',
          value
            ? danger ? 'bg-red-500' : 'bg-cyan-500'
            : 'bg-slate-700'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
            value ? 'left-6' : 'left-0.5'
          )}
        />
      </div>
      <span className={cn('text-sm', value ? (danger ? 'text-red-400' : 'text-cyan-400') : 'text-slate-500')}>
        {value ? labelOn : labelOff}
      </span>
    </button>
  );
}
