import axios from 'axios';
import {
  CreateArtistDto,
  CreateGenreVoteDto,
  CreateLabelDto,
  CreateReleaseDto,
  CreateReportDto,
  EntriesSortByEnum,
  FindArtistSubmissionsDto,
  FindLabelSubmissionsDto,
  FindReleaseSubmissionsDto,
  IArtistResponse,
  IAutofillRelease,
  ICreateArtistResponse,
  ICreateLabelResponse,
  ICreateReleaseResponse,
  ICurrentUserResponse,
  IEntriesResponse,
  IEntry,
  IEntryResonse,
  ILanguage,
  IListCommentsResponse,
  IListItemsResponse,
  IListResponse,
  IListsResponse,
  IReleaseGenre,
  IReleaseResponse,
  IReleasesResponse,
  IReleaseSubmissionsResponse,
  IReviewCommentsResponse,
  ISearchResponse,
  IUpdateReleaseResponse,
  IUserArtist,
  IUserFollowsResponse,
  IUserGenre,
  IUserLabel,
  IUserProfileResponse,
  IUserRatingBucket,
  IUserReleaseDate,
  IUserTag,
  SearchType,
  UpdateReleaseDto,
  VoteType,
} from 'shared';

const client = axios.create({
  baseURL:
    // @ts-ignore
    import.meta.env.PROD
      ? 'https://api.musictaste.xyz'
      : 'http://localhost:4000/',
  withCredentials: true,
});

// ----------------
//     ARTIST
// ----------------
const getArtist = (id: string) =>
  client.get<IArtistResponse>('artists/' + id).then((res) => res.data);

// ----------------
//     LANGUAGE
// ----------------
const getLanguages = () =>
  client.get<{ languages: ILanguage[] }>('languages').then((res) => res.data);

// ----------------
//     AUTH
// ----------------
const login = (data: { email: string; password: string }) =>
  client.post<boolean>('auth/login', data).then((res) => res.data);

const signup = (data: { username: string; password: string; email: string }) =>
  client.post<boolean>('auth/signup', data).then((res) => res.data);
const logout = () =>
  client.post<boolean>('auth/logout').then((res) => res.data);
const confirmEmail = (token: string) =>
  client.get<boolean>('auth/confirm/' + token).then((res) => res.data);
const forgotPassword = (email: string) =>
  client
    .post<boolean>('auth/forgot-password', { email })
    .then((res) => res.data);

const forgotPasswordChange = ({
  token,
  newPassword,
}: {
  token: string;
  newPassword: string;
}) =>
  client
    .post('auth/forgot-password-change', { password: newPassword, token })
    .then((res) => res.data);

const updatePassword = (data: {
  id: string;
  oldPassword: string;
  newPassword: string;
}) => client.put<boolean>('auth/update-password', data).then((res) => res.data);

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

  page: number;
  pageSize: number;
}) => {
  return client
    .get<IEntriesResponse>(
      `entries?sortBy=${sortBy}&page=${page}&pageSize=${pageSize}${
        releaseId ? '&releaseId=' + releaseId : ''
      }${userId ? '&userId=' + userId : ''}${
        withReview ? '&withReview=true' : ''
      }${year ? '&year=' + year : ''}${
        decade ? '&decade=' + decade : ''
      }${bucket ? '&bucket=' + bucket : ''}${genre ? '&genre=' + genre : ''}${
        artist ? '&artist=' + artist : ''
      }${label ? '&label=' + label : ''}${tag ? '&tag=' + tag : ''}`,
    )
    .then((res) => res.data);
};

const getEntry = (id: string) => {
  return client.get<IEntryResonse>(`entries/${id}`).then((res) => res.data);
};

const getMyReleaseEntry = (releaseId: string) => {
  return client
    .get<IEntryResonse>(`entries/release/${releaseId}/me`)
    .then((res) => res.data);
};

const getFollowingEntries = (releaseId: string) =>
  client
    .get<IEntry[]>(`entries/release/${releaseId}/following`)
    .then((res) => res.data);
