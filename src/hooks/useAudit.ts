'use client';

import { useQuery } from '@tanstack/react-query';
import api, { unwrap } from '@/lib/api';
import type { AuditPage } from '@/types';

export interface AuditFilters {
  resource?: string;
  action?: string;
  actorId?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** Server-paged: the trail grows without bound, so never fetch it all. */
export function useAuditLog(filters: AuditFilters = {}) {
  return useQuery({
    queryKey: ['audit', filters],
    queryFn: async () =>
      unwrap<AuditPage>(
        await api.get('/audit', {
          params: {
            resource: filters.resource || undefined,
            action: filters.action || undefined,
            actorId: filters.actorId || undefined,
            from: filters.from || undefined,
            to: filters.to || undefined,
            page: filters.page ?? 1,
            limit: filters.limit ?? 50,
          },
        }),
      ),
  });
}
