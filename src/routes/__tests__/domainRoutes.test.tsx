import { matchRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { APP_PATHS, ROUTE_PARAMS } from '@/constants/path';
import { appealRoutes, moderationRoutes, notificationRoutes, resourceRoutes } from '@/routes/domains';

describe('domain routes and dynamic path builders', () => {
  describe('APP_PATHS dynamic builders', () => {
    it('builds appeal detail path with ID', () => {
      expect(APP_PATHS.APPEAL_DETAIL('appeal-123')).toBe('/appeals/appeal-123');
      expect(APP_PATHS.APPEAL_DETAIL(456)).toBe('/appeals/456');
    });

    it('builds resource detail path with ID', () => {
      expect(APP_PATHS.RESOURCE_DETAIL('res-99')).toBe('/dashboard/resources-manager/res-99');
      expect(APP_PATHS.RESOURCE_DETAIL(100)).toBe('/dashboard/resources-manager/100');
    });

    it('builds moderation detail path with ID', () => {
      expect(APP_PATHS.MODERATION_DETAIL('FIL_123')).toBe('/dashboard/moderation/FIL_123');
      expect(APP_PATHS.MODERATION_DETAIL(456)).toBe('/dashboard/moderation/456');
    });

    it('builds login path with encoded redirect query', () => {
      expect(APP_PATHS.LOGIN_WITH_REDIRECT('/dashboard/resources-manager?filter=draft')).toBe(
        '/login?redirect=%2Fdashboard%2Fresources-manager%3Ffilter%3Ddraft',
      );
    });

    it('exposes route param constants', () => {
      expect(ROUTE_PARAMS.RESOURCE_ID).toBe(':resourceId');
      expect(ROUTE_PARAMS.APPEAL_ID).toBe(':appealId');
      expect(ROUTE_PARAMS.FILE_ID).toBe(':fileId');
    });
  });

  describe('modular domain route definitions', () => {
    it('notificationRoutes matches notifications segment', () => {
      const match = matchRoutes(notificationRoutes, '/notifications');
      expect(match).not.toBeNull();
      expect(match?.[0].route.path).toBe('notifications');
    });

    it('appealRoutes matches appeals index and assigned', () => {
      expect(matchRoutes(appealRoutes, '/appeals')).not.toBeNull();
      expect(matchRoutes(appealRoutes, '/appeals/assigned')).not.toBeNull();
    });

    it('resourceRoutes matches resources-manager and upload', () => {
      expect(matchRoutes(resourceRoutes, '/resources-manager')).not.toBeNull();
      expect(matchRoutes(resourceRoutes, '/resources-manager/upload')).not.toBeNull();
    });

    it('moderationRoutes matches moderation detail route', () => {
      expect(matchRoutes(moderationRoutes, '/moderation/FIL_123')).not.toBeNull();
    });
  });
});
