'use client';

import { cn } from '@/lib/cn';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex gap-1 p-1 rounded-gaming bg-background-card border border-white/5', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
            'text-sm font-ui font-medium transition-all min-h-[44px]',
            activeTab === tab.key
              ? 'bg-fire-500/10 text-fire-400 border border-fire-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5',
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
