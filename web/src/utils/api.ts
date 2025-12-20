import ky from 'ky';
import {
  CreateArtistDto,
  CreateCommentDto,
  CreateGenreDto,
  CreateGenreVoteDto,
  CreateLabelDto,
  CreateReleaseDto,
  CreateReportDto,
  EntriesSortByEnum,
  FindArtistSubmissionsDto,
  FindCommentsDto,
  FindGenreSubmissionsDto,
  FindLabelSubmissionsDto,
  FindReleasesType,
  FindReleaseSubmissionsDto,
  FindUsersType,
  IArtistResponse,
  IArtistSubmission,
  IArtistSubmissionsResponse,
  IAutofillRelease,
  ICommentsResponse,
  ICreateArtistResponse,
  ICreateGenreSubmissionResponse,
  ICreateLabelResponse,
  ICreateReleaseResponse,
  ICurrentUserResponse,
  IEntriesResponse,
  IEntry,
  IEntryResonse,
  IGenreResponse,
  IGenresResponse,
  IGenreSubmission,
  IGenreSubmissionsResponse,
  ILabelResponse,
  ILabelSubmission,
  ILabelSubmissionsResponse,
  ILanguage,
  IListItemsResponse,
  IListResponse,
  IListsResponse,
  INotificationsResponse,
  IReleaseGenre,
  IReleaseResponse,
  IReleasesResponse,
  IReleaseSubmission,
  IReleaseSubmissionsResponse,
  IReportResponse,
  ISearchResponse,
  IUpdateArtistSubmissionResponse,
  IUpdateGenreSubmissionResponse,
  IUpdateLabelSubmissionResponse,
  IUpdateReleaseResponse,
  IUserArtist,
  IUserContributionsStatsResponse,
  IUserFollowsResponse,
  IUserGenre,
  IUserLabel,
  IUserProfileResponse,
  IUserRatingBucket,
  IUserReleaseDate,
  IUsersResponse,
  IUserTag,
  ProcessPendingDeletionDto,
  SearchType,
  SendNotificationDto,
  UpdateAccountStatusDto,
  UpdateArtistDto,
  UpdateGenreDto,
  UpdateLabelDto,
  UpdateReleaseDto,
  UpdateUserContributorStatusDto,
  UpdateUserPreferencesDto,
  UpdateUserProfileDto,
  UpdateUserSupporterStatusDto,
  UpdateUserThemeDto,
  VoteType,
} from 'shared';
import { buildFormData } from './build-form-data';

const client = ky.create({
  prefixUrl:
    // @ts-expect-error ...
    import.meta.env.PROD
      ? 'https://api.musictaste.xyz'
      : 'http://localhost:4000/',
  credentials: 'include',
  timeout: false,
  retry: 0,
  hooks: {
    afterResponse: [
      async (_, __, response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          const error: any = new Error('HTTP Error');
          error.response = {
            status: response.status,
            data: body,
          };
          throw error;
        }
        return response;
      },
    ],
  },
});

// ----------------
//     ARTIST
// ----------------
const getArtist = (id: string) =>
  client.get('artists/' + id).json<IArtistResponse>();

// ----------------
//     LABEL
// ----------------
const getLabel = (id: string) =>
  client.get('labels/' + id).json<ILabelResponse>();

// ----------------
//     GENRE
// ----------------
const getGenre = (id: string) =>
  client.get('genres/' + id).json<IGenreResponse>();

const getGenres = () => client.get('genres').json<IGenresResponse>();

// ----------------
//     LANGUAGE
// ----------------
const getLanguages = () =>
  client.get('languages').json<{ languages: ILanguage[] }>();

// ----------------
//     AUTH
// ----------------
const login = (data: { email: string; password: string }) =>
  client.post('auth/login', { json: data }).json<boolean>();

const signup = (data: { username: string; password: string; email: string }) =>
  client.post('auth/signup', { json: data }).json<boolean>();
const logout = () => client.post('auth/logout').json<boolean>();
const confirmEmail = (token: string) =>
  client.get('auth/confirm/' + token).json<boolean>();
const forgotPassword = (email: string) =>
  client.post('auth/forgot-password', { json: { email } }).json<boolean>();

