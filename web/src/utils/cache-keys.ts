import {
  CommentEntityType,
  EntriesSortByEnum,
  FindEntriesDto,
  FindReleasesType,
  FindReviewsDto,
  FindUsersType,
  ReleaseType,
  ReviewsSortByEnum,
} from 'shared';

// ENTRY
const entryKey = (id: string) => ['entries', id];
const reviewKey = (entryId: string) => ['entries', entryId, 'review'];
const myReleaseEntryKey = (releaseId: string) => ['entries', 'me', releaseId];

const entriesKey = (
  filters: Omit<FindEntriesDto, 'sortBy' | 'page' | 'pageSize'> & {
    sortBy?: EntriesSortByEnum;
    page?: number;
    pageSize?: number;
  },
) =>
  [
    'entries',
    ...(filters.releaseId
      ? ['release', filters.releaseId]
      : filters.userId
        ? ['user', filters.userId]
        : []),
    ...(filters.sortBy
      ? [
          filters.collectionViewId,
          filters.sortBy,
          filters.year,
          filters.decade,
          filters.bucket,
          filters.genres ? filters.genres.join(',') : undefined,
          filters.artists ? filters.artists.join(',') : undefined,
          filters.labels ? filters.labels.join(',') : undefined,
          filters.tags ? filters.tags.join(',') : undefined,
          filters.types ? filters.types.join(',') : undefined,
          filters.page,
          filters.pageSize,
        ]
      : []),
  ].filter(Boolean);

const reviewsKey = (
  filters: Omit<FindReviewsDto, 'sortBy' | 'page' | 'pageSize'> & {
    sortBy?: ReviewsSortByEnum;
    page?: number;
    pageSize?: number;
  },
) =>
  [
    'entries',
    ...(filters.releaseId
      ? ['release', filters.releaseId]
      : filters.userId
        ? ['user', filters.userId]
        : []),
    'reviews',
    ...(filters.sortBy ? [filters.sortBy, filters.page, filters.pageSize] : []),
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
  genreIds,
  includeAllGenres,
  onlyUpcoming,
  releaseType,
  includeAliases,
  includeCommunity,
  minRatings,
  maxRatings,
}: {
  type?: FindReleasesType;
  page?: number;
  pageSize?: number;
  genreId?: string;
  labelId?: string;
  artistId?: string;
  genreIds?: string[];
  includeAllGenres?: boolean;
  onlyUpcoming?: boolean;
  releaseType?: ReleaseType;
  includeAliases?: boolean;
  includeCommunity?: boolean;
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
    ...(genreIds ? ['genreIds', genreIds.join(',')] : []),
    includeAllGenres,
    onlyUpcoming,
    releaseType,
    includeAliases,
    includeCommunity,
    minRatings,
    maxRatings,
  ].filter(Boolean);

// RELEASE SUBMISSIONS

const releaseSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  type?: number;
  releaseId?: string;
  userId?: string;
  voteByUserId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'releaseSubmissions',
        `${filters.status}-${filters.type}`,
        filters.releaseId,
        filters.userId,
        filters.voteByUserId,
        filters.sortBy,
        filters.page,
      ]
    : ['releaseSubmissions'];
const artistSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  type?: number;
  artistId?: string;
  userId?: string;
  voteByUserId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'artistSubmissions',
        `${filters.status}-${filters.type}`,
        filters.artistId,
        filters.userId,
        filters.voteByUserId,
        filters.sortBy,
        filters.page,
      ]
    : ['artistSubmissions'];

const labelSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  type?: number;
  labelId?: string;
  userId?: string;
  voteByUserId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'labelSubmissions',
        `${filters.status}-${filters.type}`,
        filters.labelId,
        filters.userId,
        filters.voteByUserId,
        filters.sortBy,
        filters.page,
      ]
    : ['labelSubmissions'];

const genreSubmissionsKey = (filters?: {
  page?: number;
  status?: number;
  type?: number;
  genreId?: string;
  userId?: string;
  voteByUserId?: string;
  sortBy?: string;
}) =>
  filters
    ? [
        'genreSubmissions',
        `${filters.status}-${filters.type}`,
        filters.genreId,
        filters.userId,
        filters.voteByUserId,
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
const artistsKey = (ids: string[]) => ['artists', ids.join(',')];

// LABELS
const labelKey = (id: string) => ['label', id];
const labelsKey = (ids: string[]) => ['labels', ids.join(',')];

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
const listLikesKey = (id: string) => ['list', id, 'likes'];

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
const userArtistsKey = (userId: string, collectionViewId?: string) =>
  ['user', userId, 'artists', collectionViewId].filter(Boolean);
const userRatingBucketsKey = (userId: string, collectionViewId?: string) =>
  ['user', userId, 'ratingBuckets', collectionViewId].filter(Boolean);
const userGenresKey = (userId: string, collectionViewId?: string) =>
  ['user', userId, 'genres', collectionViewId].filter(Boolean);
const userLabelsKey = (userId: string, collectionViewId?: string) =>
  ['user', userId, 'labels', collectionViewId].filter(Boolean);

const userReleaseDatesKey = (userId: string, collectionViewId?: string) =>
  ['user', userId, 'releaseDates', collectionViewId].filter(Boolean);
const userTagsKey = (userId: string) => ['user', userId, 'tags'];

// GENRES
const releaseGenresKey = (releaseId: string) => ['releaseGenres', releaseId];

const userGenreVotesKey = (userId: string, page: number, genreId?: string) => [
  'user',
  userId,
  'genreVotes',
  page,
  genreId,
];

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

const userCollectionViewsKey = () => ['user-collection-views'];

export const cacheKeys = {
  artistKey,
  artistsKey,
  labelKey,
  labelsKey,
  genreKey,
  genresKey,
  entryKey,
  reviewKey,
  myReleaseEntryKey,
  entriesKey,
  reviewsKey,
  userLabelsKey,
  languagesKey,
  countriesKey,
  listKey,
  listItemsKey,
  listLikesKey,
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
  userGenreVotesKey,
  musicBrainzReleaseKey,
  searchKey,
  commentsKey,
  notificationsKey,
  unreadNotificationsCountKey,
  userCollectionViewsKey,
};
