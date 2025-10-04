import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  registerDecorator,
  ValidateNested,
  ValidationOptions,
} from 'class-validator';
import dayjs from 'dayjs';
import {
  CommentEntityType,
  ContributorStatus,
  EntriesSortByEnum,
  ExplicitCoverArt,
  FindReleasesType,
  FindUsersType,
  ReleaseType,
  ReportType,
  SubmissionSortByEnum,
  SubmissionStatus,
  SupporterStatus,
  VoteType,
} from './enums';

export function IsDayjsDateString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDayjsDateString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value, args) {
          return typeof value === 'string' && dayjs(value).isValid();
        },
        defaultMessage(args) {
          return `"${args?.property}" must be a valid date string`;
        },
      },
    });
  };
}

export function IsValidColor(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidColor',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value, args) {
          return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
        },
        defaultMessage(args) {
          return `"${args?.property}" must be a valid hex color string`;
        },
      },
    });
  };
}

function isValidHttpUrl(string: string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url;
}

class TrackDto {
  @IsString()
  @IsOptional()
  id?: string;
  @IsString()
  @MinLength(1)
  track: string;
  @IsString()
  @MinLength(1)
  title: string;
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  durationMs?: number;
}

export class CreateReleaseDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  titleLatin?: string;

  @ArrayMinSize(1)
  @IsString({ each: true })
  artistsIds: string[];
  @IsString()
  @MinLength(1)
  type: string;
  @IsOptional()
  @IsDayjsDateString()
  date?: string;
  @IsOptional()
  @IsString({ each: true })
  labelsIds?: string[];
  @IsOptional()
  @IsString({ each: true })
  languagesIds?: string[];
  @IsOptional()
  @Type(() => Object)
  image?: any;
  @IsOptional()
  @IsString()
  imageUrl?: string;
  @IsOptional()
  @IsEnum(ExplicitCoverArt, { each: true })
  explicitCoverArt?: ExplicitCoverArt[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  tracks?: TrackDto[];
  @IsString()
  @MinLength(1)
  note: string;
}

export class UpdateReleaseDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  titleLatin?: string;

  @IsString({ each: true })
  artistsIds: string[];
  @IsString()
  type?: string;
  @IsOptional()
  @IsDayjsDateString()
  date?: string;
  @IsOptional()
  @IsString({ each: true })
  labelsIds?: string[];
  @IsOptional()
  @IsString({ each: true })
  languagesIds?: string[];
  @IsOptional()
  @Type(() => Object)
  image?: any;
  @IsOptional()
  @IsString()
  imageUrl?: string;
  @IsOptional()
  @IsEnum(ExplicitCoverArt, { each: true })
  explicitCoverArt?: ExplicitCoverArt[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackDto)
  tracks?: TrackDto[];
  @IsString()
  @MinLength(1)
  note?: string;
}

export class CreateArtistDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;
}

export class UpdateArtistDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;

  @IsString()
  @MinLength(1)
  note: string;
}

export class CreateLabelDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;
}

export class UpdateLabelDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsOptional()
  nameLatin?: string;

  @IsString()
  @MinLength(1)
  note: string;
}

export class CreateGenreDto {
  @IsString()
  @MinLength(1)
  name: string;
  @IsString()
  @MinLength(1)
  bio: string;
  @IsString()
  @MinLength(1)
  note: string;
}

export class UpdateGenreDto {
  @IsString()
  @MinLength(1)
  name: string;
  @IsString()
  @MinLength(1)
  bio: string;
  @IsString()
  @MinLength(1)
  note: string;
}

export class FindReleasesDto {
  @IsString()
  @IsEnum(FindReleasesType)
  type: FindReleasesType;
  @Type(() => Number)
  @IsInt()
  page: number;
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number;
  @IsOptional()
  @IsString()
  genreId?: string;
  @IsOptional()
  @IsString()
  labelId?: string;
}

// --- USER

export class LoginDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
}

export class SignupDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9-_\.]+$/, {
    message:
      'Username can only contain letters, numbers, dashes, underscores, and periods, and should not contain spaces.',
  })
  username: string;
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserProfileDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9-_\.]+$/, {
    message:
      'Username can only contain letters, numbers, dashes, underscores, and periods, and should not contain spaces.',
  })
  username: string;
  @IsString()
  @MinLength(1)
  name: string;
  bio?: string;
}

export class UpdateUserPreferencesDto {
  @IsEnum(ExplicitCoverArt, { each: true })
  allowExplicitCoverArt: ExplicitCoverArt[];
}

export class UpdateUserThemeDto {
  @IsValidColor()
  background: string;
  @IsValidColor()
  background_sub: string;
  @IsValidColor()
  primary: string;
  @IsValidColor()
  highlight: string;
  @IsValidColor()
  text: string;
  @IsValidColor()
  text_sub: string;
  @IsValidColor()
  error: string;
}

export class UpdateUserContributorStatusDto {
  @IsString()
  userId: string;

  @Type(() => Number)
  @IsEnum(ContributorStatus)
  status: ContributorStatus;
}

