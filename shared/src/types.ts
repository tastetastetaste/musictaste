import { ContributorStatus, VoteType } from './enums';

export interface IArtistSummary {
  id: string;
  name: string;
}

export interface IArtist {
  id: string;
  name: string;
}

export interface IArtistResponse {
  artist: IArtist;
  releases: IRelease[];
}

export interface IList {
  id: string;
  title: string;
  description: string;
  ranked: boolean;
  grid: boolean;
  published: boolean;
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
  listItemsCount: number;
  likesCount: number;
  commentsCount: number;
  cover: string[];
  userId: string;
  user: IUser;
}

export interface IListItem {
  id: string;
  index: number;
  note: string;
  release: IRelease;
}

export interface IListComment {
  id: string;
  body: string;
  user: IUser;
  createdAt: string;
}

export interface IListResponse {
  list: IList & {
    likedByMe: boolean;
  };
}

export interface IListsResponse extends IPagination {
  lists: IList[];
}

export interface IListItemsResponse extends IPagination {
  items: IListItem[];
}
export interface IListCommentsResponse extends IPagination {
  comments: IListComment[];
}

export interface IGenreVote {
  id: string;
  type: VoteType;
  userId: string;
  user: IUserSummary;
}

export interface IReleaseGenre {
  id: string;
  valid: boolean;
  genre: IGenreSummary;
  genreVotes: IGenreVote[];
}

export interface ILabel {
  id: string;
  name: string;
}

export interface ILabelResponse {
  label: ILabel;
  releases: IRelease[];
}

export interface ILanguage {
  id: string;
  name: string;
}
export interface IReleasePalette {
  vibrant: string;
  darkVibrant: string;
  lightVibrant: string;
  muted: string;
  darkMuted: string;
  lightMuted: string;
}

export interface IReleaseCover {
  lg: string;
  md: string;
  sm: string;
  original: string;
}

export interface IReleaseStats {
  entriesCount: number;
  ratingsCount: number;
  ratingsAvg: number;
  reviewsCount: number;
}

export interface IReleaseSummary {
  id: string;
  title: string;
  cover?: IReleaseCover;
  artists: IArtistSummary[];
}

export interface IRelease extends IReleaseSummary {
  type: string;
  date: string;
}

export interface IReleaseWithStats extends IRelease {
  stats: IReleaseStats;
}

export interface IReleaseFullInfo extends IReleaseWithStats {
  labels: ILabel[];
  languages: ILanguage[];
  genres: IGenreSummary[];
}

export interface IReleasesResponse extends IPagination {
  releases: IRelease[];
}

export interface IReleaseResponse {
  release: IReleaseFullInfo;
  tracks: ITrackWithVotes[];
  contributors: IUser[];
}

export interface IReviewComment {
  id: string;
  body: string;
  user: IUser;
  createdAt: string;
}
export interface IReviewCommentsResponse extends IPagination {
  comments: IReviewComment[];
}

export interface IEntry {
  id: string;
  userId: string;
  releaseId: string;
  ratingId: string;
  reviewId: string;
  hasTrackVotes: boolean;
  rating?: IRating;

  user?: IUser | null;
  release?: IRelease | null;
  review?: IReview | null;
  trackVotes?: ITrackVote[] | null;
  tags?: IEntryTag[] | null;
}

export interface IEntriesResponse extends IPagination {
  entries: IEntry[];
}

export interface IEntryResonse {
  entry: IEntry;
}

export type SearchType = 'releases' | 'artists' | 'genres' | 'labels' | 'users';

export interface ISearchResponse {
  artists?: IArtistSummary[];
  artistsCount?: number;
  releases?: IReleaseSummary[];
  releasesCount?: number;
  users?: IUserSummary[];
  usersCount?: number;
  genres?: IGenreSummary[];
  genresCount?: number;
  labels?: ILabelSummary[];
  labelsCount?: number;
}

