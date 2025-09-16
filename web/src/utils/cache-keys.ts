import { FindReleasesType, FindUsersType } from 'shared';

// ENTRY
const entryKey = (id: string) => ['entry', id];
const myReleaseEntryKey = (releaseId: string) => ['user', 'me', releaseId];

const entriesKey = (filters: {
  withReview?: boolean;
  releaseId?: string;
  userId?: string;
  sortBy?: string;
  year?: string;
  decade?: string;
  bucket?: string;
  genre?: string;
  artist?: string;
  label?: string;
  tag?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}) => [
  'entries',
  filters.withReview,
  ...(filters.releaseId
    ? ['release', filters.releaseId]
    : filters.userId
      ? ['user', filters.userId]
      : []),

  ...(filters.sortBy
    ? [
        filters.sortBy,
        filters.year,
        filters.decade,
        filters.bucket,
        filters.genre,
        filters.artist,
        filters.label,
        filters.tag,
        filters.type,
        filters.page,
        filters.pageSize,
      ]
    : []),
];

const reviewCommentsKey = (reviewId: string) => [
  'review',
  'comments',
  reviewId,
];

// RELEASE
const releaseKey = (id: string) => ['release', id];

const releaseFollowingEntriesKey = (releaseId: string) => [
  'release',
  releaseId,
  'following',
];
const releaseInMyListsKey = (releaseId: string) => [
  'release',
  releaseId,
  'inMyLists',
];

const releasesKey = ({
  type,
  page,
  pageSize,
  genreId,
  labelId,
}: {
  type: FindReleasesType;
  page?: number;
  pageSize?: number;
  genreId?: string;
  labelId?: string;
}) => ['releases', type, page, pageSize, genreId, labelId];

// RELEASE SUBMISSIONS

const releaseSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  releaseId?: string;
  userId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'releaseSubmissions',
        filters.status,
        filters.releaseId,
        filters.userId,
        filters.sortBy,
        filters.page,
      ]
    : ['releaseSubmissions'];
const artistSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  artistId?: string;
  userId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'artistSubmissions',
        filters.status,
        filters.artistId,
        filters.userId,
        filters.sortBy,
        filters.page,
      ]
    : ['artistSubmissions'];

const labelSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  labelId?: string;
  userId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'labelSubmissions',
        filters.status,
        filters.labelId,
        filters.userId,
        filters.sortBy,
        filters.page,
      ]
    : ['labelSubmissions'];

const genreSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  genreId?: string;
  userId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'genreSubmissions',
        filters.status,
        filters.genreId,
        filters.userId,
        filters.sortBy,
        filters.page,
      ]
    : ['genreSubmissions'];

const userContributionsStatsKey = (userId: string) => [
  'userContributionsStats',
  userId,
];

// ARTIST
const artistKey = (id: string) => ['artist', id];

// LABELS
const labelKey = (id: string) => ['label', id];

// GENRES
const genreKey = (id: string) => ['genre', id];

// LANGUAGES
const languagesKey = () => ['languages'];

// LISTS
const listKey = (id: string) => ['list', id];
const listItemsKey = (id: string, page?: number) => ['list', id, 'items', page];
const listCommentsKey = (id: string, page?: number) => [
  'list',
  id,
  'comments',
  page,
];

const releaseListsKey = (releaseId: string, page?: number) => [
  'release',
  releaseId,
  'lists',
  page,
];
const userListsKey = (userId: string, page?: number) => [
  'user',
  userId,
  'lists',
  page,
];
const newListsKey = (page?: number) => ['lists', 'new', page];
const popularListsKey = (page?: number) => ['lists', 'popular', page];

// USERS
const currentUserKey = () => ['user', 'me'];
const findUsersKey = (type?: FindUsersType) => ['users', type];
const userProfileKey = (username: string) => ['userProfile', username];
const userFollowersKey = (id: string) => ['user', id, 'followers'];
const userFollowingKey = (id: string) => ['user', id, 'following'];
const userArtistsKey = (userId: string) => ['user', userId, 'artists'];
const userRatingBucketsKey = (userId: string) => [
  'user',
  userId,
  'ratingBuckets',
];
const userGenresKey = (userId: string) => ['user', userId, 'genres'];
const userLabelsKey = (userId: string) => ['user', userId, 'labels'];

const userReleaseDatesKey = (userId: string) => [
  'user',
  userId,
  'releaseDates',
];
const userTagsKey = (userId: string) => ['user', userId, 'tags'];

// GENRES
const releaseGenresKey = (releaseId: string) => ['releaseGenres', releaseId];

// AUTOFILL
const musicBrainzReleaseKey = (id: string) => ['musicBrainzRelease', id];

// SEARCH
const searchKey = (filters: {
  type: string[];
  q?: string;
  page?: number;
  pageSize?: number;
}) => [
  'search',
  filters.type.join(','),
  ...(filters.q || filters.page || filters.pageSize
    ? [filters.q, filters.page, filters.pageSize]
    : []),
];

export const cacheKeys = {
  artistKey,
  labelKey,
  genreKey,
  entryKey,
  myReleaseEntryKey,
  entriesKey,
  userLabelsKey,
  languagesKey,
  listKey,
  listItemsKey,
  listCommentsKey,
  releaseListsKey,
  userListsKey,
  newListsKey,
  popularListsKey,
  releaseKey,
  releaseFollowingEntriesKey,
  releasesKey,
  releaseInMyListsKey,
  releaseSubmissionsKey,
  artistSubmissionsKey,
  labelSubmissionsKey,
  genreSubmissionsKey,
  userContributionsStatsKey,
  currentUserKey,
  findUsersKey,
  userProfileKey,
  userFollowersKey,
  userFollowingKey,
  userArtistsKey,
  userRatingBucketsKey,
  userGenresKey,
  userReleaseDatesKey,
  userTagsKey,
  releaseGenresKey,
  musicBrainzReleaseKey,
  searchKey,
  reviewCommentsKey,
};
