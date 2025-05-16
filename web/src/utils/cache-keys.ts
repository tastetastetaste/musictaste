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

const newReleasesKey = (page?: number) => ['releases', 'new', page];
const recentlyAddedReleasesKey = (page?: number) => [
  'releases',
  'recent',
  page,
];
const popularReleasesKey = (page?: number) => ['releases', 'popular', page];
const topReleasesKey = (page?: number) => ['releases', 'top', page];

// RELEASE SUBMISSIONS

const releaseSubmissionsKey = (filters: {
  page?: number;
  open?: boolean;
  releaseId?: string;
  userId?: string;
}) => [
  'releaseSubmissions',
  filters.open,
  filters.releaseId,
  filters.userId,
  filters.page,
];
const artistSubmissionsKey = (filters: {
  page?: number;
  open?: boolean;
  artistId?: string;
  userId?: string;
}) => [
  'artistSubmissions',
  filters.open,
  filters.artistId,
  filters.userId,
  filters.page,
];

const labelSubmissionsKey = (filters: {
  page?: number;
  open?: boolean;
  labelId?: string;
  userId?: string;
}) => [
  'labelSubmissions',
  filters.open,
  filters.labelId,
  filters.userId,
  filters.page,
];
// ARTIST
const artistKey = (id: string) => ['artist', id];

// LABELS
const labelKey = (id: string) => ['label', id];

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
  newReleasesKey,
  recentlyAddedReleasesKey,
  popularReleasesKey,
  topReleasesKey,
  releaseInMyListsKey,
  releaseSubmissionsKey,
  artistSubmissionsKey,
  labelSubmissionsKey,
  currentUserKey,
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
