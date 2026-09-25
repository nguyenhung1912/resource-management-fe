import { describe, expect, it } from 'vitest';
import {
  extractMention,
  formatMention,
  formatReplyingToLabel,
  getEffectiveDepth,
  getTreeIndentationClass,
  isDepthCapped,
  MAX_VISUAL_DEPTH,
} from '../commentTreeUtils';

describe('commentTreeUtils', () => {
  describe('getTreeIndentationClass', () => {
    it('trả về chuỗi rỗng khi depth <= 0 (root comment)', () => {
      expect(getTreeIndentationClass(0)).toBe('');
      expect(getTreeIndentationClass(-1)).toBe('');
    });

    it('trả về class thụt lề cấp 1 khi depth = 1', () => {
      expect(getTreeIndentationClass(1)).toBe(
        'ml-4 sm:ml-5 pl-3.5 border-l-2 border-border-subtle/80 hover:border-primary/50 transition-colors',
      );
    });

    it('trả về class thụt lề giới hạn khi depth = 2 hoặc lớn hơn', () => {
      const expectedClampedClass =
        'ml-2 sm:ml-3 pl-3 border-l-2 border-border-subtle/60 hover:border-primary/50 transition-colors';
      expect(getTreeIndentationClass(2)).toBe(expectedClampedClass);
      expect(getTreeIndentationClass(3)).toBe(expectedClampedClass);
      expect(getTreeIndentationClass(10)).toBe(expectedClampedClass);
    });
  });

  describe('isDepthCapped', () => {
    it('trả về false khi depth chưa đạt ngưỡng MAX_VISUAL_DEPTH', () => {
      expect(isDepthCapped(0)).toBe(false);
      expect(isDepthCapped(1)).toBe(false);
    });

    it('trả về true khi depth >= MAX_VISUAL_DEPTH', () => {
      expect(isDepthCapped(MAX_VISUAL_DEPTH)).toBe(true);
      expect(isDepthCapped(MAX_VISUAL_DEPTH + 1)).toBe(true);
      expect(isDepthCapped(5)).toBe(true);
    });

    it('tôn trọng tham số maxDepth tùy biến', () => {
      expect(isDepthCapped(2, 3)).toBe(false);
      expect(isDepthCapped(3, 3)).toBe(true);
      expect(isDepthCapped(4, 3)).toBe(true);
    });
  });

  describe('getEffectiveDepth', () => {
    it('giới hạn depth trong khoảng [0, maxDepth]', () => {
      expect(getEffectiveDepth(-5)).toBe(0);
      expect(getEffectiveDepth(Number.NaN)).toBe(0);
      expect(getEffectiveDepth(1)).toBe(1);
      expect(getEffectiveDepth(2)).toBe(2);
      expect(getEffectiveDepth(5)).toBe(2);
      expect(getEffectiveDepth(4, 5)).toBe(4);
    });
  });

  describe('formatMention', () => {
    it('trả về chuỗi rỗng khi authorName không hợp lệ hoặc chỉ có khoảng trắng', () => {
      expect(formatMention(null)).toBe('');
      expect(formatMention(undefined)).toBe('');
      expect(formatMention('')).toBe('');
      expect(formatMention('   ')).toBe('');
    });

    it('thêm tiền tố @ và trim khoảng trắng', () => {
      expect(formatMention('Nguyễn Văn A')).toBe('@Nguyễn Văn A');
      expect(formatMention('  Trần Bình  ')).toBe('@Trần Bình');
    });
  });

  describe('formatReplyingToLabel', () => {
    it('trả về null khi không có tên người được trả lời', () => {
      expect(formatReplyingToLabel(null)).toBeNull();
      expect(formatReplyingToLabel(undefined)).toBeNull();
      expect(formatReplyingToLabel('')).toBeNull();
      expect(formatReplyingToLabel('   ')).toBeNull();
    });

    it('trả về định dạng Đang trả lời @[Tên]', () => {
      expect(formatReplyingToLabel('Nguyễn Văn A')).toBe('Đang trả lời @Nguyễn Văn A');
      expect(formatReplyingToLabel('  Trần Bình ')).toBe('Đang trả lời @Trần Bình');
    });
  });

  describe('extractMention', () => {
    it('trả về null mention khi content rỗng hoặc không có mention', () => {
      expect(extractMention('')).toEqual({ mention: null, cleanContent: '' });
      expect(extractMention('   ')).toEqual({ mention: null, cleanContent: '' });
      expect(extractMention('Bình luận bình thường không có tag')).toEqual({
        mention: null,
        cleanContent: 'Bình luận bình thường không có tag',
      });
    });

    it('trích xuất mention có dấu hai chấm (@Tên: Nội dung)', () => {
      const result = extractMention('@Nguyễn Văn A: Cảm ơn bạn rất nhiều!');
      expect(result.mention).toBe('Nguyễn Văn A');
      expect(result.cleanContent).toBe('Cảm ơn bạn rất nhiều!');
    });

    it('trích xuất mention dạng token đơn (@User nội dung)', () => {
      const result = extractMention('@hungnguyen Tài liệu này rất hay');
      expect(result.mention).toBe('hungnguyen');
      expect(result.cleanContent).toBe('Tài liệu này rất hay');
    });
  });
});