const createEntry = (data: {
  releaseId: string;
  rating?: number;
  review?: string;
  tags?: string[];
}) => client.post('entries', data).then((res) => res.data);
const updateEntry = ({
  id,
  ...rest
}: {
  id: string;
  rating?: number;
  review?: string;
  tags?: string[];
}) => client.patch('entries/' + id, rest).then((res) => res.data);
const removeEntry = (id: string) =>
  client.delete<boolean>('entries/' + id).then((res) => res.data);

const reviewVote = ({ reviewId, vote }: { reviewId: string; vote: VoteType }) =>
  client
    .post(`entries/review/${reviewId}/votes`, { vote })
    .then((res) => res.data);
const reviewRemoveVote = (reviewId: string) =>
  client.delete(`entries/review/${reviewId}/votes`).then((res) => res.data);
const createReviewComment = ({
  reviewId,
  body,
}: {
  reviewId: string;
  body: string;
}) =>
  client
    .post(`entries/review/${reviewId}/comments`, { body })
    .then((res) => res.data);
const removeReviewComment = (reviewId: string) =>
  client.delete(`entries/review/${reviewId}/comments`).then((res) => res.data);
const getReviewComments = (reviewId: string, page: number) =>
  client
    .get<IReviewCommentsResponse>(
      `entries/review/${reviewId}/comments?page=${page}`,
    )
    .then((res) => res.data);
const getUserArtists = (userId: string) =>
  client
    .get<IUserArtist[]>('entries/user/' + userId + '/artists')
    .then((res) => res.data);
const getUserRatingBuckets = (userId: string) =>
  client
    .get<IUserRatingBucket[]>('entries/user/' + userId + '/ratings')
    .then((res) => res.data);
const getUserLabels = (userId: string) =>
  client
    .get<IUserLabel[]>('entries/user/' + userId + '/labels')
    .then((res) => res.data);

const getUserGenres = (userId: string) =>
  client
    .get<IUserGenre[]>('entries/user/' + userId + '/genres')
    .then((res) => res.data);
const getUserReleaseDates = (userId: string) =>
  client
    .get<IUserReleaseDate[]>('entries/user/' + userId + '/release-date')
    .then((res) => res.data);
const getUserTags = (userId: string) =>
  client
    .get<IUserTag[]>('entries/user/' + userId + '/tags')
    .then((res) => res.data);

const createUserTag = (tag: string) =>
  client.post('entries/user/tags', { tag }).then((res) => res.data);
const updateUserTag = ({ tagId, tag }: { tagId: string; tag: string }) =>
  client.patch('entries/user/tags/' + tagId, { tag }).then((res) => res.data);
const deleteUserTag = (tagId: string) =>
  client.delete('entries/user/tags/' + tagId).then((res) => res.data);

const trackVote = ({
  releaseId,
  trackId,
  vote,
}: {
  releaseId: string;
  trackId: string;
  vote: VoteType;
}) => client.post(`entries/track/${releaseId}/${trackId}`, { vote });

const removeTrackVote = ({
  releaseId,
  trackId,
}: {
  releaseId: string;
  trackId: string;
}) => client.delete(`entries/track/${releaseId}/${trackId}`);

// ----------------
//     LISTS
// ----------------
const createList = (data: {
  title: string;
  description?: string;
  grid: boolean;
  ranked: boolean;
}) => client.post('lists', data).then((res) => res.data);
const updateList = ({
  id,
  ...data
}: {
  id: string;
  title: string;
  description?: string;
  grid: boolean;
  ranked: boolean;
}) => client.patch('lists/' + id, data).then((res) => res.data);

const getList = (id: string) =>
  client.get<IListResponse>('lists/' + id).then((res) => res.data);
const publishList = (id: string) =>
  client.patch('lists/' + id + '/publish').then((res) => res.data);
const deleteList = (id: string) =>
  client.delete('lists/' + id).then((res) => res.data);
const getListItems = (id: string, page: number) =>
  client
    .get<IListItemsResponse>('lists/' + id + '/items?page=' + page)
    .then((res) => res.data);
