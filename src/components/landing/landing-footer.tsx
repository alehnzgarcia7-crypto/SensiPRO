import { Zap } from 'lucide-react';
import Link from 'next/link';

const PRODUCT_LINKS = [
  { label: 'Generador', href: '/generator' },
  { label: 'Headshot Mode', href: '/generator/headshot' },
  { label: 'Academia', href: '/academy' },
  { label: 'Dispositivos', href: '/devices' },
];

const COMMUNITY_LINKS = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@sensipro5' },
  { label: 'Instagram', href: 'https://www.instagram.com/sensipro8' },
];

const LEGAL_LINKS = [
  { label: 'Privacidad', href: '/privacy' },
  { label: 'Términos', href: '/terms' },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-xs font-ui font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-slate-500 hover:text-white transition-colors font-body link-underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-white/5 bg-[#030508]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <Zap size={20} className="text-fire-500" />
              <span className="font-heading font-bold text-white text-lg">SensiPRO</span>
            </Link>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed font-body max-w-[220px]">
              Generador de sensibilidad #1 para Free Fire. 610+ dispositivos calibrados por hardware real.
            </p>

            {/* Social icons — links pendientes */}
            <div className="mt-4 flex gap-3">
              {[
                { icon: 'TT', href: 'https://www.tiktok.com/@sensipro5' },
                { icon: 'IG', href: 'https://www.instagram.com/sensipro8' },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-ui font-bold text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Producto" links={PRODUCT_LINKS} />
          <FooterColumn title="Comunidad" links={COMMUNITY_LINKS} />
          <FooterColumn title="Legal" links={LEGAL_LINKS} />
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-6xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-700 text-center sm:text-left">
            © 2025-2026 SensiPRO. No afiliado, asociado ni respaldado por Garena o Free Fire®.
          </p>
          <p className="text-xs text-slate-700">
            Hecho con 🔥 para la comunidad de Free Fire
          </p>
        </div>
      </div>
    </footer>
  );
}
