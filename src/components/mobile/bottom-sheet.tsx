'use client';

import { X } from 'lucide-react';
import { useEffect, useCallback, useRef, useState } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  snapPoints?: number[];
}

export function BottomSheet({ isOpen, onClose, title, children, snapPoints = [0.5, 0.9] }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false });
  const [height, setHeight] = useState(snapPoints[0] ?? 0.5);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      setHeight(snapPoints[0] ?? 0.5);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape, snapPoints]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    dragRef.current.startY = touch.clientY;
    dragRef.current.isDragging = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    const touch = e.touches[0];
    if (!touch) return;
    dragRef.current.currentY = touch.clientY;
    const delta = dragRef.current.startY - dragRef.current.currentY;
    const windowHeight = window.innerHeight;
    const newHeight = Math.max(0.2, Math.min(0.95, height + delta / windowHeight));
    setHeight(newHeight);
  };

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false;
    // Snap to closest point or close
    if (height < 0.25) {
      onClose();
      return;
    }
    const closest = snapPoints.reduce((prev, curr) =>
      Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev,
    );
    setHeight(closest);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={sheetRef}
        className="absolute bottom-0 left-0 right-0 bg-background-elevated rounded-t-2xl transition-[height] duration-200 ease-out"
        style={{ height: `${height * 100}vh` }}
      >
        {/* Drag handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 pb-3 border-b border-white/5">
            <h3 className="font-display font-bold text-white">{title}</h3>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white touch-target">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto px-4 py-4 safe-bottom" style={{ maxHeight: `calc(${height * 100}vh - 80px)` }}>
          {children}
        </div>
      </div>
    </div>
  );
}
