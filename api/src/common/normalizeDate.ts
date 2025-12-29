import dayjs from 'dayjs';
import { DatePrecision } from 'shared';
export function normalizeDate(input: string) {
  if (/^\d{4}$/.test(input)) {
    return {
      date: dayjs(input).format('YYYY'),
      fullDate: dayjs(input).endOf('year').format('YYYY-MM-DD'),
      precision: DatePrecision.YEAR,
    };
  } else if (/^\d{4}-\d{2}$/.test(input)) {
    return {
      date: dayjs(input).format('YYYY-MM'),
      fullDate: dayjs(input).endOf('month').format('YYYY-MM-DD'),
      precision: DatePrecision.MONTH,
    };
  } else {
    return {
      date: dayjs(input).format('YYYY-MM-DD'),
      fullDate: dayjs(input).format('YYYY-MM-DD'),
      precision: DatePrecision.DAY,
    };
  }
}

// doublicate web/src/utils/date-format.ts
export const formatReleaseDateInput = (
  date: string,
  precision: DatePrecision,
) => {
  if (precision === DatePrecision.DAY) {
    return dayjs(date).format('YYYY-MM-DD');
  } else if (precision === DatePrecision.MONTH) {
    return dayjs(date).format('YYYY-MM');
  } else {
    return dayjs(date).format('YYYY');
  }
};