const addToList = ({ id, releaseId }: { id: string; releaseId: string }) =>
  client.post('lists/' + id + '/items', { releaseId }).then((res) => res.data);
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
    .patch('lists/' + id + '/items/' + itemId, { note })
    .then((res) => res.data);
const removeFromList = ({ id, itemId }: { id: string; itemId: string }) =>
  client.delete('lists/' + id + '/items/' + itemId).then((res) => res.data);
const reorderListItems = ({
  id,
  items,
}: {
  id: string;
  items: { id: string; index: number }[];
}) => client.patch('lists/' + id + '/items', { items }).then((res) => res.data);
const createListLike = (id: string) =>
  client.post('lists/' + id + '/likes').then((res) => res.data);
const removeListLike = (id: string) =>
  client.delete('lists/' + id + '/likes').then((res) => res.data);
const createListComment = ({ id, body }: { id: string; body: string }) =>
  client.post('lists/' + id + '/comments', { body }).then((res) => res.data);
const removeListComment = (id: string) =>
  client.delete('lists/' + id + '/comments').then((res) => res.data);
const getListComments = (id: string, page: number) =>
  client
    .get<IListCommentsResponse>('lists/' + id + '/comments?page=' + page)
    .then((res) => res.data);
const getReleaseLists = (releaseId: string, page: number) =>
  client
    .get<IListsResponse>(
      '/lists?sortBy=new&releaseId=' + releaseId + '&page=' + page,
    )
    .then((res) => res.data);
const getUserLists = (userId: string, page: number) =>
  client
    .get<IListsResponse>(
      'lists?sortBy=updatedDate&userId=' + userId + '&page=' + page,
    )
    .then((res) => res.data);
const getNewLists = (page: number) =>
  client
    .get<IListsResponse>('lists?sortBy=new&page=' + page)
    .then((res) => res.data);
const getPopularLists = (page: number) =>
  client
    .get<IListsResponse>('lists?sortBy=popular&page=' + page)
    .then((res) => res.data);

const getReleaseInMyLists = (releaseId: string) =>
  client
    .get<{ listId: string; itemId: string }[]>('lists/release/' + releaseId)
    .then((res) => res.data);

// ----------------
//     RELEASES
// ----------------
const getRelease = (id: string) =>
  client.get<IReleaseResponse>('releases/' + id).then((res) => res.data);
const getNewReleases = (page: number) =>
  client
    .get<IReleasesResponse>('releases/new?page=' + page)
    .then((res) => res.data);
const getRecentlyAddedReleases = (page: number) =>
  client
    .get<IReleasesResponse>('releases/recent?page=' + page)
    .then((res) => res.data);
const getPopularReleases = (page: number) =>
  client
    .get<IReleasesResponse>('releases/popular?page=' + page)
    .then((res) => res.data);
const getTopReleases = (page: number) =>
  client
    .get<IReleasesResponse>('releases/top?page=' + page)
    .then((res) => res.data);

// ----------------
//     SUBMISSIONS
// ----------------
const createArtist = (data: CreateArtistDto) =>
  client
    .post<ICreateArtistResponse>('submissions/artists', data)
    .then((res) => res.data);

const createLabel = (data: CreateLabelDto) =>
  client
    .post<ICreateLabelResponse>('submissions/labels', data)
    .then((res) => res.data);

const createRelease = (data: CreateReleaseDto) =>
  client
    .post<ICreateReleaseResponse>('submissions/releases', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);
