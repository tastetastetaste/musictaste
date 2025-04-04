import { IArtistSummary } from 'shared';

export const getReviewPathname = (entryId: string) => `/review/${entryId}`;
export const getListPathname = (listId: string) => `/list/${listId}`;
export const getReleasePathname = (releaseId: string) =>
  `/release/${releaseId}`;
export const getArtistPathname = (artistId: string) => `/artist/${artistId}`;
export const getUserPathname = (username: string) => `/${username}`;
