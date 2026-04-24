import { I18n } from '@/i18n';
import { SortEnum, StatusEnum, TabEnum, TimeLineEnum, TypeEnum } from '@/types/enums';
import {
  type ListTutorialModel,
  type PerformanceAliasData,
  type PerformanceFolderData,
} from '@/types/marketing-dashboard';

export const MAX_CHARACTER_SHOW_ANIMATION = 12;
export const NUMBER_OF_XAXIS_TICKS = 6;

export const TABS_DATA: string[] = [TabEnum.Libraries, TabEnum.MyImages, TabEnum.Performance];

export const LIST_FILTER = [
  { id: StatusEnum.ALL, title: I18n.all, isSelected: true },
  { id: StatusEnum.SALE, title: I18n.marketingDashboard.boostSales, isSelected: false },
  { id: StatusEnum.RECRUIT, title: I18n.marketingDashboard.teamDevelopment, isSelected: false },
];

export const LIST_SORT = [
  { id: SortEnum.Default, title: I18n.default, isSelected: true },
  { id: SortEnum.Newest, title: I18n.sortNewest, isSelected: false },
  { id: SortEnum.Oldest, title: I18n.sortOldest, isSelected: false },
];

export const LIST_ALIAS_SORT = [
  { id: SortEnum.Newest, title: I18n.sortNewest, isSelected: true },
  { id: SortEnum.Oldest, title: I18n.sortOldest, isSelected: false },
  { id: SortEnum.FromAToZ, title: I18n.sortFromAToZ, isSelected: false },
  { id: SortEnum.FromZToA, title: I18n.sortFromZToA, isSelected: false },
];

export const LIST_PERFORMANCE_SORT = [
  {
    id: SortEnum.MostInteractions,
    title: I18n.marketingDashboard.mostInteractions,
    isSelected: true,
  },
  { id: SortEnum.MostFee, title: I18n.marketingDashboard.mostFee, isSelected: false },
  { id: SortEnum.MostESign, title: I18n.marketingDashboard.mostESign, isSelected: false },
  { id: SortEnum.FromAToZ, title: I18n.sortFromAToZ, isSelected: false },
  { id: SortEnum.FromZToA, title: I18n.sortFromZToA, isSelected: false },
];

export const PERFORMANCE_DETAIL_DEFAULT: PerformanceFolderData = {
  name: '',
  type: TypeEnum.SALE,
  bucket: '',
  data: [],
  aliases: [],
};

export const PERFORMANCE_DETAIL_DEFAULT_ALIAS: PerformanceAliasData = {
  id: 0,
  type: TypeEnum.SALE,
  name: '',
  imageLink: '',
  count: 0,
  sum: 0,
  bucket: '',
  data: [],
  template: { name: '' },
};

export const TABS_TIME = [
  { name: I18n.marketingDashboard.oneMonth, value: TimeLineEnum.ONE_MONTH },
  { name: I18n.marketingDashboard.oneQuarter, value: TimeLineEnum.ONE_QUARTER },
  { name: I18n.marketingDashboard.oneYear, value: TimeLineEnum.ONE_YEAR },
];

export const LIST_TUTORIALS: ListTutorialModel[] = [
  {
    image: '/images/tutorial/tutorial-1.png',
    title: I18n.marketingDashboard.tutorialTitle,
    desc: I18n.marketingDashboard.tutorialDesc,
  },
  {
    image: '/images/tutorial/tutorial-2.png',
    title: I18n.marketingDashboard.tutorialTitle1,
    desc: I18n.marketingDashboard.tutorialDesc1,
  },
  {
    image: '/images/tutorial/tutorial-3.png',
    title: I18n.marketingDashboard.tutorialTitle2,
    desc: I18n.marketingDashboard.tutorialDesc2,
  },
  {
    image: '/images/tutorial/tutorial-4.png',
    title: I18n.marketingDashboard.tutorialTitle3,
    desc: I18n.marketingDashboard.tutorialDesc3,
  },
  {
    image: '/images/tutorial/tutorial-5.png',
    title: I18n.marketingDashboard.tutorialTitle4,
    desc: I18n.marketingDashboard.tutorialDesc4,
  },
  {
    image: '/images/tutorial/tutorial-6.png',
    title: I18n.marketingDashboard.tutorialTitle5,
    desc: I18n.marketingDashboard.tutorialDesc5,
  },
  {
    image: '/images/tutorial/tutorial-7.png',
    title: I18n.marketingDashboard.completeTutorialTitle,
    desc: I18n.marketingDashboard.completeTutorialDesc,
  },
];

// API URL constants
export const URL_API = '/mkk/agent';
export const URL_FOLDER = `${URL_API}/folders`;
export const URL_ALIAS = `${URL_API}/template/alias`;
export const URL_ALIAS_UPLOAD = `${URL_API}/template/alias/upload`;
export const URL_AVATAR = `${URL_API}/avatar`;
export const URL_AVATAR_UPLOAD = `${URL_API}/avatar/upload`;
export const URL_AVATAR_BATCH_DELETE = `${URL_API}/avatar/batch-delete`;

export const REPLACE_PARAMS = {
  FOLDER_ID: '%FOLDER_ID%',
  ALIAS_ID: '%ALIAS_ID%',
  FROM: '%FROM%',
  TO: '%TO%',
};

export const URL_PERFORMANCE = `${URL_API}/performance/overview`;
export const URL_PERFORMANCE_FOLDER = `${URL_API}/performance/folder/${REPLACE_PARAMS.FOLDER_ID}?bucket=BY_DAY&from=${REPLACE_PARAMS.FROM}&to=${REPLACE_PARAMS.TO}`;
export const URL_PERFORMANCE_ALIAS = `${URL_API}/performance/folder/${REPLACE_PARAMS.FOLDER_ID}/${REPLACE_PARAMS.ALIAS_ID}?bucket=BY_DAY&from=${REPLACE_PARAMS.FROM}&to=${REPLACE_PARAMS.TO}`;

export const MARKETING_DASHBOARD_STATE_NAME = 'marketing-dashboard';