const forgotPasswordChange = ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) =>
  client
    .post('auth/forgot-password-change', {
      json: { password: newPassword, token },
    })
    .json<boolean>();

const updatePassword = (data: {
  id: string;
  oldPassword: string;
  newPassword: string;
}) => client.put('auth/update-password', { json: data }).json<boolean>();

// ----------------
//     ENTRIES
// ----------------

const getEntries = ({
  releaseId,
  userId,
  withReview,

  sortBy,

  year,
  decade,
  bucket,
  genre,
  artist,
  label,
  tag,
  type,

  page,
  pageSize,
}: {
  releaseId?: string;
  userId?: string;
  withReview?: boolean;

  sortBy: EntriesSortByEnum;

  year?: string;
  decade?: string;
  bucket?: string;
  genre?: string;
  artist?: string;
  label?: string;
  tag?: string;
  type?: string;

  page: number;
  pageSize: number;
}) => {
  return client
    .get(
      `entries?sortBy=${sortBy}&page=${page}&pageSize=${pageSize}${
        releaseId ? '&releaseId=' + releaseId : ''
      }${userId ? '&userId=' + userId : ''}${
        withReview ? '&withReview=true' : ''
      }${year ? '&year=' + year : ''}${
        decade ? '&decade=' + decade : ''
      }${bucket ? '&bucket=' + bucket : ''}${genre ? '&genre=' + genre : ''}${
        artist ? '&artist=' + artist : ''
      }${label ? '&label=' + label : ''}${tag ? '&tag=' + tag : ''}${
        type ? '&type=' + type : ''
      }`,
    )
    .json<IEntriesResponse>();
};

const getEntry = (id: string) => {
  return client.get(`entries/${id}`).json<IEntryResonse>();
};

const getMyReleaseEntry = (releaseId: string) => {
  return client.get(`entries/release/${releaseId}/me`).json<IEntryResonse>();
};

const getFollowingEntries = (releaseId: string) =>
  client.get(`entries/release/${releaseId}/following`).json<IEntry[]>();
const createEntry = (data: {
  releaseId: string;
  rating?: number;
  review?: string;
  tags?: string[];
}) => client.post('entries', { json: data }).json<any>();
const updateEntry = ({
  id,
  ...rest
}: {
  id: string;
  rating?: number;
  review?: string;
  tags?: string[];
}) => client.patch('entries/' + id, { json: rest }).json<any>();
const removeEntry = (id: string) =>
  client.delete('entries/' + id).json<boolean>();

const reviewVote = ({ reviewId, vote }: { reviewId: string; vote: VoteType }) =>
  client
    .post(`entries/review/${reviewId}/votes`, { json: { vote } })
    .json<boolean>();
const reviewRemoveVote = (reviewId: string) =>
  client.delete(`entries/review/${reviewId}/votes`).json<boolean>();

const getComments = ({ entityType, entityId, page }: FindCommentsDto) =>
  client
    .get(`comments?entityType=${entityType}&entityId=${entityId}&page=${page}`)
    .json<ICommentsResponse>();

const createComment = (data: CreateCommentDto) =>
  client.post('comments', { json: data }).json<boolean>();

const deleteComment = (id: string) =>
  client.delete(`comments/${id}`).json<boolean>();

const getNotifications = (page: number) =>
  client.get(`notifications?page=${page}`).json<INotificationsResponse>();

const getUnreadNotificationsCount = () =>
  client.get('notifications/unread-count').json<{ count: number }>();

const markAllAsRead = () =>
  client.post('notifications/mark-all-read').json<boolean>();

const getUserArtists = (userId: string) =>
  client.get('entries/user/' + userId + '/artists').json<IUserArtist[]>();
const getUserRatingBuckets = (userId: string) =>
  client.get('entries/user/' + userId + '/ratings').json<IUserRatingBucket[]>();
const getUserLabels = (userId: string) =>
  client.get('entries/user/' + userId + '/labels').json<IUserLabel[]>();

const getUserGenres = (userId: string) =>
  client.get('entries/user/' + userId + '/genres').json<IUserGenre[]>();
