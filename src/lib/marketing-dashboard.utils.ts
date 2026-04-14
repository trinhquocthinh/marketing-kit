import { format } from 'date-fns';
import { MARKETING_DASHBOARD_URL } from '@/lib/api.config';
import { NUMBER_OF_XAXIS_TICKS } from '@/lib/constants';
import {
  LabelEnum,
  TimeLineEnum,
  TypeEnum,
  AvatarStatusOption,
  AvatarActionOption,
} from '@/types/enums';
import type {
  AliasData,
  AvatarData,
  AvatarFrameOption,
  ChartComponentProps,
  ChartData,
  FolderModel,
  GroupTemplateModel,
  PeriodDate,
  Periods,
} from '@/types';

export const listTopUsed = (data: FolderModel[]): GroupTemplateModel[] =>
  data
    .flatMap(
      (folder) =>
        folder.templates?.filter(
          (template) =>
            Array.isArray(template.labels) &&
            template.labels?.some((lab) => lab.type === LabelEnum.TOPUSED),
        ) || [],
    )
    .sort(
      (a, b) =>
        new Date(b.priorityAt || b.created).getTime() -
        new Date(a.priorityAt || a.created).getTime(),
    );

export const getLastExpiredDate = (data: FolderModel): Date | null => {
  const expiredDates = data.templates
    ?.map((template) => template.validTo)
    .filter((date): date is string => date !== null && date !== undefined)
    .map((date) => new Date(date));

  return expiredDates && expiredDates.length > 0
    ? new Date(Math.max(...expiredDates.map((date) => date.getTime())))
    : null;
};

export const normalizeVietnamese = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
};

export const generateMktLink = (alias: AliasData): string => {
  const type = alias.type === TypeEnum.RECRUIT ? 'recruit/download' : 'sales';
  return `${MARKETING_DASHBOARD_URL}/${type}/${alias.qrEncryptedData}`;
};

export const generateUniqueAliasName = (
  text: string,
  aliasList: AliasData[],
  templateName: string,
): string | null => {
  const baseName = text.trim();
  let candidateName = baseName;
  let counter = 1;

  if (text.trim() === templateName.trim()) {
    while (aliasList.some((alias) => alias.name === candidateName)) {
      candidateName = `${baseName} (${counter++})`;
    }
    return candidateName;
  } else {
    return aliasList.some((alias) => alias.name.trim() === text.trim())
      ? null
      : text.trim();
  }
};

export const mapAvatarResponseToOptions = (
  avatarData: AvatarData[],
): AvatarFrameOption[] => {
  if (!avatarData || !Array.isArray(avatarData)) return [];

  return avatarData
    .filter((a) => !(a.approved === false && a.actionAt !== null))
    .map((item): AvatarFrameOption => {
      let avatarStatusOption: AvatarStatusOption | undefined;

      if (item.approved === false && item.actionAt === null) {
        avatarStatusOption = AvatarStatusOption.Waiting;
      } else if (item.approved === true && item.actionAt !== null) {
        avatarStatusOption = AvatarStatusOption.Reviewed;
      }

      return {
        ...item,
        isSelected: item.isDefault,
        avatarActionOption: AvatarActionOption.Display,
        avatarStatusOption,
      };
    });
};

export const isExpiredDate = (expiredDate: string | null): boolean => {
  if (!expiredDate) return false;
  const targetDate = new Date(expiredDate);
  const currentDate = new Date();
  return targetDate < currentDate;
};

export const getTimeLine = (val: TimeLineEnum): Periods => {
  const currentDate = new Date();

  switch (val) {
    case TimeLineEnum.ONE_MONTH: {
      const fromDate = new Date(currentDate);
      fromDate.setUTCDate(currentDate.getUTCDate() - 30);
      fromDate.setUTCHours(17, 0, 0, 0);
      const toDate = new Date(currentDate);
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }
    case TimeLineEnum.ONE_QUARTER: {
      const currentDay = currentDate.getDay();
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay;
      const startOfCurrentWeek = new Date(currentDate);
      startOfCurrentWeek.setDate(currentDate.getDate() - daysSinceMonday);

      const fromDate = new Date(startOfCurrentWeek);
      fromDate.setUTCHours(17, 0, 0, 0);
      fromDate.setDate(fromDate.getDate() - 11 * 7);
      const toDate = new Date(currentDate);
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }
    case TimeLineEnum.ONE_YEAR: {
      const startOfCurrentMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      const fromDate = new Date(startOfCurrentMonth);
      fromDate.setMonth(fromDate.getMonth() - 11);
      fromDate.setUTCHours(17, 0, 0, 0);
      const toDate = new Date(currentDate);
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }
    default: {
      const fromDate = new Date();
      fromDate.setDate(currentDate.getDate() - 30);
      fromDate.setUTCHours(0, 0, 0, 0);
      const toDate = new Date(currentDate);
      toDate.setUTCHours(0, 0, 0, 0);
      toDate.setUTCHours(toDate.getUTCHours() + 7);
      fromDate.setUTCHours(fromDate.getUTCHours() + 7);
      return { from: fromDate.toISOString(), to: toDate.toISOString() };
    }
  }
};

