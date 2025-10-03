export const getReviewPath = ({ entryId }: { entryId: string }) =>
  `/review/${entryId}`;
export const getListPath = ({ listId }: { listId: string }) =>
  `/list/${listId}`;
export const getReleasePath = ({ releaseId }: { releaseId: string }) =>
  `/release/${releaseId}`;
export const getArtistPath = ({ artistId }: { artistId: string }) =>
  `/artist/${artistId}`;
export const getLabelPath = ({ labelId }: { labelId: string }) =>
  `/label/${labelId}`;
export const getGenrePath = ({ genreId }: { genreId: string }) =>
  `/genre/${genreId}`;
export const getUserPath = ({ username }: { username: string }) =>
  `/${username}`;
