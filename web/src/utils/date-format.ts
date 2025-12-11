import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DatePrecision } from 'shared';

dayjs.extend(relativeTime);

const currentDate = dayjs();
const currentYear = currentDate.format('YYYY');
const currentMonth = currentDate.format('MMM');
const currentDay = currentDate.format('D');

export const formatRelativeTimeShort = (date: string) => {
  return dayjs(date)
    .locale({
      name: 'test',
      formats: {
        L: 'L',
        LL: 'LL',
        LLL: 'LLL',
        LLLL: 'LLLL',
        LT: 'LT',
        LTS: 'LTS',
      },
      relativeTime: {
        future: 'in %s',
        past: '%s',
        s: '1s',
        m: '1m',
        mm: '%dm',
        h: '1h',
        hh: '%dh',
        d: '1d',
        dd: '%dd',
        M: '1M',
        MM: '%dM',
        y: '1Y',
        yy: '%dY',
      },
    })
    .fromNow();
};

export const formatRelativeTime = (date: string) => {
  return dayjs(date).fromNow();
};

export const formatDateTime = (date: string) => {
  const parsedDate = dayjs(date);
  const year = parsedDate.format('YYYY');
  const month = parsedDate.format('MMM');
  const day = parsedDate.format('D');

  if (currentYear === year && currentMonth === month && currentDay === day) {
    return `Today · ${parsedDate.format('h:mm A')}`;
  }

  if (currentYear === year) {
    return parsedDate.format('MMM D · h:mm A');
  }

  return parsedDate.format('MMM D, YYYY · h:mm A');
};

export const formatDate = (date: string) => {
  const parsedDate = dayjs(date);
  const year = parsedDate.format('YYYY');
  const month = parsedDate.format('MMM');
  const day = parsedDate.format('D');

  if (currentYear === year && currentMonth === month && currentDay === day) {
    return 'Today';
  }

  if (currentYear === year) {
    return parsedDate.format('MMM D');
  }

  return parsedDate.format('MMM D, YYYY');
};

export const formatReleaseDate = (date: string, precision: DatePrecision) => {
  if (precision === DatePrecision.DAY) {
    return dayjs(date).format('MMM D, YYYY');
  } else if (precision === DatePrecision.MONTH) {
    return dayjs(date).format('MMM YYYY');
  } else {
    return dayjs(date).format('YYYY');
  }
};

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

export const getYearFromDate = (date: string) => {
  return dayjs(date).year();
};
