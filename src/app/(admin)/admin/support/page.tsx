'use client';

import { LifeBuoy, Clock, CheckCircle, XCircle, MessageSquare, Send } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';

interface TicketUser {
  username: string;
  tier: string;
}

interface SupportTicket {
  id: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  adminResponse: string | null;
  respondedAt: string | null;
  createdAt: string;
  user: TicketUser | null;
}

interface StatusCount {
  status: string;
  count: number;
}

interface TicketsResponse {
  success: boolean;
  data: SupportTicket[];
  meta: {
    counts: StatusCount[];
    total: number;
  };
}

interface UpdateResponse {
  success: boolean;
  data?: SupportTicket;
  error?: { message: string };
}

interface StatusInfo {
  label: string;
  color: string;
  icon: typeof LifeBuoy;
}

const STATUS_CONFIG: Record<string, StatusInfo> = {
  OPEN: { label: 'Abierto', color: 'text-fire-400', icon: LifeBuoy },
  IN_PROGRESS: { label: 'En Progreso', color: 'text-warning', icon: Clock },
  RESOLVED: { label: 'Resuelto', color: 'text-success', icon: CheckCircle },
  CLOSED: { label: 'Cerrado', color: 'text-slate-500', icon: XCircle },
};

const DEFAULT_STATUS: StatusInfo = { label: 'Abierto', color: 'text-fire-400', icon: LifeBuoy };

const CATEGORY_LABELS: Record<string, string> = {
  BUG: 'Bug',
  PAYMENT: 'Pago',
  ACCOUNT: 'Cuenta',
  FEATURE: 'Sugerencia',
  OTHER: 'Otro',
};

function TicketDetail({
  ticket,
  onUpdate,
}: {
  ticket: SupportTicket;
  onUpdate: (id: string, status: string, response?: string) => Promise<void>;
}) {
  const [response, setResponse] = useState(ticket.adminResponse ?? '');
  const [saving, setSaving] = useState(false);

  const handleRespond = async () => {
    if (!response.trim()) return;
    setSaving(true);
    await onUpdate(ticket.id, 'RESOLVED', response);
    setSaving(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    await onUpdate(ticket.id, newStatus);
    setSaving(false);
  };

  const statusInfo = STATUS_CONFIG[ticket.status] ?? DEFAULT_STATUS;

  return (
    <Card variant="glow" className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-ui font-bold uppercase ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <Badge variant="free" size="sm">{CATEGORY_LABELS[ticket.category] ?? ticket.category}</Badge>
        </div>
        <span className="text-xs text-slate-500">
          {new Date(ticket.createdAt).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      <h3 className="font-display font-bold text-white text-sm mb-1">{ticket.subject}</h3>
      <p className="text-xs text-slate-400 mb-1">
        De: <span className="text-slate-300">{ticket.user?.username ?? ticket.email}</span>
        {ticket.user && (
          <Badge variant={ticket.user.tier === 'VIP' ? 'vip' : ticket.user.tier === 'PREMIUM' ? 'premium' : 'free'} size="sm" className="ml-2">
            {ticket.user.tier}
          </Badge>
        )}
      </p>

      <div className="bg-background-base rounded-lg p-3 mt-3 mb-4">
        <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.message}</p>
      </div>

      {/* Respuesta admin existente */}
      {ticket.adminResponse && (
        <div className="bg-fire-500/5 border border-fire-500/20 rounded-lg p-3 mb-4">
          <p className="text-xs text-fire-400 font-ui font-bold mb-1">Respuesta Admin</p>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{ticket.adminResponse}</p>
          {ticket.respondedAt && (
            <p className="text-xs text-slate-500 mt-2">
              {new Date(ticket.respondedAt).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>
      )}

      {/* Responder */}
      {ticket.status !== 'CLOSED' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs text-slate-400 font-ui mb-1 block">
              <MessageSquare size={12} className="inline mr-1" />
              Responder al usuario
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={3}
              maxLength={2000}
              className="w-full rounded-lg bg-background-card border border-white/10 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fire-500/50 focus:outline-none resize-none"
              placeholder="Escribe tu respuesta..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              isLoading={saving}
              disabled={!response.trim()}
              leftIcon={<Send size={14} />}
              onClick={handleRespond}
            >
              Responder y Resolver
            </Button>
            {ticket.status === 'OPEN' && (
              <Button variant="ghost" size="sm" disabled={saving} onClick={() => handleStatusChange('IN_PROGRESS')}>
                Marcar En Progreso
              </Button>
            )}
            {ticket.status !== 'CLOSED' && (
              <Button variant="ghost" size="sm" disabled={saving} onClick={() => handleStatusChange('CLOSED')}>
                Cerrar
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function AdminSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [counts, setCounts] = useState<StatusCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/support?${params.toString()}`);
      const data: TicketsResponse = await res.json();
      if (data.success) {
        setTickets(data.data);
        setCounts(data.meta.counts);
      }
    } catch {
      toast('error', 'Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleUpdate = async (id: string, status: string, adminResponse?: string) => {
    try {
      const body: Record<string, string> = { status };
      if (adminResponse) body.adminResponse = adminResponse;

      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: UpdateResponse = await res.json();
      if (data.success) {
        toast('success', 'Ticket actualizado');
        await fetchTickets();
      } else {
        toast('error', data.error?.message ?? 'Error al actualizar');
      }
    } catch {
      toast('error', 'Error de conexión');
    }
  };

  const getCount = (status: string): number => {
    return counts.find((c) => c.status === status)?.count ?? 0;
  };

  const totalTickets = counts.reduce((acc, c) => acc + c.count, 0);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Soporte</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card
          className={`p-3 text-center cursor-pointer transition-colors ${statusFilter === null ? 'ring-1 ring-fire-500/50' : ''}`}
          onClick={() => setStatusFilter(null)}
        >
          <p className="text-xl font-display font-bold text-white">{totalTickets}</p>
          <p className="text-xs text-slate-500">Total</p>
        </Card>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <Card
              key={key}
              className={`p-3 text-center cursor-pointer transition-colors ${statusFilter === key ? 'ring-1 ring-fire-500/50' : ''}`}
              onClick={() => setStatusFilter(statusFilter === key ? null : key)}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon size={14} className={config.color} />
                <p className={`text-xl font-display font-bold ${config.color}`}>{getCount(key)}</p>
              </div>
              <p className="text-xs text-slate-500">{config.label}</p>
            </Card>
          );
        })}
      </div>

      {/* Tickets */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
          <Skeleton variant="card" className="h-40" />
        </div>
      ) : tickets.length === 0 ? (
        <Card className="p-8 text-center">
          <LifeBuoy size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 font-ui">
            {statusFilter ? `No hay tickets con estado "${STATUS_CONFIG[statusFilter]?.label}"` : 'No hay tickets de soporte'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketDetail key={ticket.id} ticket={ticket} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
