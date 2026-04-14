import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TabEnum } from '@/types/enums';
import { MARKETING_DASHBOARD_STATE_NAME } from '@/lib/constants';
import type { FolderModel, MarketingDashboardState, MyImageModel, PerformanceModel } from '@/types';

const initialState: MarketingDashboardState = {
  isLoading: false,
  stage: TabEnum.Libraries,
  folders: [],
  myImages: [],
  performances: [],
};

export const marketingDashboardSlice = createSlice({
  name: MARKETING_DASHBOARD_STATE_NAME,
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setStage: (state, action: PayloadAction<string>) => {
      state.stage = action.payload;
    },
    setFolders: (state, action: PayloadAction<FolderModel[]>) => {
      state.folders = action.payload;
    },
    setMyImages: (state, action: PayloadAction<MyImageModel[]>) => {
      state.myImages = action.payload;
    },
    setPerformances: (state, action: PayloadAction<PerformanceModel[]>) => {
      state.performances = action.payload;
    },
    resetState: (state) => {
      return { ...initialState, stage: state.stage };
    },
  },
});

export const marketingDashboardActions = marketingDashboardSlice.actions;
export const marketingDashboardReducer = marketingDashboardSlice.reducer;