const updateRelease = ({ id, data }: { id: string; data: UpdateReleaseDto }) =>
  client
    .post<IUpdateReleaseResponse>('submissions/releases/' + id, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((res) => res.data);

const getReleaseSubmissions = ({
  page,
  open,
  releaseId,
  userId,
}: FindReleaseSubmissionsDto) =>
  client
    .get<IReleaseSubmissionsResponse>(
      `submissions/releases?page=${page}${open ? '&open=true' : ''}${
        releaseId ? '&releaseId=' + releaseId : ''
      }${userId ? '&userId=' + userId : ''}`,
    )
    .then((res) => res.data);
const getArtistSubmissions = ({
  page,
  open,
  artistId,
  userId,
}: FindArtistSubmissionsDto) =>
  client
    .get(
      `submissions/artists?page=${page}${open ? '&open=true' : ''}${
        artistId ? '&artistId=' + artistId : ''
      }${userId ? '&userId=' + userId : ''}`,
    )
    .then((res) => res.data);
const getLabelSubmissions = ({
  page,
  open,
  labelId,
  userId,
}: FindLabelSubmissionsDto) =>
  client
    .get(
      `submissions/labels?page=${page}${open ? '&open=true' : ''}${
        labelId ? '&labelId=' + labelId : ''
      }${userId ? '&userId=' + userId : ''}`,
    )
    .then((res) => res.data);

const releaseSubmissionVote = ({
  submissionId,
  vote,
}: {
  submissionId: string;
  vote: VoteType;
}) =>
  client
    .patch('submissions/releases/vote/' + submissionId, { vote })
    .then((res) => res.data);

// ----------------
//     GENRES
// ----------------
const getReleaseGenres = (releaseId: string) =>
  client
    .get<IReleaseGenre[]>('genres/release/' + releaseId)
    .then((res) => res.data);

const createReleaseGenreVote = (data: CreateGenreVoteDto) =>
  client.post('genres/rg', data).then((res) => res.data);

const removeReleaseGenreVote = ({ id }: { id: string }) =>
  client.delete('genres/rg/' + id).then((res) => res.data);

// ----------------
//     AUTOFILL
// ----------------
const getSpotifyRelease = (id: string) =>
  client
    .get<IAutofillRelease>('autofill/spotify/' + id)
    .then((res) => res.data);

const getMusicBrainzRelease = (id: string) =>
  client
    .get<IAutofillRelease>('autofill/musicbrainz/' + id)
    .then((res) => res.data);

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
    .get<ISearchResponse>(
      'search?q=' +
        q +
        '&type=' +
        type.join('&type=') +
        '&page=' +
        page +
        '&pageSize=' +
        pageSize,
    )
    .then((res) => res.data);
};
// ----------------
//     USERS
// ----------------
const getCurrentUser = () =>
  client.get<ICurrentUserResponse>('users/me').then((res) => res.data);
const getUserProfile = (username: string) =>
  client
    .get<IUserProfileResponse>('users/username/' + username)
    .then((res) => res.data);
const getUserFollowers = (id: string) =>
  client
    .get<IUserFollowsResponse>('users/' + id + '/followers/')
    .then((res) => res.data);
const getUserFollowing = (id: string) =>
  client
    .get<IUserFollowsResponse>('users/' + id + '/following/')
    .then((res) => res.data);
const updateProfile = ({
  id,
  ...data
}: {
  id: string;
  username: string;
  name: string;
  bio?: string;
}) =>
  client.patch('users/' + id + '/update-profile', data).then((res) => res.data);
const updateImage = ({ id, image }: { id: string; image }) =>
  client
    .patch(
      'users/' + id + '/update-image',
      { image },
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    .then((res) => res.data);
const follow = ({ id }: { id: string }) =>
  client.post('users/' + id + '/following').then((res) => res.data);
const unFollow = ({ id }: { id: string }) =>
  client.delete('users/' + id + '/following').then((res) => res.data);

const report = (report: CreateReportDto) =>
  client.post('reports', report).then((res) => res.data);

export const api = {
  getArtist,
  createArtist,
  createLabel,
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
  createReviewComment,
  removeReviewComment,
  getReviewComments,
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
  createListComment,
  removeListComment,
  getListComments,
  getReleaseLists,
  getUserLists,
  getNewLists,
  getPopularLists,
  getReleaseInMyLists,
  getRelease,
  getNewReleases,
  getRecentlyAddedReleases,
  getPopularReleases,
  getTopReleases,
  createRelease,
  updateRelease,
  getReleaseSubmissions,
  getArtistSubmissions,
  getLabelSubmissions,
  releaseSubmissionVote,
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
  updateImage,
  follow,
  unFollow,
  report,
};
