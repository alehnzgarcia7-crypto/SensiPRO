import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, MessageSquare, Lock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { CATEGORY_CONFIGS } from '@/lib/academy/academy-config';
import type { GuideListItem } from '@/lib/academy/academy-queries';

interface GuideCardProps {
  guide: GuideListItem;
  showCategory?: boolean;
}

export function GuideCard({ guide, showCategory = true }: GuideCardProps) {
  const categoryConfig = CATEGORY_CONFIGS[guide.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <Link
      href={`/academy/guides/${guide.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0f1e]/40 backdrop-blur-sm hover:border-white/[0.12] hover:bg-[#0a0f1e]/60 transition-all duration-300 hover:shadow-[0_0_24px_rgba(255,255,255,0.02)]"
    >
      {/* Image */}
      <div className="relative aspect-video bg-background-card overflow-hidden">
        {guide.imageUrl ? (
          <Image
            src={guide.imageUrl}
            alt={guide.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-gradient-to-br',
              categoryConfig.gradient,
              'opacity-20',
            )}
          >
            <CategoryIcon className="w-16 h-16 text-white/50" />
          </div>
        )}

        {/* Premium badge */}
        {guide.isPremium && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-yellow-500/90 text-xs font-bold text-black">
            <Lock className="w-3 h-3" />
            PRO
          </div>
        )}

        {/* Category badge */}
        {showCategory && (
          <div
            className={cn(
              'absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-white/90',
              `bg-gradient-to-r ${categoryConfig.gradient}`,
            )}
          >
            <CategoryIcon className="w-3 h-3" />
            {categoryConfig.nameEs}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-fire-400 transition-colors">
          {guide.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 flex-1">
          {guide.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
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
