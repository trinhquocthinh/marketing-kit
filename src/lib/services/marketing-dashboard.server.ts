import 'server-only';

import { URL_FOLDER, URL_PERFORMANCE } from '@/lib/constants';
import { CacheTags, serverGet } from '@/lib/http.server';
import type { ApiResponse, FoldersApiResponse, PerformanceResponse } from '@/types';

/**
 * Server-side data fetching cho RSC.
 *
 * - `folders` cache 60s + tag → có thể `revalidateTag('folders')` sau mutation.
 * - `performance` luôn fresh (mutation-heavy) — chỉ cần tag để purge khi cần.
 */
export const marketingDashboardServerService = {
  async getFolders(): Promise<ApiResponse<FoldersApiResponse['data']>> {
    const result = await serverGet<FoldersApiResponse>(URL_FOLDER, {
      revalidate: 60,
      tags: [CacheTags.folders],
    });
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data.data };
  },

  async getPerformanceOverview(): Promise<ApiResponse<PerformanceResponse>> {
    const result = await serverGet<PerformanceResponse>(URL_PERFORMANCE, {
      revalidate: 0,
      tags: [CacheTags.performance],
    });
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data };
  },
};
