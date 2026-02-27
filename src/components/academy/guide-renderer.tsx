// ═══════════════════════════════════════════════════════════════
// Guide Content Renderer — Renderiza bloques de contenido estructurado
// Soporta: text, callout, table, list, ordered-list
// ═══════════════════════════════════════════════════════════════

import type { ContentBlock, GuideSection } from '@/lib/academy/guide-content';

import { GuideCallout } from './guide-callout';

interface GuideRendererProps {
  sections: GuideSection[];
}

export function GuideRenderer({ sections }: GuideRendererProps) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.id} id={section.id} className="scroll-mt-24">
          <h2 className="text-xl font-bold text-white mb-4 font-[family-name:var(--font-rajdhani)]">
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.blocks.map((block, blockIdx) => (
              <BlockRenderer key={`${section.id}-${blockIdx}`} block={block} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <p
          className="text-slate-300 leading-relaxed text-[15px]"
          dangerouslySetInnerHTML={{ __html: block.content ?? '' }}
        />
      );

    case 'callout':
      return (
        <GuideCallout
          variant={block.variant ?? 'dato-clave'}
          content={block.content ?? ''}
        />
      );

    case 'list':
      return (
        <ul className="space-y-2 pl-1">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-slate-300 text-[15px]">
              <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-fire-400" />
              <span
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            </li>
          ))}
        </ul>
      );

    case 'ordered-list':
      return (
        <ol className="space-y-2 pl-1">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-slate-300 text-[15px]">
              <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center font-numbers text-xs font-bold text-fire-400 mt-0.5">
                {i + 1}
              </span>
              <span
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            </li>
          ))}
        </ol>
      );

    case 'table':
      return (
        <div className="overflow-x-auto rounded-xl border border-white/[0.06] my-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.04]">
                {block.headers?.map((header, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-slate-300 uppercase tracking-wider border-b border-white/[0.06]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows?.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-4 py-3 text-slate-300 text-[13px]"
                      dangerouslySetInnerHTML={{ __html: cell }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}
