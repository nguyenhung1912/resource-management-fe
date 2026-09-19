import ResourceDetailHeader from '../components/ResourceDetailHeader';
import ResourceTags from '../components/ResourceTags';
import RelatedResources from '../components/RelatedResources';
import { useLoaderData } from 'react-router-dom';
import type { ResourceDetailLoaderData } from '../types/resource.types';

export default function ResourceDetailPage() {
  const { detail, recommendations } = useLoaderData() as ResourceDetailLoaderData;
  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-6 lg:grid-cols-12">
        <main className="lg:col-span-8">
          <ResourceDetailHeader
            title={detail.fileName}
            author={detail.uploadUserName || 'Ẩn danh'}
            date={new Date(detail.createdAt).toLocaleDateString('vi-VN')}
            views={0}
            repoUrl={detail.githubLink || null}
          />

          <div className="min-h-125 bg-neutral-800 rounded-lg flex items-center justify-center text-white">
            Khu vực hiển thị tài liệu
          </div>

          <section className="mt-6 bg-surface border border-border rounded-lg p-5">
            <h2 className="text-lg font-semibold mb-3 text-text">Mô tả chi tiết</h2>
            <p className="text-text-muted leading-relaxed">{detail.fileDescription || 'Không có mô tả.'}</p>
          </section>

          <ResourceTags tags={detail.keywords} />
        </main>

        <aside className="lg:col-span-4">
          <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
            <button className="w-full px-4 py-2 bg-primary text-white rounded-md">Tải xuống tài liệu</button>
            <button className="w-full px-4 py-2 border border-border rounded-md text-text">Lưu / Yêu thích</button>
          </div>

          <RelatedResources
            items={recommendations.map((r) => ({
              id: r.fileId,
              title: r.fileName,
              author: r.uploadUserName || 'Ẩn danh',
              thumnailUrl: r.fileUrl || undefined,
            }))}
          />
        </aside>
      </div>
    </div>
  );
}
