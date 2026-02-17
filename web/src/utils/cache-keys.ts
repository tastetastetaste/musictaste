import {
  CommentEntityType,
  FindReleasesType,
  FindUsersType,
  ReleaseType,
} from 'shared';

// ENTRY
const entryKey = (id: string) => ['entries', id];
const myReleaseEntryKey = (releaseId: string) => ['entries', 'me', releaseId];

const entriesKey = (filters: {
  releaseId?: string;
  userId?: string;
  withReview?: boolean;
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
}) =>
  [
    'entries',
    ...(filters.releaseId
      ? ['release', filters.releaseId]
      : filters.userId
        ? ['user', filters.userId]
        : []),
    filters.withReview,
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
  ].filter(Boolean);

// COMMENTS
const commentsKey = (entityType: CommentEntityType, entityId: string) => [
  'comments',
  entityType,
  entityId,
];

// NOTIFICATIONS
const notificationsKey = (page?: number) =>
  ['notifications', page].filter(Boolean);
const unreadNotificationsCountKey = () => ['notifications', 'unread-count'];

// RELEASE
const releaseKey = (id: string) => ['releases', id];

const releaseFollowingEntriesKey = (releaseId: string) => [
  'releases',
  releaseId,
  'following',
];
const releaseInMyListsKey = (releaseId: string) => [
  'releases',
  releaseId,
  'inMyLists',
];

const releasesKey = ({
  type,
  page,
  pageSize,
  genreId,
  labelId,
  artistId,
  releaseType,
  includeAliases,
  minRatings,
  maxRatings,
}: {
  type?: FindReleasesType;
  page?: number;
  pageSize?: number;
  genreId?: string;
  labelId?: string;
  artistId?: string;
  releaseType?: ReleaseType;
  includeAliases?: boolean;
  minRatings?: number;
  maxRatings?: number;
}) =>
  [
    'releases',
    type,
    page,
    pageSize,
    genreId,
    labelId,
    artistId,
    releaseType,
    includeAliases,
    minRatings,
    maxRatings,
  ].filter(Boolean);

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

const releaseSubmissionByIdKey = (submissionId: string) => [
  'releaseSubmissions',
  submissionId,
];

const artistSubmissionByIdKey = (submissionId: string) => [
  'artistSubmissions',
  submissionId,
];

const labelSubmissionByIdKey = (submissionId: string) => [
  'labelSubmissions',
  submissionId,
];

const genreSubmissionByIdKey = (submissionId: string) => [
  'genreSubmissions',
  submissionId,
];

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
const genresKey = () => ['genres'];

// LANGUAGES
const languagesKey = () => ['languages'];

// COUNTRIES
const countriesKey = () => ['countries'];

// LISTS
const listKey = (id: string) => ['list', id];
const listItemsKey = (id: string, page?: number) => ['list', id, 'items', page];

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

// HOME

const communityHighlightKey = () => ['community-highlight'];

export const cacheKeys = {
  artistKey,
  labelKey,
  genreKey,
  genresKey,
  entryKey,
  myReleaseEntryKey,
  entriesKey,
  userLabelsKey,
  languagesKey,
  countriesKey,
  listKey,
  listItemsKey,
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
  releaseSubmissionByIdKey,
  artistSubmissionByIdKey,
  labelSubmissionByIdKey,
  genreSubmissionByIdKey,
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
  commentsKey,
  notificationsKey,
  unreadNotificationsCountKey,
  communityHighlightKey,
};
