import { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Eye, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { RecommendedResourceItem } from '../types/all-resources.types';

export interface LibraryFeaturedShelfProps {
  items: RecommendedResourceItem[];
  onSelect: (fileId: string) => void;
}

export function LibraryFeaturedShelf({ items, onSelect }: LibraryFeaturedShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.75, 280);
    el.scrollBy?.({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(checkScroll);
      resizeObserver.observe(el);
    }

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
  }, [checkScroll, items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section aria-label="Tài liệu nổi bật và đề xuất" className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
            <Sparkles className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-text-main tracking-tight">
                Tài liệu Nổi bật & Gợi ý cho bạn
              </h2>
              <Badge variant="warning" className="hidden sm:inline-flex font-semibold">
                Đề xuất từ AI
              </Badge>
            </div>
            <p className="text-xs text-text-muted">
              Kho học liệu cùng chuyên ngành được đánh giá cao nhất dành cho bạn
            </p>
          </div>
        </div>

        {/* Action Controls: Item Count + Scroll Prev/Next Buttons */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-muted hidden md:inline-block">
            {items.length} tài liệu gợi ý
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className="size-8 rounded-lg flex items-center justify-center border border-border-subtle bg-surface text-text-muted hover:text-text-main hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Xem tài liệu gợi ý trước đó"
              title="Cuộn sang trái"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className="size-8 rounded-lg flex items-center justify-center border border-border-subtle bg-surface text-text-muted hover:text-text-main hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Xem tài liệu gợi ý tiếp theo"
              title="Cuộn sang phải"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scroll Showcase Rail */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none scroll-smooth"
        tabIndex={0}
        aria-label="Danh sách tài liệu đề xuất"
      >
        {items.map((item) => {
          const bannerSrc = item.bannerUrl || item.bannerImage;
          const score = item.averageScore ?? 0;
          const reviewsCount = item.totalReviews ?? 0;

          return (
            <article
              key={item.fileId}
              className="w-72 sm:w-80 shrink-0 snap-start rounded-xl border border-border-subtle bg-surface shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Banner / Fallback Cover */}
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100 select-none">
                  {bannerSrc ? (
                    <img
                      src={bannerSrc}
                      alt={item.fileName}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="size-full bg-linear-to-br from-blue-50 via-indigo-50/50 to-slate-100 flex flex-col items-center justify-center p-4 text-center">
                      <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1.5 shadow-2xs">
                        <BookOpen className="size-5" aria-hidden="true" />
                      </div>
                      <span className="text-[11px] font-medium text-text-muted line-clamp-1">
                        {item.courseName || item.subMajorCode || 'Tài nguyên số QNU'}
                      </span>
                    </div>
                  )}

                  {/* Top-left FileType Badge */}
                  {item.fileTypeName && (
                    <div className="absolute top-2.5 left-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-white shadow-xs backdrop-blur-xs">
                        {item.fileTypeName}
                      </span>
                    </div>
                  )}

                  {/* Top-right Rating Badge */}
                  {score > 0 && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-surface/95 text-amber-600 shadow-xs border border-amber-100">
                        <Star className="size-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                        {score.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content Body */}
                <div className="p-4 space-y-2">
                  <h3
                    onClick={() => onSelect(item.fileId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelect(item.fileId);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    className="font-semibold text-sm text-text-main line-clamp-2 hover:text-primary transition-colors cursor-pointer leading-snug"
                    title={item.fileName}
                  >
                    {item.fileName}
                  </h3>

                  {/* Academic Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-text-muted pt-0.5">
                    {item.subMajorCode && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-text-main">
                        {item.subMajorCode}
                      </span>
                    )}
                    {item.courseName && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-primary font-medium truncate max-w-35">
                        {item.courseName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-border-subtle/50 text-xs">
                <span className="text-text-muted text-[11px]">
                  {reviewsCount > 0 ? `${reviewsCount} đánh giá` : 'Mới cập nhật'}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(item.fileId)}
                  className="gap-1.5 text-xs text-primary hover:text-primary hover:bg-primary/10 h-8 px-2.5"
                  aria-label={`Xem chi tiết tài liệu ${item.fileName}`}
                >
                  <Eye className="size-3.5" aria-hidden="true" />
                  <span>Xem nhanh</span>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default LibraryFeaturedShelf;
