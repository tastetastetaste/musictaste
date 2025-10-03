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
  DJMix = 11,
  Unofficial = 13,
  Video = 14,
  Reissue = 15,
  Other = 25,
}

export enum ExplicitCoverArt {
  NUDITY = 'NUDITY',
  EXPLICIT_SEXUAL_CONTENT = 'EXPLICIT_SEXUAL_CONTENT',
  BLOOD_GORE = 'BLOOD_GORE',
  EXPLICIT_HATEFUL_CONTENT = 'EXPLICIT_HATEFUL_CONTENT',
}

export enum SubmissionStatus {
  AUTO_APPROVED = 1, // for adding music data (open, applied)
  OPEN = 2, // for edits (open, unapplied)
  APPROVED = 3, // closed, applied
  DISAPPROVED = 4, // closed, unapplied
  PENDING_ENTITY_DELETION = 5, // An AUTO_APPROVED CREATE submission has been disapproved and the linked entity is now pending hard deletion.
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

export enum SupporterStatus {
  NOT_A_SUPPORTER = 0,
  SUPPORTER = 10,
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

export enum FindReleasesType {
  New = 'new',
  NewPopular = 'new-popular',
  Popular = 'popular',
  Upcoming = 'upcoming',
  Recent = 'recent',
  Top = 'top',
  TopOTY = 'top-oty',
}

export enum FindUsersType {
  Supporter = 'supporter',
  Trusted = 'trusted',
}

export enum SubmissionSortByEnum {
  Newest = 'newest',
  Oldest = 'oldest',
}

export enum ReportType {
  RELEASE = 'release',
  ARTIST = 'artist',
  LABEL = 'label',
  USER = 'user',
  REVIEW = 'review',
  LIST = 'list',
  COMMENT = 'comment',
}

// Entities
export enum EntityType {
  USER = 10,
  REVIEW = 11,
  LIST = 12,
  RELEASE = 20,
  RELEASE_TRACK = 21,
}

// Comments

export enum CommentEntityType {
  SHOUTBOX = EntityType.USER,
  REVIEW = EntityType.REVIEW,
  LIST = EntityType.LIST,
  RELEASE = EntityType.RELEASE,
  RELEASE_TRACK = EntityType.RELEASE_TRACK,
}

// Notifications

export enum NotificationType {
  FOLLOW = 10,
  COMMENT = 20,
  MENTION = 30,
}
