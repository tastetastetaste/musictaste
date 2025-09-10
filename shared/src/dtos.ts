import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsIn,
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
import {
  EntriesSortByEnum,
  SubmissionStatus,
  VoteType,
  ReleaseType,
  FindReleasesType,
} from './enums';
import dayjs from 'dayjs';

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
          return `${args?.property} must be a valid date string`;
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
}

export class CreateLabelDto {
  @IsString()
  @MinLength(1)
  name: string;
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

export class CreateReviewCommentDto {
  reviewId: string;
  body: string;
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

export class FindReviewCommentsDto {
  reviewId: string;
  @Type(() => Number)
  @IsInt()
  page: number;
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
  type: string;
  id: string;
}