const getUserReleaseDates = (userId: string) =>
  client
    .get('entries/user/' + userId + '/release-date')
    .json<IUserReleaseDate[]>();
const getUserTags = (userId: string) =>
  client.get('entries/user/' + userId + '/tags').json<IUserTag[]>();

const createUserTag = (tag: string) =>
  client.post('entries/user/tags', { json: { tag } }).json<boolean>();
const updateUserTag = ({ tagId, tag }: { tagId: string; tag: string }) =>
  client.patch('entries/user/tags/' + tagId, { json: { tag } }).json<boolean>();
const deleteUserTag = (tagId: string) =>
  client.delete('entries/user/tags/' + tagId).json<boolean>();

const trackVote = ({
  releaseId,
  trackId,
  vote,
}: {
  releaseId: string;
  trackId: string;
  vote: VoteType;
}) =>
  client
    .post(`entries/track/${releaseId}/${trackId}`, { json: { vote } })
    .json<any>();

const removeTrackVote = ({
  releaseId,
  trackId,
}: {
  releaseId: string;
  trackId: string;
}) => client.delete(`entries/track/${releaseId}/${trackId}`).json<boolean>();

// ----------------
//     LISTS
// ----------------
const createList = (data: {
  title: string;
  description?: string;
  grid: boolean;
  ranked: boolean;
}) => client.post('lists', { json: data }).json<any>();
const updateList = ({
  id,
  ...data
}: {
  id: string;
  title: string;
  description?: string;
  grid: boolean;
  ranked: boolean;
}) => client.patch('lists/' + id, { json: data }).json<any>();

const getList = (id: string) => client.get('lists/' + id).json<IListResponse>();
const publishList = (id: string) =>
  client.patch('lists/' + id + '/publish').json<boolean>();
const deleteList = (id: string) => client.delete('lists/' + id).json<boolean>();
const getListItems = (id: string, page: number) =>
  client.get('lists/' + id + '/items?page=' + page).json<IListItemsResponse>();
const addToList = ({ id, releaseId }: { id: string; releaseId: string }) =>
  client
    .post('lists/' + id + '/items', { json: { releaseId } })
    .json<boolean>();
const editListItem = ({
  id,
  itemId,
  note,
}: {
  id: string;
  itemId: string;
  note: string;
}) =>
  client
    .patch('lists/' + id + '/items/' + itemId, { json: { note } })
    .json<boolean>();
const removeFromList = ({ id, itemId }: { id: string; itemId: string }) =>
  client.delete('lists/' + id + '/items/' + itemId).json<boolean>();
const reorderListItems = ({
  id,
  items,
}: {
  id: string;
  items: { id: string; index: number }[];
}) =>
  client.patch('lists/' + id + '/items', { json: { items } }).json<boolean>();
const createListLike = (id: string) =>
  client.post('lists/' + id + '/likes').json<boolean>();
const removeListLike = (id: string) =>
  client.delete('lists/' + id + '/likes').json<boolean>();
const getReleaseLists = (releaseId: string, page: number) =>
  client
    .get('lists?sortBy=new&releaseId=' + releaseId + '&page=' + page)
    .json<IListsResponse>();
const getUserLists = (userId: string, page: number) =>
  client
    .get('lists?sortBy=updatedDate&userId=' + userId + '&page=' + page)
    .json<IListsResponse>();
const getNewLists = (page: number) =>
  client.get('lists?sortBy=new&page=' + page).json<IListsResponse>();
const getPopularLists = (page: number) =>
  client.get('lists?sortBy=popular&page=' + page).json<IListsResponse>();

const getReleaseInMyLists = (releaseId: string) =>
  client
    .get('lists/release/' + releaseId)
    .json<{ listId: string; itemId: string }[]>();

// ----------------
//     RELEASES
// ----------------
const getRelease = (id: string) =>
  client.get('releases/' + id).json<IReleaseResponse>();

const getReleases = (
  type: FindReleasesType,
  page: number,
  pageSize?: number,
  genreId?: string,
  labelId?: string,
) =>
  client
    .get(
      `releases?type=${type}&page=${page}${pageSize ? `&pageSize=${pageSize}` : ''}${genreId ? `&genreId=${genreId}` : ''}${labelId ? `&labelId=${labelId}` : ''}`,
    )
    .json<IReleasesResponse>();

