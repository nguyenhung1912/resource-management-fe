import { Download, Bookmark } from 'lucide-react';
import { useLoaderData } from 'react-router-dom';
import ResourceDetailHeader from '../components/ResourceDetailHeader';
import ResourceTags from '../components/ResourceTags';
import RelatedResources from '../components/RelatedResources';
import { Button } from '@/components/ui/Button'; // Import vũ khí chuẩn từ kho
import type { ResourceDetailLoaderData } from '../types/resource.types';

export default function ResourceDetailPage() {
  const { detail, recommendations } = useLoaderData() as ResourceDetailLoaderData;

  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-12">
        <main className="lg:col-span-8 space-y-6">
          <ResourceDetailHeader
            title={detail.fileName}
            author={detail.uploadUserName || 'Ẩn danh'}
            date={new Date(detail.createdAt).toLocaleDateString('vi-VN')}
            views={0}
            repoUrl={detail.githubLink || null}
          />

          <div className="min-h-125 bg-neutral-800 rounded-xl flex items-center justify-center text-white">
            Khu vực hiển thị tài liệu
          </div>

          <section className="bg-surface border border-border-subtle rounded-xl p-5 shadow-xs">
            <h2 className="text-lg font-semibold mb-3 text-text-main">Mô tả chi tiết</h2>
            <p className="text-text-muted leading-relaxed">{detail.fileDescription || 'Không có mô tả.'}</p>
          </section>

          {detail.keywords && detail.keywords.length > 0 && <ResourceTags tags={detail.keywords} />}
        </main>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-surface border border-border-subtle rounded-xl p-5 flex flex-col gap-3 shadow-xs">
            <Button className="w-full" iconLeft={<Download className="size-4" />}>
              Tải xuống tài liệu
            </Button>
            <Button variant="outline" className="w-full text-text-main" iconLeft={<Bookmark className="size-4" />}>
              Lưu / Yêu thích
            </Button>
          </div>

          {recommendations && recommendations.length > 0 && (
            <RelatedResources
              items={recommendations.map((r) => ({
                id: r.fileId,
                title: r.fileName,
                author: r.uploadUserName || 'Ẩn danh',
                thumbnailUrl: r.fileUrl || undefined, // Sửa lỗi chính tả tại đây
              }))}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
