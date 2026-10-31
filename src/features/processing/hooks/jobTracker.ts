import type { ProcessingJob } from '../types/processing.types';

export interface JobSnapshot {
  job: ProcessingJob | null;
  error: string | null;
}
interface Entry {
  snapshot: JobSnapshot;
  listeners: Set<() => void>;
  timer?: ReturnType<typeof setTimeout>;
  flight?: AbortController;
  generation: number;
  delay: number;
  wake?: () => void;
}

/** Initial data comes from a route loader or an accepted mutation, never an effect. */
export class JobTracker {
  private entries = new Map<string, Entry>();
  private readonly load: (id: string, signal: AbortSignal) => Promise<ProcessingJob>;
  private readonly ready: () => boolean;
  constructor(
    load: (id: string, signal: AbortSignal) => Promise<ProcessingJob>,
    ready = () => navigator.onLine && document.visibilityState !== 'hidden',
  ) {
    this.load = load;
    this.ready = ready;
  }
  seed(job: ProcessingJob) {
    let entry = this.entries.get(job.jobId);
    if (!entry) {
      entry = { snapshot: { job, error: null }, listeners: new Set(), generation: 0, delay: 2000 };
      this.entries.set(job.jobId, entry);
    } else {
      entry.snapshot = { job, error: null };
      entry.listeners.forEach((listener) => listener());
    }
    // Bound inactive navigation metadata; no PDFs/excerpts/tokens are stored here.
    for (const [key, value] of this.entries) {
      if (this.entries.size <= 100) break;
      if (!value.listeners.size && key !== job.jobId) this.entries.delete(key);
    }
    return job;
  }
  snapshot = (id: string): JobSnapshot | null => this.entries.get(id)?.snapshot ?? null;
  subscribe(id: string, listener: () => void) {
    const entry = this.entries.get(id);
    if (!entry) return () => {};
    entry.listeners.add(listener);
    if (entry.listeners.size === 1) {
      const wake = () => {
        if (this.ready() && !['COMPLETED', 'CANCELLED'].includes(entry.snapshot.job?.status ?? ''))
          void this.refresh(id);
      };
      entry.wake = wake;
      window.addEventListener('online', wake);
      window.addEventListener('focus', wake);
      document.addEventListener('visibilitychange', wake);
      this.schedule(id, entry);
    }
    return () => {
      entry.listeners.delete(listener);
      if (!entry.listeners.size) {
        clearTimeout(entry.timer);
        entry.flight?.abort();
        entry.flight = undefined;
        entry.generation++;
        this.detach(entry);
      }
    };
  }
  async refresh(id: string) {
    const entry = this.entries.get(id);
    if (!entry || entry.flight || !this.ready()) return;
    clearTimeout(entry.timer);
    const flight = new AbortController();
    entry.flight = flight;
    const generation = entry.generation;
    try {
      const job = await this.load(id, flight.signal);
      if (flight.signal.aborted || generation !== entry.generation) return;
      entry.snapshot = { job, error: null };
    } catch {
      if (flight.signal.aborted || generation !== entry.generation) return;
      // Do not continue displaying potentially inaccessible cached job data.
      entry.snapshot = { job: null, error: 'Chưa thể truy cập trạng thái. Kiểm tra phiên đăng nhập và kết nối.' };
    } finally {
      if (generation === entry.generation) {
        entry.flight = undefined;
        entry.listeners.forEach((listener) => listener());
        entry.delay = Math.min(15000, entry.delay * 2);
        this.schedule(id, entry);
      }
    }
  }
  clear() {
    for (const entry of this.entries.values()) {
      clearTimeout(entry.timer);
      entry.flight?.abort();
      entry.generation++;
      this.detach(entry);
      entry.snapshot = { job: null, error: 'Phiên làm việc đã thay đổi.' };
      entry.listeners.forEach((listener) => listener());
    }
    this.entries.clear();
  }
  private detach(entry: Entry) {
    if (!entry.wake) return;
    window.removeEventListener('online', entry.wake);
    window.removeEventListener('focus', entry.wake);
    document.removeEventListener('visibilitychange', entry.wake);
    entry.wake = undefined;
  }
  private schedule(id: string, entry: Entry) {
    clearTimeout(entry.timer);
    const job = entry.snapshot.job;
    if (!entry.listeners.size || !job || job.requiresManualRepair || ['COMPLETED', 'CANCELLED'].includes(job.status))
      return;
    entry.timer = setTimeout(
      () => {
        if (this.ready()) void this.refresh(id);
        else this.schedule(id, entry);
      },
      entry.delay + Math.floor(Math.random() * 250),
    );
  }
}
