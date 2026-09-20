import { describe, expect, it } from 'vitest';
import {
  calculateSourceCodeStats,
  formatAuthors,
  formatYearCompleted,
  getSourceCodeStatusBadge,
  isValidGithubUrl,
} from '../sourceCodeUtils';
import type { SourceCodeItem } from '../../types/source-code.types';

describe('sourceCodeUtils', () => {
  describe('getSourceCodeStatusBadge', () => {
    it('trả về variant success cho statusId = 2 (Đã duyệt)', () => {
      const badge = getSourceCodeStatusBadge(2, 'Đã duyệt');
      expect(badge.variant).toBe('success');
      expect(badge.label).toBe('Đã duyệt');
      expect(badge.dotClassName).toContain('bg-success');
    });

    it('trả về variant warning cho statusId = 1 (Chờ duyệt)', () => {
      const badge = getSourceCodeStatusBadge(1, 'Chờ duyệt');
      expect(badge.variant).toBe('warning');
      expect(badge.label).toBe('Chờ duyệt');
      expect(badge.dotClassName).toContain('bg-warning');
    });

    it('trả về variant danger cho statusId = 3 (Bị từ chối)', () => {
      const badge = getSourceCodeStatusBadge(3, 'Bị từ chối');
      expect(badge.variant).toBe('danger');
      expect(badge.label).toBe('Bị từ chối');
      expect(badge.dotClassName).toContain('bg-danger');
    });

    it('trả về variant neutral cho statusId không xác định', () => {
      const badge = getSourceCodeStatusBadge(99);
      expect(badge.variant).toBe('neutral');
      expect(badge.label).toBe('Không xác định');
      expect(badge.dotClassName).toContain('bg-text-muted');
    });
  });

  describe('isValidGithubUrl', () => {
    it('nhận diện đúng link GitHub hợp lệ', () => {
      expect(isValidGithubUrl('https://github.com/facebook/react')).toBe(true);
      expect(isValidGithubUrl('https://www.github.com/vitejs/vite')).toBe(true);
      expect(isValidGithubUrl('  https://github.com/org/repo/tree/main  ')).toBe(true);
    });

    it('từ chối link không phải GitHub hoặc URL không hợp lệ', () => {
      expect(isValidGithubUrl('')).toBe(false);
      expect(isValidGithubUrl(null)).toBe(false);
      expect(isValidGithubUrl(undefined)).toBe(false);
      expect(isValidGithubUrl('not-a-url')).toBe(false);
      expect(isValidGithubUrl('https://gitlab.com/repo')).toBe(false);
      expect(isValidGithubUrl('https://github.com')).toBe(false);
      expect(isValidGithubUrl('https://github.com/')).toBe(false);
    });
  });

  describe('calculateSourceCodeStats', () => {
    it('tính toán chính xác các chỉ số KPI từ danh sách items', () => {
      const mockItems: SourceCodeItem[] = [
        {
          fileId: '1',
          fileName: 'Repo 1',
          fileDescription: null,
          fileUrl: 'url',
          fileTypeId: 5,
          fileTypeName: 'Mã nguồn',
          subMajorCode: 'CNTT_KTPM',
          courseCode: 'IT3040',
          yearCompleted: 2026,
          githubLink: 'https://github.com/repo/1',
          bannerUrl: null,
          fileStatusId: 2,
          fileStatusName: 'Approved',
          uploadUserId: 'USR_1',
          createdAt: '2026-09-20',
        },
        {
          fileId: '2',
          fileName: 'Repo 2',
          fileDescription: null,
          fileUrl: 'url',
          fileTypeId: 5,
          fileTypeName: 'Mã nguồn',
          subMajorCode: 'CNTT_KTPM',
          courseCode: 'IT3040',
          yearCompleted: 2025,
          githubLink: null,
          bannerUrl: null,
          fileStatusId: 1,
          fileStatusName: 'Pending',
          uploadUserId: 'USR_2',
          createdAt: '2026-09-20',
        },
        {
          fileId: '3',
          fileName: 'Repo 3',
          fileDescription: null,
          fileUrl: 'url',
          fileTypeId: 5,
          fileTypeName: 'Mã nguồn',
          subMajorCode: 'CNTT_AI',
          courseCode: 'IT4010',
          yearCompleted: 2026,
          githubLink: 'https://github.com/repo/3',
          bannerUrl: null,
          fileStatusId: 2,
          fileStatusName: 'Approved',
          uploadUserId: 'USR_3',
          createdAt: '2026-09-20',
        },
      ];

      const stats = calculateSourceCodeStats(mockItems, 100);

      expect(stats.totalCount).toBe(100);
      expect(stats.withGithubCount).toBe(2);
      expect(stats.subMajorsCount).toBe(2); // 'CNTT_KTPM' và 'CNTT_AI'
      expect(stats.approvedCount).toBe(2); // items 1 và 3
    });
  });

  describe('formatYearCompleted & formatAuthors', () => {
    it('formatYearCompleted trả về chuỗi năm hoặc N/A', () => {
      expect(formatYearCompleted(2026)).toBe('2026');
      expect(formatYearCompleted(null)).toBe('N/A');
      expect(formatYearCompleted(0)).toBe('N/A');
    });

    it('formatAuthors trả về danh sách tác giả cách nhau bởi dấu phẩy', () => {
      expect(formatAuthors([{ fullName: 'Nguyễn Văn A' }, { fullName: 'Trần Thị B' }])).toBe(
        'Nguyễn Văn A, Trần Thị B',
      );
      expect(formatAuthors([])).toBe('Chưa có tác giả');
      expect(formatAuthors(null)).toBe('Chưa có tác giả');
    });
  });
});