// ----------------
//     SUBMISSIONS
// ----------------
const createArtist = (data: CreateArtistDto) =>
  client
    .post('submissions/artists', { json: data })
    .json<ICreateArtistResponse>();

const updateArtist = ({ id, data }: { id: string; data: UpdateArtistDto }) =>
  client
    .post('submissions/artists/' + id, { json: data })
    .json<IUpdateArtistSubmissionResponse>();

const createLabel = (data: CreateLabelDto) =>
  client
    .post('submissions/labels', { json: data })
    .json<ICreateLabelResponse>();

const updateLabel = ({ id, data }: { id: string; data: UpdateLabelDto }) =>
  client
    .post('submissions/labels/' + id, { json: data })
    .json<IUpdateLabelSubmissionResponse>();

const createRelease = (data: CreateReleaseDto) =>
  client
    .post('submissions/releases', { body: buildFormData(data) })
    .json<ICreateReleaseResponse>();
const updateRelease = ({ id, data }: { id: string; data: UpdateReleaseDto }) =>
  client
    .post('submissions/releases/' + id, { body: buildFormData(data) })
    .json<IUpdateReleaseResponse>();

const createGenre = (data: CreateGenreDto) =>
  client
    .post('submissions/genres', { json: data })
    .json<ICreateGenreSubmissionResponse>();

const updateGenre = ({ id, data }: { id: string; data: UpdateGenreDto }) =>
  client
    .post('submissions/genres/' + id, { json: data })
    .json<IUpdateGenreSubmissionResponse>();

const getReleaseSubmissions = ({
  page,
  status,
  releaseId,
  userId,
  sortBy,
}: FindReleaseSubmissionsDto) =>
  client
    .get(
      `submissions/releases?page=${page}${status ? '&status=' + status : ''}${
        releaseId ? '&releaseId=' + releaseId : ''
      }${userId ? '&userId=' + userId : ''}${sortBy ? '&sortBy=' + sortBy : ''}`,
    )
    .json<IReleaseSubmissionsResponse>();
const getArtistSubmissions = ({
  page,
  status,
  artistId,
  userId,
  sortBy,
}: FindArtistSubmissionsDto) =>
  client
    .get(
      `submissions/artists?page=${page}${status ? '&status=' + status : ''}${
        artistId ? '&artistId=' + artistId : ''
      }${userId ? '&userId=' + userId : ''}${sortBy ? '&sortBy=' + sortBy : ''}`,
    )
    .json<IArtistSubmissionsResponse>();
const getLabelSubmissions = ({
  page,
  status,
  labelId,
  userId,
  sortBy,
}: FindLabelSubmissionsDto) =>
  client
    .get(
      `submissions/labels?page=${page}${status ? '&status=' + status : ''}${
        labelId ? '&labelId=' + labelId : ''
      }${userId ? '&userId=' + userId : ''}${sortBy ? '&sortBy=' + sortBy : ''}`,
    )
    .json<ILabelSubmissionsResponse>();

const getGenreSubmissions = ({
  page,
  status,
  genreId,
  userId,
  sortBy,
}: FindGenreSubmissionsDto) =>
  client
    .get(
      `submissions/genres?page=${page}${status ? '&status=' + status : ''}${
        genreId ? '&genreId=' + genreId : ''
      }${userId ? '&userId=' + userId : ''}${sortBy ? '&sortBy=' + sortBy : ''}`,
    )
    .json<IGenreSubmissionsResponse>();

const getReleaseSubmissionById = (submissionId: string) =>
  client.get('submissions/release/' + submissionId).json<IReleaseSubmission>();

const getArtistSubmissionById = (submissionId: string) =>
  client.get('submissions/artist/' + submissionId).json<IArtistSubmission>();

const getLabelSubmissionById = (submissionId: string) =>
  client.get('submissions/label/' + submissionId).json<ILabelSubmission>();

const getGenreSubmissionById = (submissionId: string) =>
  client.get('submissions/genre/' + submissionId).json<IGenreSubmission>();

const discardMyReleaseSubmission = (submissionId: string) =>
  client.delete('submissions/releases/' + submissionId).json<void>();

