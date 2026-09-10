import { useState } from 'react';
import { Plus, Sparkles, ShieldCheck, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-2xl bg-surface border border-border-subtle rounded-xl p-8 shadow-xs space-y-8">
        {/* Header */}
        <div className="border-b border-border-subtle pb-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight">Resource Management</h1>
              <p className="text-sm text-text-muted mt-0.5">Essential SaaS Design System • shadcn/ui & Lucide Icons</p>
            </div>
          </div>
          <Badge variant="success">
            <ShieldCheck className="h-3.5 w-3.5 mr-1 inline" /> Operational
          </Badge>
        </div>

        {/* Badges Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Pill Status Badges</h2>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">In Progress</Badge>
            <Badge variant="danger">Declined</Badge>
            <Badge variant="primary">Reviewing</Badge>
            <Badge variant="neutral">Draft</Badge>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            shadcn/ui Button Variants with Lucide Icons
          </h2>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" iconLeft={<Plus className="h-4 w-4 mr-1.5" />}>
              Create Resource
            </Button>
            <Button variant="secondary" iconLeft={<Sparkles className="h-4 w-4 mr-1.5" />}>
              Generate
            </Button>
            <Button variant="outline" iconRight={<ArrowRight className="h-4 w-4 ml-1.5" />}>
              Explore
            </Button>
            <Button variant="danger">Delete</Button>
            <Button variant="primary" isLoading={isLoading} onClick={() => setIsLoading(!isLoading)}>
              {isLoading ? 'Processing...' : 'Toggle Loading'}
            </Button>
          </div>
        </section>

        {/* System Meta */}
        <footer className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted font-mono">
          <span>React 19 • Vite 8 • Tailwind v4</span>
          <span>Zustand • Axios • Lucide • shadcn</span>
        </footer>
      </main>
    </div>
  );
}
