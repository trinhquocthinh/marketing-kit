import {
  type AvatarActionOption,
  type AvatarStatusOption,
  type LabelEnum,
  type StatusEnum,
  type TypeEnum,
} from './enums';

// #region Internal interfaces
export interface GroupModel {
  id: number;
  name: string;
}

export interface LabelModel {
  type: LabelEnum;
  value: string;
}

export interface ErrorModel {
  message: string;
  reason: string;
}

export interface ErrorResponseModel {
  code: number;
  errors: ErrorModel[];
  message: string;
}

// #region Object models
export interface ImageMeta {
  footerColor?: string;
  characterColor?: string;
}

export interface GroupTemplateModel {
  id: number;
  name: string;
  created: string;
  modified: string;
  imageLink: string;
  editable?: boolean;
  validFrom?: string;
  validTo?: string;
  folders?: null;
  priorityAt?: string;
  labels: LabelModel[];
  imageMeta?: ImageMeta;
}

export interface FolderModel {
  created: string;
  groups: GroupModel[];
  id: number;
  labels: LabelModel[];
  modified: string;
  name: string;
  templates: GroupTemplateModel[];
  type: StatusEnum | TypeEnum;
  order: number | null;
}

export type MyImageModel = object;

export interface PerformanceFolderData {
  name: string;
  type: TypeEnum;
  bucket: string;
  data: PerformanceBucketData[];
  aliases: PerformanceAliasInFolder[];
}

export interface PerformanceAliasData {
  id: number;
  type: TypeEnum;
  name: string;
  imageLink: string;
  count: number;
  sum: number;
  bucket: string;
  data: PerformanceBucketData[];
  template?: {
    name: string;
  };
}

export interface PerformanceFolderRequest {
  folderId: number;
  from: string;
  to: string;
}

export interface PerformanceAliasRequest {
  folderId: number;
  aliasId: number;
  from: string;
  to: string;
}

export interface BucketData {
  CLICKED: number;
  AGENT_CREATED?: number;
  AGENT_ESIGNED?: number;
  LEAD_ALLOCATED?: number;
  LEAD_SUBMITTED?: number;
  LEAD_PAID?: number;
}

export interface PerformanceBucketData {
  period: string;
  bucketData: BucketData;
}

export interface PerformanceAliasInFolder {
  id: number;
  type: TypeEnum | StatusEnum;
  name: string;
  imageLink: string;
  count: number;
  sum: number;
  bucket: null;
  data: unknown;
}

export interface PerformanceModel {
  count: number;
  id: number;
  name: string;
  sum: number;
  imageLink?: string;
  type: StatusEnum | TypeEnum;
}

// #region API model request
export interface ImageData {
  name: string;
  phone: string;
}

export interface AliasCreateData {
  folderId: number;
  imageData: ImageData;
  imageLink: string;
  labels: LabelModel[] | null;
  name: string;
  templateId: number;
  imageMeta: ImageMeta | null;
}

export interface AliasUpdateData {
  consent: boolean;
  imageData: ImageData;
  imageLink: string;
  labels: LabelModel[] | null;
  imageMeta: ImageMeta | null;
}

export interface AliasData {
  consent: boolean;
  created: string;
  priorityAt: string | null;
  folderId: number;
  id: number;
  imageData: ImageData;
  imageLink: string;
  labels: LabelModel[] | null;
  modified: string;
  name: string;
  qrEncryptedData: string | null;
  templateId: number;
  type: 'SALE' | 'RECRUIT';
  validFrom: string;
  validTo: string;
  imageMeta: ImageMeta | null;
  disable: boolean;
}

export interface UploadAliasImageRequest {
  file: File;
  fileName?: string;
}

export interface AvatarData {
  agentCode: string;
  approved: boolean;
  created: string;
  id: number;
  imageLink: string;
  imageMeta: ImageMeta | null;
  isDefault: boolean;
  modified: string;
  actionAt: string | null;
}

export interface AvatarCreateData {
  imageLink: string;
  imageMeta: ImageMeta | null;
  isApproved: boolean;
}

export interface AvatarUpdateData {
  imageLink: string;
  imageMeta: ImageMeta | null;
  isDefault: boolean;
  isApproved: boolean;
}

export interface UploadAvatarImageRequest {
  file: File;
  fileName?: string;
}

export interface AvatarDeleteBatchRequest {
  ids: number[];
}

export interface PerformanceResponse {
  folders: PerformanceModel[];
}

// #region API response wrapper
export interface ApiResponse<T> {
  id?: string;
  data?: T | null;
  error?: unknown;
}

export interface FoldersApiResponse {
  data: FolderModel[];
  error: ErrorResponseModel;
  id: string;
}

// #region Avatar frame option (UI)
export interface AvatarFrameOption extends AvatarData {
  isSelected: boolean;
  avatarActionOption: AvatarActionOption;
  avatarStatusOption?: AvatarStatusOption;
}

// #region Chart data
export interface PeriodDate {
  from: Date;
  to: Date;
}

export interface Periods {
  from: string;
  to: string;
}

export interface ChartData {
  date: string;
  value: number;
}

export interface ChartComponentProps {
  alias: PerformanceFolderData | PerformanceAliasData;
  timeLine: string;
  timeRange?: Periods;
}

// #region Tutorial
export interface ListTutorialModel {
  image: string;
  title: string;
  desc: string;
}

// #region Marketing Dashboard State
export interface MarketingDashboardState {
  isLoading: boolean;
  stage: string;
  folders: FolderModel[];
  myImages: MyImageModel[];
  performances: PerformanceModel[];
}