const discardMyLabelSubmission = (submissionId: string) =>
  client.delete('submissions/labels/' + submissionId).json<void>();

const discardMyArtistSubmission = (submissionId: string) =>
  client.delete('submissions/artists/' + submissionId).json<void>();

const discardMyGenreSubmission = (submissionId: string) =>
  client.delete('submissions/genres/' + submissionId).json<void>();

const processPendingDeletion = (data: ProcessPendingDeletionDto) =>
  client
    .post('submissions/process-pending-deletion', { json: data })
    .json<boolean>();

const releaseSubmissionVote = ({
  submissionId,
  vote,
}: {
  submissionId: string;
  vote: VoteType;
}) =>
  client
    .patch('submissions/releases/vote/' + submissionId, { json: { vote } })
    .json<boolean>();

const labelSubmissionVote = ({
  submissionId,
  vote,
}: {
  submissionId: string;
  vote: VoteType;
}) =>
  client
    .patch('submissions/labels/vote/' + submissionId, { json: { vote } })
    .json<boolean>();

const artistSubmissionVote = ({
  submissionId,
  vote,
}: {
  submissionId: string;
  vote: VoteType;
}) =>
  client
    .patch('submissions/artists/vote/' + submissionId, { json: { vote } })
    .json<boolean>();

const genreSubmissionVote = ({
  submissionId,
  vote,
}: {
  submissionId: string;
  vote: VoteType;
}) =>
  client
    .patch('submissions/genres/vote/' + submissionId, { json: { vote } })
    .json<boolean>();

const getUserContributionsStats = (userId: string) =>
  client
    .get('submissions/user-contributions/' + userId)
    .json<IUserContributionsStatsResponse>();
// ----------------
//     GENRES
// ----------------
const getReleaseGenres = (releaseId: string) =>
  client.get('genres/release/' + releaseId).json<IReleaseGenre[]>();

const createReleaseGenreVote = (data: CreateGenreVoteDto) =>
  client.post('genres/rg', { json: data }).json<any>();

const removeReleaseGenreVote = ({ id }: { id: string }) =>
  client.delete('genres/rg/' + id).json<any>();

// ----------------
//     AUTOFILL
// ----------------
const getSpotifyRelease = (id: string) =>
  client.get('autofill/spotify/' + id).json<IAutofillRelease>();

const getMusicBrainzRelease = (id: string) =>
  client.get('autofill/musicbrainz/' + id).json<IAutofillRelease>();

// ----------------
//     SEARCH
// ----------------
const search = ({
  q,
  type,
  page,
  pageSize,
}: {
  q: string;
  type: SearchType[];
  page: number;
  pageSize: number;
}) => {
  return client
    .get(
      'search?q=' +
        encodeURIComponent(q) +
        '&type=' +
        type.join('&type=') +
        '&page=' +
        page +
        '&pageSize=' +
        pageSize,
    )
    .json<ISearchResponse>();
};
// ----------------
//     USERS
// ----------------
const getCurrentUser = () =>
  client.get('users/me').json<ICurrentUserResponse>();
const getUserProfile = (username: string) =>
  client.get('users/username/' + username).json<IUserProfileResponse>();
const getUserFollowers = (id: string) =>
  client.get('users/' + id + '/followers/').json<IUserFollowsResponse>();
const getUserFollowing = (id: string) =>
  client.get('users/' + id + '/following/').json<IUserFollowsResponse>();
const updateProfile = ({
  id,
  ...data
}: {
  id: string;
} & UpdateUserProfileDto) =>
  client
    .patch('users/' + id + '/update-profile', { json: data })
    .json<boolean>();
const updatePreferences = ({
  id,
  ...data
}: {
  id: string;
} & UpdateUserPreferencesDto) =>
  client
    .patch('users/' + id + '/update-preferences', { json: data })
    .json<boolean>();
const updateImage = ({ id, image }: { id: string; image: File }) => {
  return client
    .patch('users/' + id + '/update-image', { body: buildFormData({ image }) })
    .json<boolean>();
};
const updateTheme = ({
  id,
  theme,
}: {
  id: string;
  theme: UpdateUserThemeDto;
}) =>
  client
    .patch('users/' + id + '/update-theme', { json: theme })
    .json<boolean>();
