import { processingService } from '@/services/processingService';
import { useAuthStore } from '@/store/authStore';
import { JobTracker } from './jobTracker';

export const processingTracker = new JobTracker((id, signal) => processingService.getJob(id, signal));
useAuthStore.subscribe((state, previous) => {
  if (state.token !== previous.token || state.user?.uid !== previous.user?.uid) processingTracker.clear();
});
