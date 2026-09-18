type ResourceTagsProps = {
  tags: string[];
};

export default function ResourceTags({ tags }: ResourceTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <div key={t} className="px-3 py-1 bg-surface border border-border text-sm rounded-full text-text-muted">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
