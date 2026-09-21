import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resourceService } from '@/services/resourceService';
import { useModifyResource } from '../useModifyResource';
import type { ModifyResourceFormValues } from '@/features/resources/types/resource.types';

describe('useModifyResource', () => {
  const sampleValues: ModifyResourceFormValues = {
    fileName: 'Tài liệu cập nhật',
    fileDescription: 'Mô tả cập nhật',
    fileTypeId: 2,
    subMajorCode: 'SE',
    courseCode: 'SWR302',
    yearCompleted: 2024,
    authorNames: ['Tác giả 1', 'Tác giả 2'],
    keywords: ['AI', 'React'],
    bannerImage: null,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('gọi API updateResource, updateAuthors và đồng bộ keywords thành công', async () => {
    const updateResourceSpy = vi.spyOn(resourceService, 'updateResource').mockResolvedValue({ message: 'OK' });
    const updateAuthorsSpy = vi.spyOn(resourceService, 'updateAuthors').mockResolvedValue({ message: 'OK' });
    const getKeywordsSpy = vi.spyOn(resourceService, 'getResourceKeywords').mockResolvedValue([
      { fileKeywordId: 'kw-old', keyword: 'Vue' },
      { fileKeywordId: 'kw-keep', keyword: 'React' },
    ]);
    const deleteKeywordSpy = vi.spyOn(resourceService, 'deleteKeyword').mockResolvedValue({ message: 'OK' });
    const addKeywordsSpy = vi.spyOn(resourceService, 'addKeywords').mockResolvedValue({ message: 'OK' });

    const { result } = renderHook(() => useModifyResource());

    let success = false;
    await act(async () => {
      success = await result.current.modifyResource('res-123', sampleValues);
    });

    expect(success).toBe(true);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.apiError).toBeNull();

    expect(updateResourceSpy).toHaveBeenCalledWith('res-123', {
      fileName: 'Tài liệu cập nhật',
      fileDescription: 'Mô tả cập nhật',
      fileTypeId: 2,
      subMajorCode: 'SE',
      courseCode: 'SWR302',
      yearCompleted: 2024,
      fileBannerImage: undefined,
    });
    expect(updateAuthorsSpy).toHaveBeenCalledWith('res-123', ['Tác giả 1', 'Tác giả 2']);
    expect(getKeywordsSpy).toHaveBeenCalledWith('res-123');
    // 'Vue' should be deleted
    expect(deleteKeywordSpy).toHaveBeenCalledWith('res-123', 'kw-old');
    // 'AI' should be added ('React' was already present)
    expect(addKeywordsSpy).toHaveBeenCalledWith('res-123', ['AI']);
  });

  it('xử lý chuyển đổi bannerImage sang base64 khi có chọn tệp', async () => {
    const updateResourceSpy = vi.spyOn(resourceService, 'updateResource').mockResolvedValue({ message: 'OK' });
    vi.spyOn(resourceService, 'updateAuthors').mockResolvedValue({ message: 'OK' });
    vi.spyOn(resourceService, 'getResourceKeywords').mockResolvedValue([]);
    vi.spyOn(resourceService, 'addKeywords').mockResolvedValue({ message: 'OK' });

    const bannerFile = new File(['image-data'], 'banner.png', { type: 'image/png' });
    const valuesWithBanner: ModifyResourceFormValues = {
      ...sampleValues,
      bannerImage: bannerFile,
    };

    const { result } = renderHook(() => useModifyResource());

    let success = false;
    await act(async () => {
      success = await result.current.modifyResource('res-123', valuesWithBanner);
    });

    expect(success).toBe(true);
    expect(updateResourceSpy).toHaveBeenCalledWith(
      'res-123',
      expect.objectContaining({
        fileName: 'Tài liệu cập nhật',
        fileBannerImage: expect.stringContaining('data:image/png;base64,'),
      }),
    );
  });

  it('gán apiError và trả về false khi gọi API thất bại', async () => {
    vi.spyOn(resourceService, 'updateResource').mockRejectedValue(new Error('Lỗi máy chủ nội bộ.'));

    const { result } = renderHook(() => useModifyResource());

    let success = true;
    await act(async () => {
      success = await result.current.modifyResource('res-123', sampleValues);
    });

    expect(success).toBe(false);
    expect(result.current.apiError).toBe('Lỗi máy chủ nội bộ.');
    expect(result.current.isSubmitting).toBe(false);
  });
});
