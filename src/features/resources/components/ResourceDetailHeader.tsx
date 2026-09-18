import { User, Calendar, Eye, GitBranch } from 'lucide-react';

type ResourceDetailHeaderProps = {
  title: string;
  author: string;
  date: string;
  views: number;
  repoUrl: string | null;
};

export default function ResourceDetailHeader({ title, author, date, views, repoUrl }: ResourceDetailHeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-text">{title}</h1>

      <div className="mt-3 flex items-center gap-4 text-text-muted">
        <span className="inline-flex items-center gap-2 text-sm">
          <User size={16} />
          <span>{author}</span>
        </span>

        <span className="inline-flex items-center gap-2 text-sm">
          <Calendar size={16} />
          <span>{date}</span>
        </span>

        <span className="inline-flex items-center gap-2 text-sm">
          <Eye size={16} />
          <span>{views.toLocaleString()}</span>
        </span>

        {repoUrl ? (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-md text-sm"
          >
            <GitBranch size={16} aria-hidden="true" />
            <span>Mở Repository</span>
          </a>
        ) : null}
      </div>
    </header>
  );
}