export const getYaxisMaxValue = (rawMaxValue: number): number => {
  if (rawMaxValue > 0 && rawMaxValue <= 20) return 20;
  if (rawMaxValue > 20 && rawMaxValue <= 50) return 50;
  if (rawMaxValue > 50 && rawMaxValue <= 100) return 100;
  if (rawMaxValue > 100 && rawMaxValue <= 500) return 500;
  if (rawMaxValue > 500 && rawMaxValue <= 1000) return 1000;
  if (rawMaxValue > 1000 && rawMaxValue <= 10000) return 10000;
  return 20;
};

export const formatDateToString = (date: Date, fmt: string): string => {
  return format(date, fmt);
};

export const cookChartData = (props: ChartComponentProps) => {
  const { alias, timeLine, timeRange } = props;

  const totals = {
    totalClicked: 0,
    totalAllocate: 0,
    totalSubmited: 0,
    totalPaid: 0,
    totalRegister: 0,
    totalEsign: 0,
  };

  alias.data.forEach((record) => {
    const { bucketData } = record;
    if (alias.type === TypeEnum.SALE) {
      totals.totalClicked += bucketData?.CLICKED || 0;
      totals.totalAllocate += bucketData?.LEAD_ALLOCATED || 0;
      totals.totalSubmited += bucketData?.LEAD_SUBMITTED || 0;
      totals.totalPaid += bucketData?.LEAD_PAID || 0;
    } else if (alias.type === TypeEnum.RECRUIT) {
      totals.totalClicked += bucketData?.CLICKED || 0;
      totals.totalRegister += bucketData?.AGENT_CREATED || 0;
      totals.totalEsign += bucketData?.AGENT_ESIGNED || 0;
    }
  });

  const tickDataRange: PeriodDate[] = [];
  const fromDate = new Date(timeRange?.from || new Date());

  const addTicks = (step: number, isMonthStep = false) => {
    for (let i = 0; i < NUMBER_OF_XAXIS_TICKS; i++) {
      const tickFrom = new Date(fromDate);
      const tickTo = new Date(fromDate);
      if (isMonthStep) {
        tickFrom.setMonth(tickFrom.getMonth() + i * step);
        tickTo.setMonth(tickTo.getMonth() + (i + 1) * step);
      } else {
        tickFrom.setDate(tickFrom.getDate() + i * step);
        tickTo.setDate(tickTo.getDate() + (i + 1) * step);
      }
      tickTo.setMilliseconds(tickTo.getMilliseconds() - 1);
      tickDataRange.push({ from: tickFrom, to: tickTo });
    }
  };

  if (timeLine === TimeLineEnum.ONE_MONTH) {
    addTicks(5);
  } else if (timeLine === TimeLineEnum.ONE_QUARTER) {
    addTicks(14);
  } else if (timeLine === TimeLineEnum.ONE_YEAR) {
    addTicks(2, true);
  }

  const chartData: ChartData[] = tickDataRange.map(({ from, to }) => {
    let value = 0;
    alias.data.forEach((record) => {
      const periodDate = new Date(`${record.period} 00:00:00`);
      if (periodDate >= from && periodDate <= to) {
        value +=
          (alias.type === TypeEnum.SALE
            ? record.bucketData.LEAD_PAID
            : record.bucketData.AGENT_ESIGNED) || 0;
      }
    });

    return {
      date: formatDateToString(
        from,
        timeLine === TimeLineEnum.ONE_YEAR ? 'MM/yy' : 'dd/MM',
      ),
      value,
    };
  });

  return { ...totals, chartData };
};

export const toSnakeCaseFileName = (input: string): string => {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
};
