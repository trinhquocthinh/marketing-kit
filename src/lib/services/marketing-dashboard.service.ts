import { httpService, httpServiceFiles } from '@/lib/http.service';
import {
  URL_FOLDER,
  URL_ALIAS,
  URL_ALIAS_UPLOAD,
  URL_AVATAR,
  URL_AVATAR_UPLOAD,
  URL_AVATAR_BATCH_DELETE,
  URL_PERFORMANCE,
  URL_PERFORMANCE_FOLDER,
  URL_PERFORMANCE_ALIAS,
  REPLACE_PARAMS,
} from '@/lib/constants';
import type {
  AliasCreateData,
  AliasData,
  AliasUpdateData,
  ApiResponse,
  AvatarCreateData,
  AvatarData,
  AvatarDeleteBatchRequest,
  AvatarUpdateData,
  FoldersApiResponse,
  PerformanceAliasData,
  PerformanceAliasRequest,
  PerformanceFolderData,
  PerformanceFolderRequest,
  PerformanceResponse,
  UploadAliasImageRequest,
  UploadAvatarImageRequest,
} from '@/types';

function sortTemplatesByCreatedDesc<T extends { templates?: { created: string }[] }>(data: T[]): T[] {
  if (!Array.isArray(data)) return data ?? [];
  return data.map(item => {
    if (!Array.isArray(item.templates)) return item;
    const sortedTemplates = [...item.templates].sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime(),
    );
    return { ...item, templates: sortedTemplates };
  });
}

export const marketingDashboardService = {
  // Folders
  async getFolders(): Promise<ApiResponse<FoldersApiResponse['data']>> {
    const result = await httpService.get<FoldersApiResponse>(URL_FOLDER);
    if (!result.isSuccess) {
      return { error: result.error };
    }

    let folders = sortTemplatesByCreatedDesc(result.data.data);
    const hasOrder = folders.some(item => item.order !== null);

    if (hasOrder) {
      folders = folders
        .map(item => ({ ...item, order: item.order ?? item.id }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else {
      folders = [...folders].reverse();
    }

    return { data: folders };
  },

  // Alias CRUD
  async getAlias(): Promise<ApiResponse<AliasData[]>> {
    const result = await httpService.get<ApiResponse<AliasData[]>>(URL_ALIAS);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async getAliasDetail(aliasId: number): Promise<ApiResponse<AliasData>> {
    const result = await httpService.get<ApiResponse<AliasData>>(`${URL_ALIAS}/${aliasId}`);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async createAlias(request: AliasCreateData): Promise<ApiResponse<AliasData>> {
    const result = await httpService.post<AliasCreateData, ApiResponse<AliasData>>(URL_ALIAS, request);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async updateAlias(aliasId: number, request: AliasUpdateData): Promise<ApiResponse<AliasData>> {
    const result = await httpService.post<AliasUpdateData, ApiResponse<AliasData>>(`${URL_ALIAS}/${aliasId}`, request);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async uploadAliasImage(req: UploadAliasImageRequest): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', req.file);
    formData.append('category', 'POSTER');
    formData.append('name', req.fileName ?? 'poster' + Date.now());

    const result = await httpServiceFiles.put<FormData, ApiResponse<string>>(URL_ALIAS_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  // Avatar CRUD
  async getAvatar(): Promise<ApiResponse<AvatarData[]>> {
    const result = await httpService.get<ApiResponse<AvatarData[]>>(URL_AVATAR);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async createAvatar(request: AvatarCreateData): Promise<ApiResponse<AvatarData>> {
    const result = await httpService.post<AvatarCreateData, ApiResponse<AvatarData>>(URL_AVATAR, request);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async updateAvatar(avatarId: number, request: AvatarUpdateData): Promise<ApiResponse<AvatarData>> {
    const result = await httpService.post<AvatarUpdateData, ApiResponse<AvatarData>>(`${URL_AVATAR}/${avatarId}`, request);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async uploadAvatarImage(req: UploadAvatarImageRequest): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append('file', req.file);
    formData.append('category', 'AVATAR');
    formData.append('name', req.fileName ?? 'avatar' + Date.now());

    const result = await httpServiceFiles.put<FormData, ApiResponse<string>>(URL_AVATAR_UPLOAD, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async avatarDeleteBatch(request: AvatarDeleteBatchRequest): Promise<ApiResponse<unknown>> {
    const result = await httpService.post<AvatarDeleteBatchRequest, ApiResponse<unknown>>(URL_AVATAR_BATCH_DELETE, request);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  // Performance
  async getPerformanceOverview(): Promise<ApiResponse<PerformanceResponse>> {
    const result = await httpService.get<ApiResponse<PerformanceResponse>>(URL_PERFORMANCE);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async getPerformanceFolder(request: PerformanceFolderRequest): Promise<ApiResponse<PerformanceFolderData[]>> {
    const url = URL_PERFORMANCE_FOLDER
      .replace(REPLACE_PARAMS.FOLDER_ID, String(request.folderId))
      .replace(REPLACE_PARAMS.FROM, request.from)
      .replace(REPLACE_PARAMS.TO, request.to);

    const result = await httpService.get<ApiResponse<PerformanceFolderData[]>>(url);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  async getPerformanceAlias(request: PerformanceAliasRequest): Promise<ApiResponse<PerformanceAliasData[]>> {
    const url = URL_PERFORMANCE_ALIAS
      .replace(REPLACE_PARAMS.FOLDER_ID, String(request.folderId))
      .replace(REPLACE_PARAMS.ALIAS_ID, String(request.aliasId))
      .replace(REPLACE_PARAMS.FROM, request.from)
      .replace(REPLACE_PARAMS.TO, request.to);

    const result = await httpService.get<ApiResponse<PerformanceAliasData[]>>(url);
    if (!result.isSuccess) return { error: result.error };
    return { data: result.data?.data ?? null };
  },

  // Tutorial
  saveTutorialCompleted(val: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isTutorialCompleted', String(val));
    }
  },

  isTutorialCompleted(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isTutorialCompleted') === 'true';
    }
    return false;
  },
};