export interface IUserSummary {
  id: string;
  username: string;
  name: string;
  image?: IUserImage;
}

export interface IUser {
  id: string;
  name: string;
  username: string;
  image?: IUserImage;
  bio?: string;
}

export interface IUserImage {
  md: string;
  sm: string;
  original: string;
}

export interface ICurrentUserResponse {
  user: IUser & {
    confirmed: boolean;
    contributorStatus: ContributorStatus;
  };
}

export interface IUserStats {
  entriesCount: number;
  ratingsCount: number;
  reviewsCount: number;
  followersCount: number;
  followingCount: number;
  listsCount: number; // public lists
}

export interface IUserProfileResponse {
  user: IUser;
  stats: IUserStats;
  following: boolean;
  followedBy: boolean;
}

export interface IUserFollowsResponse {
  users: IUser[];
}

export interface IUserArtist {
  id: string;
  name: string;
  count: number;
}

export interface IUserRatingBucket {
  bucket: number;
  count: number;
}

export interface IUserGenre {
  id: string;
  name: string;
  count: number;
}

export interface IUserLabel {
  id: string;
  name: string;
  count: number;
}

export interface IUserReleaseDate {
  decade: number;
  year: number;
  count: number;
}

export interface IUserTag {
  id: string;
  tag: string;
  count: number;
}

export interface IReview {
  id: string;
  body: string;
  totalVotes: number;
  netVotes: number;
  commentsCount: number;
  userVote: VoteType;
  createdAt: string;
  updatedAt: string;
}

export interface IRating {
  id: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ITrack {
  id: string;
  track: string;
  title: string;
  order: number;
  durationMs?: any;
}

export interface ITrackWithVotes extends ITrack {
  upvotes: number;
  downvotes: number;
}

export interface ITrackVote {
  trackId: string;
  vote: VoteType;
  track: ITrack;
}

export interface IEntryTag {
  id: string;
  tag: string;
}

export interface IPagination {
  totalPages: number;
  currentPage: number;
  totalItems: number;
  currentItems: number;
  itemsPerPage: number;
}

export interface ILabelSummary {
  id: string;
  name: string;
}

export interface IGenreSummary {
  id: string;
  name: string;
}

export interface ICreateReleaseResponse {
  message: string;
  release: IReleaseSummary;
  limitReached: boolean;
}

export interface IUpdateReleaseResponse {
  message: string;
}

export interface ICreateArtistResponse {
  message: string;
  artist: IArtistSummary;
  limitReached: boolean;
}

export interface ICreateLabelResponse {
  message: string;
  label: ILabelSummary;
  limitReached: boolean;
}

export interface IReleaseSubmission {
  id: string;
  userId: string;
  releaseId: string;
  title: string;
  type: string;
  date: any;
  artists: IArtistSummary[];
  labels: ILabelSummary[];
  languages: ILanguage[];
  imageUrl: string;
  tracks: { track: string; title: string; durationMs?: number }[];
  submissionType: any;
  submissionStatus: any;
  user: IUserSummary;
}
export interface IArtistSubmission {
  id: string;
  userId: string;
  artistId: string;
  name: string;
  submissionType: any;
  submissionStatus: any;
  user: IUserSummary;
}
export interface ILabelSubmission {
  id: string;
  userId: string;
  labelId: string;
  name: string;
  submissionType: any;
  submissionStatus: any;
  user: IUserSummary;
}
export interface IReleaseSubmissionsResponse extends IPagination {
  releases: IReleaseSubmission[];
}
export interface IArtistSubmissionsResponse extends IPagination {
  artists: IArtistSubmission[];
}
export interface ILabelSubmissionsResponse extends IPagination {
  labels: ILabelSubmission[];
}
export interface IAutofillRelease {
  id: string;
  imageUrl: string;
  artists: { name: string }[];
  labels: { name: string }[];
  title: string;
  type: string;
  date: string;
  tracks: any;
}
