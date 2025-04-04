export enum VoteType {
  DOWN = -1,
  UP = 1,
}

export enum ReleaseType {
  LP = 1,
  EP = 2,
  Mixtape = 3,
  Single = 4,
  Live = 5,
  Remix = 6,
  Instrumental = 7,
  Compilation = 8,
  Cover = 9,
  Soundtrack = 10,
  DJ = 11,
  Mix = 12,
  Unofficial = 13,
  Video = 14,
  Reissue = 15,
}

export enum SubmissionStatus {
  AUTO_APPROVED = 1, // for adding music data (open, applied)
  OPEN = 2, // for edits (open, unapplied)
  APPROVED = 3, // closed, applied
  DISAPPROVED = 4, // closed, unapplied
}

export enum SubmissionType {
  CREATE = 1,
  UPDATE = 2,
}

export enum ContributorStatus {
  NOT_A_CONTRIBUTOR = 0,
  CONTRIBUTOR = 20,
  TRUSTED_CONTRIBUTOR = 40,
  EDITOR = 60,
  ADMIN = 80,
}

// other enums

export enum EntriesSortByEnum {
  // reviews
  ReviewDate = 'ReviewDate',
  ReviewTop = 'ReviewTop',
  // ratings
  RatingDate = 'RatingDate',
  RatingHighToLow = 'RatingHighToLow',
  RatingLowToHigh = 'RatingLowToHigh',
  // entries
  EntryDate = 'EntryDate',
  ReleaseDate = 'ReleaseDate',
}
