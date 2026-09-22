import { useCallback, useEffect, useRef, useState, type ComponentType, type SVGProps } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Code,
  FileText,
  Files,
  Folder,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import type { LookupItem } from '../types/all-resources.types';

export interface LibraryFileTypeTabsProps {
  fileTypes: LookupItem[];
  activeFileTypeId?: number;
  onSelectFileType: (fileTypeId?: number) => void;
}

function getFileTypeIcon(typeName: string): ComponentType<SVGProps<SVGSVGElement>> {
  if (/bài giảng|giáo trình|lecture/i.test(typeName)) return BookOpen;
  if (/khóa luận|luận văn|thesis|tốt nghiệp/i.test(typeName)) return GraduationCap;
  if (/báo cáo|report|nckh/i.test(typeName)) return FileText;
  if (/mã nguồn|source\s*code|code/i.test(typeName)) return Code;
  if (/tài liệu|tài nguyên/i.test(typeName)) return Files;
  return Folder;
}

export function LibraryFileTypeTabs({ fileTypes, activeFileTypeId, onSelectFileType }: LibraryFileTypeTabsProps) {
  const isAllActive = activeFileTypeId === undefined || activeFileTypeId === 0;
  const navRef = useRef<HTMLElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = navRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.6, 220);
    el.scrollBy?.({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    checkScroll();

    el.addEventListener('scroll', checkScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(el);
    }

    // Support horizontal scroll
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        const isAtStart = el.scrollLeft <= 0 && e.deltaY < 0;
        const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
        if (!isAtStart && !isAtEnd) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScroll();
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      el.removeEventListener('scroll', checkScroll);
      el.removeEventListener('wheel', handleWheel);
      resizeObserver?.disconnect();
    };
  }, [checkScroll, fileTypes]);

  // Tự động cuộn tab đang active vào vùng nhìn thấy
  useEffect(() => {
    if (activeFileTypeId && navRef.current) {
      const activeEl = navRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
      activeEl?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [activeFileTypeId]);

  return (
    <div className="relative flex items-center group/tabs">
      {/* Nút cuộn trái & gradient fade */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center pr-3 bg-linear-to-r from-background via-background/90 to-transparent z-10 select-none">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="size-8 rounded-full flex items-center justify-center bg-surface border border-border-subtle shadow-xs hover:shadow-sm hover:border-primary/40 hover:text-primary text-text-main transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cuộn sang trái danh mục thể loại"
            title="Cuộn sang trái"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* horizontal scroll tab list */}
      <nav
        ref={navRef}
        role="tablist"
        aria-label="Phân loại thể loại tài liệu thư viện"
        className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none scroll-smooth w-full"
      >
        {/* Tab All */}
        <button
          type="button"
          role="tab"
          aria-selected={isAllActive}
          onClick={(e) => {
            onSelectFileType(undefined);
            e.currentTarget.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }}
          className={cn(
            'inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer border shrink-0',
            isAllActive
              ? 'bg-primary text-white border-primary shadow-xs'
              : 'bg-surface text-text-muted hover:text-text-main hover:bg-gray-50 border-border-subtle',
          )}
        >
          <Layers className="size-3.5" aria-hidden="true" />
          <span>Tất cả học liệu</span>
        </button>

        {/* Dynamic Type Tabs */}
        {fileTypes.map((type) => {
          const typeId = Number(type.id);
          const isActive = activeFileTypeId === typeId;
          const Icon = getFileTypeIcon(type.name);

          return (
            <button
              key={type.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={(e) => {
                onSelectFileType(isActive ? undefined : typeId);
                e.currentTarget.scrollIntoView?.({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
              }}
              className={cn(
                'inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all select-none cursor-pointer border shrink-0',
                isActive
                  ? 'bg-primary text-white border-primary shadow-xs font-semibold'
                  : 'bg-surface text-text-muted hover:text-text-main hover:bg-gray-50 border-border-subtle',
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span>{type.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Nút cuộn phải & gradient fade */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pl-3 bg-linear-to-l from-background via-background/90 to-transparent z-10 select-none">
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="size-8 rounded-full flex items-center justify-center bg-surface border border-border-subtle shadow-xs hover:shadow-sm hover:border-primary/40 hover:text-primary text-text-main transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cuộn sang phải danh mục thể loại"
            title="Cuộn sang phải"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export default LibraryFileTypeTabs;