const follow = ({ id }: { id: string }) =>
  client.post('users/' + id + '/following').json<boolean>();
const unFollow = ({ id }: { id: string }) =>
  client.delete('users/' + id + '/following').json<boolean>();

const report = (report: CreateReportDto) =>
  client.post('reports', { json: report }).json<IReportResponse>();

// ----------------
//     ADMIN
// ----------------
const updateUserContributorStatus = (data: UpdateUserContributorStatusDto) =>
  client.patch('admin/user/contributor-status', { json: data }).json<boolean>();

const updateUserSupporterStatus = (data: UpdateUserSupporterStatusDto) =>
  client.patch('admin/user/supporter-status', { json: data }).json<boolean>();

const updateAccountStatus = (data: UpdateAccountStatusDto) =>
  client.patch('admin/user/account-status', { json: data }).json<boolean>();

const sendNotification = (data: SendNotificationDto) =>
  client.post('admin/user/notification', { json: data }).json<boolean>();

const findUsers = (type: FindUsersType) => {
  return client
    .get(`users?${type ? `type=${type}` : ''}`)
    .json<IUsersResponse>();
};

const mergeEntities = (data: {
  entityType: 'artist' | 'release' | 'label';
  mergeFromId: string;
  mergeIntoId: string;
}) =>
  client
    .post('admin/merge', { json: data })
    .json<{ mergedFrom: string; mergedInto: string }>();

const parseLinks = (text: string) =>
  client
    .post('entities/parse-links', { json: { text } })
    .json<{ text: string }>();

export const api = {
  getArtist,
  getLabel,
  getGenre,
  getGenres,
  createArtist,
  updateArtist,
  createLabel,
  updateLabel,
  getLanguages,
  login,
  signup,
  logout,
  confirmEmail,
  forgotPassword,
  forgotPasswordChange,
  updatePassword,
  getEntries,
  getEntry,
  getMyReleaseEntry,
  getFollowingEntries,
  createEntry,
  updateEntry,
  removeEntry,
  reviewVote,
  reviewRemoveVote,
  getComments,
  createComment,
  deleteComment,
  getNotifications,
  getUnreadNotificationsCount,
  markAllAsRead,
  getUserArtists,
  getUserRatingBuckets,
  getUserLabels,
  getUserGenres,
  getUserReleaseDates,
  getUserTags,
  createUserTag,
  updateUserTag,
  deleteUserTag,
  createList,
  updateList,
  getList,
  publishList,
  deleteList,
  getListItems,
  addToList,
  editListItem,
  removeFromList,
  reorderListItems,
  createListLike,
  removeListLike,
  getReleaseLists,
  getUserLists,
  getNewLists,
  getPopularLists,
  getReleaseInMyLists,
  getRelease,
  getReleases,
  createRelease,
  updateRelease,
  createGenre,
  updateGenre,
  getReleaseSubmissions,
  getArtistSubmissions,
  getLabelSubmissions,
  getGenreSubmissions,
  getReleaseSubmissionById,
  getArtistSubmissionById,
  getLabelSubmissionById,
  getGenreSubmissionById,
  discardMyArtistSubmission,
  discardMyLabelSubmission,
  discardMyReleaseSubmission,
  discardMyGenreSubmission,
  processPendingDeletion,
  getUserContributionsStats,
  releaseSubmissionVote,
  labelSubmissionVote,
  artistSubmissionVote,
  genreSubmissionVote,
  trackVote,
  removeTrackVote,
  getReleaseGenres,
  createReleaseGenreVote,
  removeReleaseGenreVote,
  getSpotifyRelease,
  getMusicBrainzRelease,
  search,
  getCurrentUser,
  getUserProfile,
  getUserFollowers,
  getUserFollowing,
  updateProfile,
  updatePreferences,
  updateImage,
  updateTheme,
  follow,
  unFollow,
  report,
  updateUserContributorStatus,
  updateUserSupporterStatus,
  updateAccountStatus,
  sendNotification,
  findUsers,
  mergeEntities,
  parseLinks,
};
