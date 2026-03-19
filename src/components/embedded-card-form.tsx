/**
 * EmbeddedCardForm — Formulario de pago con tarjeta embebido
 *
 * Se usa cuando el usuario está en un WebView (TikTok, Instagram, etc.)
 * donde Stripe Checkout Sessions no funcionan. Muestra el Stripe
 * Payment Element inline en el modal sin salir de sensipro.pro.
 */

'use client';

import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// ═══════════════════════════════════════════════════════
// CHECKOUT FORM — Formulario interior con Payment Element
// ═══════════════════════════════════════════════════════

function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setLoading(true);
      setError(null);

      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success`,
          },
          redirect: 'if_required',
        });

      if (confirmError) {
        setError(confirmError.message || 'Error al procesar el pago');
        setLoading(false);
      } else if (
        paymentIntent &&
        paymentIntent.status === 'succeeded'
      ) {
        onSuccess();
      } else {
        // Para casos donde se requiere acción adicional (3DS, etc.)
        // el redirect se manejará automáticamente
        setLoading(false);
      }
    },
    [stripe, elements, onSuccess],
  );

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />

      {error && (
        <div className="flex items-center gap-1.5 mt-3 text-xs text-red-400">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer bg-gradient-to-r from-cyan-500 to-cyan-600 text-white hover:from-cyan-400 hover:to-cyan-500 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            PAGAR $199 MXN
          </>
        )}
      </button>

      <p className="text-[10px] text-slate-600 mt-2 text-center flex items-center justify-center gap-1">
        <Lock className="w-2.5 h-2.5" />
        Pago seguro encriptado con SSL
      </p>
    </form>
  );
}

// ═══════════════════════════════════════════════════════
// EMBEDDED CARD FORM — Wrapper con Elements provider
// ═══════════════════════════════════════════════════════

interface EmbeddedCardFormProps {
  email: string;
  device?: string;
  fingerCount?: number;
  style?: string;
  source?: string;
  onSuccess: () => void;
}

export function EmbeddedCardForm({
  email,
  device,
  fingerCount,
  style,
  source,
  onSuccess,
}: EmbeddedCardFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function createIntent() {
      try {
        const res = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, device, fingerCount, style, source }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          if (data.isPremium) {
            // Ya es premium — activar directamente
            onSuccess();
            return;
          }
          setError(data.error || 'Error al inicializar el pago');
          return;
        }

        setClientSecret(data.clientSecret);
      } catch {
        if (!cancelled) {
          setError('Error de conexión. Intenta de nuevo.');
        }
      }
    }

    createIntent();

    return () => {
      cancelled = true;
    };
  }, [email, device, fingerCount, style, source, onSuccess]);

  if (error) {
    return (
      <div className="py-4 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="py-6 flex flex-col items-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        <p className="text-xs text-slate-400 mt-2">
          Preparando formulario de pago...
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#06b6d4',
            colorBackground: '#0f172a',
            colorText: '#e2e8f0',
            colorDanger: '#f87171',
            borderRadius: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          },
          rules: {
            '.Input': {
              border: '1px solid rgba(255,255,255,0.1)',
              backgroundColor: 'rgba(255,255,255,0.03)',
            },
            '.Input:focus': {
              border: '1px solid rgba(6,182,212,0.5)',
              boxShadow: '0 0 0 1px rgba(6,182,212,0.3)',
            },
            '.Label': {
              color: '#94a3b8',
              fontSize: '12px',
            },
          },
        },
        locale: 'es',
      }}
    >
      <CheckoutForm onSuccess={onSuccess} />
    </Elements>
  );
}
