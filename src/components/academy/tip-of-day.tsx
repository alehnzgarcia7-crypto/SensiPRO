import { Lightbulb, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@ares/logger';
import { getTipOfDay } from '@/lib/academy/academy-queries';

interface TipOfDayData {
  id: string;
  title: string;
  content: string;
  category: string;
}

const DEFAULT_TIP: TipOfDayData = {
  id: 'default',
  title: 'Sensibilidad según dispositivo',
  content:
    'Tu sensibilidad ideal depende del hardware de tu dispositivo. Un celular con pantalla de 120Hz necesita valores diferentes a uno de 60Hz. Usa nuestro generador para obtener la sensibilidad perfecta para tu modelo exacto.',
  category: 'SENSITIVITY',
};

async function fetchTipOfDay(): Promise<TipOfDayData> {
  try {
    const tip = await getTipOfDay();
    if (!tip) return DEFAULT_TIP;
    return tip;
  } catch {
    logger.debug('Error fetching tip of day, using default');
    return DEFAULT_TIP;
  }
}

export async function TipOfDay() {
  const tip = await fetchTipOfDay();

  return (
    <section className="relative overflow-hidden rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 p-2.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
          <Lightbulb className="w-5 h-5 text-yellow-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
              Tip del día
            </span>
            <span className="text-xs text-slate-500">#{tip.id.slice(-4)}</span>
          </div>

          <h3 className="font-bold text-white text-sm mb-1.5">{tip.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{tip.content}</p>
        </div>

        <Link
          href="/academy/tips"
          className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Ver todos los tips"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </section>
  );
}
