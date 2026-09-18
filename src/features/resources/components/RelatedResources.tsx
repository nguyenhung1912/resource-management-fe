type RelatedItem = {
  id: string | number;
  title: string;
  author?: string;
  thumbnailUrl?: string;
};

type RelatedResourcesProps = {
  items: RelatedItem[];
};

export default function RelatedResources({ items }: RelatedResourcesProps) {
  if (!items || items.length === 0) return null;

  return (
    <aside className="mt-6 border border-border rounded-lg bg-surface p-4">
      <h3 className="text-sm font-semibold mb-3 text-text">Có thể bạn quan tâm</h3>

      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div key={it.id} className="flex items-start gap-3">
            <img
              src={it.thumbnailUrl}
              alt={it.title}
              className="w-12 h-12 object-cover rounded-md shrink-0 bg-neutral-200"
            />

            <div className="flex-1">
              <div className="text-sm font-medium text-text line-clamp-2">{it.title}</div>
              {it.author ? <div className="text-xs text-text-muted mt-1">{it.author}</div> : null}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
