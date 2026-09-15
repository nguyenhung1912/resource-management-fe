import type { LoaderFunctionArgs } from 'react-router-dom';
import { moderationService } from '@/services/moderationService';
import type { ModerationDetailLoaderData } from '@/features/moderation/types/moderation.types';

export async function moderationDetailLoader({ params }: LoaderFunctionArgs): Promise<ModerationDetailLoaderData> {
  const fileId = params.fileId;
  if (!fileId || !fileId.trim()) {
    throw new Response('Mã tài liệu không hợp lệ hoặc bị thiếu.', { status: 400 });
  }

  try {
    // async-parallel: Tải đồng thời thông tin chi tiết tài liệu và lịch sử kiểm duyệt
    const [detailResponse, historyResponse] = await Promise.all([
      moderationService.getModerationDetails(fileId),
      moderationService.getModerationHistory(fileId),
    ]);

    if (!detailResponse?.data) {
      throw new Response('Không tìm thấy tài liệu cần kiểm duyệt.', { status: 404 });
    }

    return {
      detail: detailResponse.data,
      history: historyResponse?.data ?? [],
    };
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    throw new Response('Không thể tải thông tin chi tiết kiểm duyệt tài liệu.', { status: 500 });
  }
}

export default moderationDetailLoader;
