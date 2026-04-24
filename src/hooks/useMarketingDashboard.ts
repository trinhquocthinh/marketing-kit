'use client';

import { useCallback } from 'react';

import { marketingDashboardService } from '@/lib/services/marketing-dashboard.service';
import { useDashboardStore } from '@/stores/useDashboardStore';
import type {
  AliasCreateData,
  AliasData,
  AliasUpdateData,
  ApiResponse,
  AvatarCreateData,
  AvatarDeleteBatchRequest,
  AvatarUpdateData,
  PerformanceAliasRequest,
  PerformanceFolderRequest,
  UploadAliasImageRequest,
  UploadAvatarImageRequest,
} from '@/types';

export function useMarketingDashboard() {
  // Tách selector để tránh re-render thừa — mỗi field 1 subscription
  const isLoading = useDashboardStore((s) => s.isLoading);
  const stage = useDashboardStore((s) => s.stage);
  const folders = useDashboardStore((s) => s.folders);
  const myImages = useDashboardStore((s) => s.myImages);
  const performances = useDashboardStore((s) => s.performances);

  // Actions từ zustand reference stable → lấy trực tiếp (không cần useCallback wrap)
  const setLoading = useDashboardStore((s) => s.setLoading);
  const setStage = useDashboardStore((s) => s.setStage);
  const setFolders = useDashboardStore((s) => s.setFolders);
  const setPerformances = useDashboardStore((s) => s.setPerformances);
  const resetState = useDashboardStore((s) => s.resetState);

  const getFolders = useCallback(async () => {
    setLoading(true);
    const result = await marketingDashboardService.getFolders();
    if (result.data) setFolders(result.data);
    setLoading(false);
    return result;
  }, [setFolders, setLoading]);

  const getAlias = useCallback(async (): Promise<ApiResponse<AliasData[]>> => {
    return marketingDashboardService.getAlias();
  }, []);

  const getAliasDetail = useCallback(async (aliasId: number): Promise<ApiResponse<AliasData>> => {
    return marketingDashboardService.getAliasDetail(aliasId);
  }, []);

  const createAlias = useCallback(
    async (data: AliasCreateData): Promise<ApiResponse<AliasData>> => {
      return marketingDashboardService.createAlias(data);
    },
    [],
  );

  const updateAlias = useCallback(
    async (aliasId: number, data: AliasUpdateData): Promise<ApiResponse<AliasData>> => {
      return marketingDashboardService.updateAlias(aliasId, data);
    },
    [],
  );

  const uploadAliasImage = useCallback(
    async (data: UploadAliasImageRequest): Promise<ApiResponse<string>> => {
      return marketingDashboardService.uploadAliasImage(data);
    },
    [],
  );

  const getAvatar = useCallback(async () => {
    return marketingDashboardService.getAvatar();
  }, []);

  const createAvatar = useCallback(async (data: AvatarCreateData) => {
    return marketingDashboardService.createAvatar(data);
  }, []);

  const updateAvatar = useCallback(async (avatarId: number, data: AvatarUpdateData) => {
    return marketingDashboardService.updateAvatar(avatarId, data);
  }, []);

  const avatarDeleteBatch = useCallback(async (data: AvatarDeleteBatchRequest) => {
    return marketingDashboardService.avatarDeleteBatch(data);
  }, []);

  const uploadAvatarImage = useCallback(async (data: UploadAvatarImageRequest) => {
    return marketingDashboardService.uploadAvatarImage(data);
  }, []);

  const getPerformanceOverview = useCallback(async () => {
    setLoading(true);
    const result = await marketingDashboardService.getPerformanceOverview();
    if (result.data?.folders) setPerformances(result.data.folders);
    setLoading(false);
    return result;
  }, [setLoading, setPerformances]);

  const getPerformanceFolder = useCallback(async (request: PerformanceFolderRequest) => {
    return marketingDashboardService.getPerformanceFolder(request);
  }, []);

  const getPerformanceAlias = useCallback(async (request: PerformanceAliasRequest) => {
    return marketingDashboardService.getPerformanceAlias(request);
  }, []);

  const saveTutorialCompleted = useCallback((val: boolean) => {
    marketingDashboardService.saveTutorialCompleted(val);
  }, []);

  return {
    // State
    isLoading,
    stage,
    folders,
    myImages,
    performances,

    // Actions
    setLoading,
    setStage,
    resetState,

    // API
    getFolders,
    getAlias,
    getAliasDetail,
    createAlias,
    updateAlias,
    uploadAliasImage,
    getAvatar,
    createAvatar,
    updateAvatar,
    avatarDeleteBatch,
    uploadAvatarImage,
    getPerformanceOverview,
    getPerformanceFolder,
    getPerformanceAlias,
    saveTutorialCompleted,
  };
}
