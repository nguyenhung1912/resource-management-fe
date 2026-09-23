import { describe, expect, it } from 'vitest';
import {
  formatSimilarityPercent,
  getSimilarityBadgeConfig,
  getSimilarityRiskLevel,
  normalizeMatchedChunk,
  normalizeMatchedChunks,
} from '../plagiarism.utils';
import type { PlagiarismMatchedChunk } from '../../types/moderation.types';

describe('plagiarism.utils', () => {
  describe('getSimilarityRiskLevel', () => {
    it('trả về danger khi tỷ lệ >= 70%', () => {
      expect(getSimilarityRiskLevel(70)).toBe('danger');
      expect(getSimilarityRiskLevel(88.5)).toBe('danger');
      expect(getSimilarityRiskLevel(100)).toBe('danger');
    });

    it('trả về warning khi tỷ lệ từ 30% đến 69.9%', () => {
      expect(getSimilarityRiskLevel(30)).toBe('warning');
      expect(getSimilarityRiskLevel(55.4)).toBe('warning');
      expect(getSimilarityRiskLevel(69.9)).toBe('warning');
    });

    it('trả về safe khi tỷ lệ < 30%', () => {
      expect(getSimilarityRiskLevel(29.9)).toBe('safe');
      expect(getSimilarityRiskLevel(15)).toBe('safe');
      expect(getSimilarityRiskLevel(0)).toBe('safe');
    });
  });

  describe('getSimilarityBadgeConfig', () => {
    it('cung cấp cấu hình chuẩn cho từng mức nguy cơ', () => {
      const dangerConfig = getSimilarityBadgeConfig('danger');
      expect(dangerConfig.variant).toBe('danger');
      expect(dangerConfig.label).toBe('Nguy cơ cao');
      expect(dangerConfig.dotColor).toBe('bg-danger');

      const warningConfig = getSimilarityBadgeConfig('warning');
      expect(warningConfig.variant).toBe('warning');
      expect(warningConfig.label).toBe('Cần lưu ý');
      expect(warningConfig.dotColor).toBe('bg-warning');

      const safeConfig = getSimilarityBadgeConfig('safe');
      expect(safeConfig.variant).toBe('success');
      expect(safeConfig.label).toBe('Tương đồng thấp');
      expect(safeConfig.dotColor).toBe('bg-success');
    });
  });

  describe('formatSimilarityPercent', () => {
    it('định dạng số chính xác có dấu %', () => {
      expect(formatSimilarityPercent(88.54)).toBe('88.5%');
      expect(formatSimilarityPercent(50)).toBe('50%');
      expect(formatSimilarityPercent(0)).toBe('0%');
      expect(formatSimilarityPercent(-5)).toBe('0%');
      expect(formatSimilarityPercent(120)).toBe('100%');
      expect(formatSimilarityPercent(null)).toBe('0%');
      expect(formatSimilarityPercent(undefined)).toBe('0%');
    });
  });

  describe('normalizeMatchedChunk', () => {
    it('chuẩn hóa dữ liệu định dạng Swagger tiêu chuẩn', () => {
      const swaggerData: PlagiarismMatchedChunk = {
        chunkIndex: 2,
        sourceFileId: 'FIL_SWAGGER_001',
        sourceFileName: 'Khóa luận Tốt nghiệp K19',
        similarity: 82.4,
        contentSnippet: 'Đoạn trích kiểm tra từ swagger...',
      };

      const result = normalizeMatchedChunk(swaggerData);

      expect(result).toEqual({
        chunkIndex: 2,
        sourceFileId: 'FIL_SWAGGER_001',
        sourceFileName: 'Khóa luận Tốt nghiệp K19',
        similarity: 82.4,
        contentSnippet: 'Đoạn trích kiểm tra từ swagger...',
        riskLevel: 'danger',
      });
    });

    it('chuẩn hóa dữ liệu định dạng C# Backend DTO (PlagiarismChunkMatchDto)', () => {
      const beDto: PlagiarismMatchedChunk = {
        chunkIndex: 3,
        matchedWithFileId: 'FIL_BE_002',
        matchedWithFileName: 'Báo cáo NCKH Đề tài Cấp trường',
        cosineSimilarity: 0.456,
        snippet: 'Đoạn trích từ backend DTO...',
      };

      const result = normalizeMatchedChunk(beDto);

      expect(result).toEqual({
        chunkIndex: 3,
        sourceFileId: 'FIL_BE_002',
        sourceFileName: 'Báo cáo NCKH Đề tài Cấp trường',
        similarity: 45.6,
        contentSnippet: 'Đoạn trích từ backend DTO...',
        riskLevel: 'warning',
      });
    });

    it('xử lý an toàn khi đầu vào null hoặc undefined', () => {
      const result = normalizeMatchedChunk(null, 5);

      expect(result).toEqual({
        chunkIndex: 5,
        sourceFileId: '',
        sourceFileName: 'Tài liệu nguồn ẩn danh',
        similarity: 0,
        contentSnippet: '',
        riskLevel: 'safe',
      });
    });

    it('tạo fallback tên file khi chỉ có sourceFileId', () => {
      const result = normalizeMatchedChunk({ sourceFileId: 'FIL_XYZ' });
      expect(result.sourceFileName).toBe('Tài liệu #FIL_XYZ');
    });
  });

  describe('normalizeMatchedChunks', () => {
    it('trả về mảng rỗng khi danh sách không hợp lệ', () => {
      expect(normalizeMatchedChunks(null)).toEqual([]);
      expect(normalizeMatchedChunks(undefined)).toEqual([]);
      expect(normalizeMatchedChunks([])).toEqual([]);
    });

    it('chuẩn hóa danh sách nhiều phần tử thành công', () => {
      const rawList: PlagiarismMatchedChunk[] = [
        { similarity: 90, sourceFileName: 'A' },
        { cosineSimilarity: 0.2, snippet: 'B' },
      ];

      const list = normalizeMatchedChunks(rawList);
      expect(list).toHaveLength(2);
      expect(list[0].chunkIndex).toBe(1);
      expect(list[0].similarity).toBe(90);
      expect(list[0].riskLevel).toBe('danger');
      expect(list[1].chunkIndex).toBe(2);
      expect(list[1].similarity).toBe(20);
      expect(list[1].riskLevel).toBe('safe');
    });
  });
});
