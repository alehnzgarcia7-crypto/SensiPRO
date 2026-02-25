import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, MessageSquare, Lock } from 'lucide-react';
import { CATEGORY_CONFIGS } from '@/lib/academy/academy-config';
import type { GuideListItem } from '@/lib/academy/academy-queries';

interface GuideCardProps {
  guide: GuideListItem;
  showCategory?: boolean;
  index?: number;
}

export function GuideCard({ guide, showCategory = true, index = 0 }: GuideCardProps) {
  const categoryConfig = CATEGORY_CONFIGS[guide.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <Link
      href={`/academy/guides/${guide.slug}`}
      className="group glass-card flex flex-col overflow-hidden academy-stagger"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header — Category gradient with watermark icon */}
      <div className="relative min-h-[180px] overflow-hidden">
        {guide.imageUrl ? (
          <>
            <Image
              src={guide.imageUrl}
              alt={guide.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay for image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-[#0a0f1e]/30 to-transparent" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: categoryConfig.headerGradient }}
          >
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />
            {/* Watermark icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CategoryIcon className="w-16 h-16 text-white/25" strokeWidth={1.5} />
            </div>
          </div>
        )}

        {/* Category badge */}
        {showCategory && (
          <div
            className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md font-[family-name:var(--font-rajdhani)] font-bold text-xs uppercase tracking-wider text-white/90"
            style={{ backgroundColor: `${categoryConfig.color}cc` }}
          >
            <CategoryIcon className="w-3 h-3" />
            {categoryConfig.nameEs}
          </div>
        )}

        {/* PRO badge — golden gradient with glow */}
        {guide.isPremium && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-yellow-500 to-amber-600 text-xs font-bold text-black shadow-[0_0_12px_rgba(234,179,8,0.3)]">
            <Lock className="w-3 h-3" />
            PRO
          </div>
        )}

        {/* Bottom glow line — category color */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] z-10"
          style={{
            background: categoryConfig.color,
            boxShadow: `0 0 8px ${categoryConfig.color}66, 0 0 16px ${categoryConfig.color}33`,
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-[family-name:var(--font-rajdhani)] font-semibold text-white text-lg mb-2 line-clamp-2 group-hover:text-fire-400 transition-colors">
          {guide.title}
        </h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2 flex-1">
          {guide.description}
        </p>

        {/* Stats — JetBrains Mono */}
        <div className="flex items-center gap-3 font-numbers text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {guide.readTimeMin} min
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {guide.viewCount.toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {guide._count.comments}
          </span>
        </div>
      </div>
    </Link>
  );
}
