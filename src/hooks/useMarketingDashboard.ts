'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './useStore';
import { marketingDashboardActions } from '@/lib/slices/marketing-dashboard.slice';
import { marketingDashboardService } from '@/lib/services/marketing-dashboard.service';
import type {
  AliasCreateData,
  AliasData,
  AliasUpdateData,
  ApiResponse,
  AvatarCreateData,
  AvatarDeleteBatchRequest,
  AvatarUpdateData,
  FolderModel,
  MyImageModel,
  PerformanceAliasRequest,
  PerformanceFolderRequest,
  PerformanceModel,
  UploadAliasImageRequest,
  UploadAvatarImageRequest,
} from '@/types';

export function useMarketingDashboard() {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector((state) => state['marketing-dashboard'].isLoading);
  const stage = useAppSelector((state) => state['marketing-dashboard'].stage);
  const folders: FolderModel[] = useAppSelector((state) => state['marketing-dashboard'].folders);
  const myImages: MyImageModel[] = useAppSelector((state) => state['marketing-dashboard'].myImages);
  const performances: PerformanceModel[] = useAppSelector((state) => state['marketing-dashboard'].performances);

  const setLoading = useCallback((val: boolean) => {
    dispatch(marketingDashboardActions.setLoading(val));
  }, [dispatch]);

  const setStage = useCallback((val: string) => {
    dispatch(marketingDashboardActions.setStage(val));
  }, [dispatch]);

  const resetState = useCallback(() => {
    dispatch(marketingDashboardActions.resetState());
  }, [dispatch]);

  const getFolders = useCallback(async () => {
    setLoading(true);
    const result = await marketingDashboardService.getFolders();
    if (result.data) {
      dispatch(marketingDashboardActions.setFolders(result.data));
    }
    setLoading(false);
    return result;
  }, [dispatch, setLoading]);

  const getAlias = useCallback(async (): Promise<ApiResponse<AliasData[]>> => {
    return marketingDashboardService.getAlias();
  }, []);

  const getAliasDetail = useCallback(async (aliasId: number): Promise<ApiResponse<AliasData>> => {
    return marketingDashboardService.getAliasDetail(aliasId);
  }, []);

  const createAlias = useCallback(async (data: AliasCreateData): Promise<ApiResponse<AliasData>> => {
    return marketingDashboardService.createAlias(data);
  }, []);

  const updateAlias = useCallback(async (aliasId: number, data: AliasUpdateData): Promise<ApiResponse<AliasData>> => {
    return marketingDashboardService.updateAlias(aliasId, data);
  }, []);

  const uploadAliasImage = useCallback(async (data: UploadAliasImageRequest): Promise<ApiResponse<string>> => {
    return marketingDashboardService.uploadAliasImage(data);
  }, []);

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
    if (result.data?.folders) {
      dispatch(marketingDashboardActions.setPerformances(result.data.folders));
    }
    setLoading(false);
    return result;
  }, [dispatch, setLoading]);

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