export class UpdateUserSupporterStatusDto {
  @IsString()
  userId: string;
  @Type(() => Number)
  @IsEnum(SupporterStatus)
  supporter: SupporterStatus;
}

export class FindUsersDto {
  @IsString()
  @IsEnum(FindUsersType)
  type: FindUsersType;
}

// --- LISTS

export class CreateListDto {
  @IsString()
  @MinLength(1)
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  grid: boolean;
  ranked: boolean;
}

export class UpdateListDto {
  @IsString()
  @MinLength(1)
  title: string;
  @IsOptional()
  @IsString()
  description?: string;
  grid: boolean;
  ranked: boolean;
}

export class FindListsDto {
  sortBy: 'date' | 'popular' | 'updatedDate';
  userId?: string;
  releaseId?: string;
  @Type(() => Number)
  @IsInt()
  page: number;
}

// --- entries

export class CreateEntryDto {
  @IsString()
  releaseId: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  rating?: number;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateEntryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  rating?: number;

  @IsOptional()
  @IsString()
  review?: string;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}

export class FindEntriesDto {
  releaseId?: string;
  userId?: string;
  withReview?: boolean;

  @IsEnum(EntriesSortByEnum)
  sortBy: EntriesSortByEnum;

  // user filters
  year?: string;
  decade?: string;
  bucket?: string;
  genre?: string;
  artist?: string;
  label?: string;
  tag?: string;

  @IsOptional()
  @Type(() => Number)
  @IsEnum(ReleaseType)
  type?: number;

  @Type(() => Number)
  @IsInt()
  page: number;

  @Type(() => Number)
  @IsInt()
  pageSize: number;
}

export class ReviewVoteDto {
  @Type(() => Number)
  @IsEnum(VoteType)
  vote: VoteType;
}

export class TrackVoteDto {
  @Type(() => Number)
  @IsEnum(VoteType)
  vote: VoteType;
}

// -- SUBMISSIONS

export class FindReleaseSubmissionsDto {
  @IsOptional()
  @IsString()
  userId?: string;
  @IsOptional()
  @IsString()
  releaseId?: string;
  @IsOptional()
  @Type(() => Number)
  @IsEnum(SubmissionStatus)
  status?: number;
  @IsOptional()
  @IsEnum(SubmissionSortByEnum)
  sortBy?: SubmissionSortByEnum;
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class FindArtistSubmissionsDto {
  @IsOptional()
  @IsString()
  userId?: string;
  @IsOptional()
  @IsString()
  artistId?: string;
  @IsOptional()
  @Type(() => Number)
  @IsEnum(SubmissionStatus)
  status?: number;
  @IsOptional()
  @IsEnum(SubmissionSortByEnum)
  sortBy?: SubmissionSortByEnum;
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class FindLabelSubmissionsDto {
  @IsOptional()
  @IsString()
  userId?: string;
  @IsOptional()
  @IsString()
  labelId?: string;
  @IsOptional()
  @Type(() => Number)
  @IsEnum(SubmissionStatus)
  status?: number;
  @IsOptional()
  @IsEnum(SubmissionSortByEnum)
  sortBy?: SubmissionSortByEnum;
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class FindGenreSubmissionsDto {
  @IsOptional()
  @IsString()
  userId?: string;
  @IsOptional()
  @IsString()
  genreId?: string;
  @IsOptional()
  @Type(() => Number)
  @IsEnum(SubmissionStatus)
  status?: number;
  @IsOptional()
  @IsEnum(SubmissionSortByEnum)
  sortBy?: SubmissionSortByEnum;
  @Type(() => Number)
  @IsInt()
  page: number;
}

export class ProcessPendingDeletionDto {
  @IsOptional()
  @IsString({ each: true })
  releaseSubmissionIds?: string[];
  @IsOptional()
  @IsString({ each: true })
  labelSubmissionIds?: string[];
  @IsOptional()
  @IsString({ each: true })
  artistSubmissionIds?: string[];
}

export class SubmissionVoteDto {
  @Type(() => Number)
  @IsEnum(VoteType)
  vote: VoteType;
}

// -- GENRES

export class CreateGenreVoteDto {
  genreId: string;
  releaseId: string;
  @Type(() => Number)
  @IsEnum(VoteType)
  voteType: VoteType;
}

// --- REPORTS

export class CreateReportDto {
  @IsString()
  @MinLength(1)
  reason: string;
  @IsString()
  @IsEnum(ReportType)
  type: ReportType;
  @IsString()
  @MinLength(1)
  id: string;
}

// --- COMMENTS

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  body: string;
  @IsString()
  @MinLength(1)
  entityId: string;
  @Type(() => Number)
  @IsEnum(CommentEntityType)
  entityType: CommentEntityType;
}

export class FindCommentsDto {
  @Type(() => Number)
  @IsEnum(CommentEntityType)
  entityType: CommentEntityType;
  @IsString()
  @MinLength(1)
  entityId: string;
  @Type(() => Number)
  @IsInt()
  page: number;
}
