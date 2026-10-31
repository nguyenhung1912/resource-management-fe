import { afterEach, describe, expect, it, vi } from 'vitest';
import { JobTracker } from '../jobTracker';
import type { ProcessingJob } from '../../types/processing.types';

const job = { jobId: 'job', status: 'RUNNING', stage: 'EXTRACTING', attempt: 1 } as ProcessingJob;
describe('job polling lifecycle', () => {
  afterEach(() => vi.useRealTimers());
  it('deduplicates consumers and stops terminal polling', async () => {
    vi.useFakeTimers();
    const load = vi.fn().mockResolvedValue({ ...job, status: 'COMPLETED' });
    const tracker = new JobTracker(load, () => true);
    tracker.seed(job);
    const a = tracker.subscribe('job', vi.fn());
    const b = tracker.subscribe('job', vi.fn());
    expect(load).not.toHaveBeenCalled(); // initial request belongs to loader
    await vi.advanceTimersByTimeAsync(2300);
    expect(load).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60000);
    expect(load).toHaveBeenCalledTimes(1);
    a();
    b();
    window.dispatchEvent(new Event('focus'));
    expect(load).toHaveBeenCalledTimes(1);
  });
  it('aborts and ignores a late response after logout', async () => {
    let finish!: (job: ProcessingJob) => void;
    const load = vi.fn(
      () =>
        new Promise<ProcessingJob>((resolve) => {
          finish = resolve;
        }),
    );
    const tracker = new JobTracker(load, () => true);
    tracker.seed(job);
    const request = tracker.refresh('job');
    tracker.clear();
    finish(job);
    await request;
    expect(tracker.snapshot('job')).toBeNull();
  });
  it('does not poll offline or auto-retry exhausted jobs', async () => {
    vi.useFakeTimers();
    const load = vi.fn();
    const tracker = new JobTracker(load, () => false);
    tracker.seed(job);
    const stop = tracker.subscribe('job', vi.fn());
    await vi.advanceTimersByTimeAsync(20000);
    expect(load).not.toHaveBeenCalled();
    stop();
    const manual = new JobTracker(load, () => true);
    manual.seed({ ...job, requiresManualRepair: true });
    const end = manual.subscribe('job', vi.fn());
    await vi.advanceTimersByTimeAsync(20000);
    expect(load).not.toHaveBeenCalled();
    end();
  });
});
