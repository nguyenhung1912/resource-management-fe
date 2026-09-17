import { profileService } from '@/services/profileService';

export async function profileLoader() {
  return profileService.getMyProfile();
}
