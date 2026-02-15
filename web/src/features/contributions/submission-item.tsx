import { useTheme } from '@emotion/react';
import {
  IconArrowBigDown,
  IconArrowBigUp,
  IconMessage,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { Fragment } from 'react';
import {
  getArtistSubmissionPath,
  getGenreSubmissionPath,
  getLabelSubmissionPath,
  getReleaseSubmissionPath,
  IArtistSubmission,
  IGenreSubmission,
  ILabelSubmission,
  IReleaseChanges,
  IReleaseSubmission,
  SubmissionStatus,
  VoteType,
} from 'shared';
import { Group } from '../../components/flex/group';
import { IconButton } from '../../components/icon-button';
import { Link } from '../../components/links/link';
import { useAuth } from '../account/useAuth';
import { millisecondsToTimeString } from './release-tracks-fields';

import styled from '@emotion/styled';
import dayjs from 'dayjs';
import { Button } from '../../components/button';
import { FlexChild } from '../../components/flex/flex-child';
import { cacheKeys } from '../../utils/cache-keys';
import { User } from '../users/user';
import { Typography } from '../../components/typography';
import { formatDateTime } from '../../utils/date-format';
import { Stack } from '../../components/flex/stack';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const FieldContainer = styled.div`
  display: flex;
  gap: 8px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  flex-wrap: wrap;
`;

const Field = styled.div<{ changed?: boolean }>`
  flex: 1 1 0;
  padding: 8px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  border: ${(props) =>
    props.changed ? `2px solid ${props.theme.colors.highlight}` : 'none'};
`;

const FieldLabel = styled.span`
  font-weight: 600;
  margin-right: 5px;
  color: ${({ theme }) => theme.colors.text_sub};
`;

const TrackField = styled.div<{
  changed?: boolean;
  deleted?: boolean;
  added?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  padding: 6px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  border: ${({ changed, deleted, added, theme }) =>
    deleted
      ? `2px solid ${theme.colors.error}`
      : added
        ? `2px solid ${theme.colors.highlight}`
        : changed
          ? `2px solid ${theme.colors.primary}`
          : 'none'};
`;

export const ImagePreview = styled.img`
  width: 300px;
  max-width: 100%;
  object-fit: cover;
`;

const isEmptyValue = (v: any) => {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
};

const isPlainObject = (v: any): v is Record<string, any> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

const isEmpty = (v: any) => v === null || v === undefined || v === '';

const hasChanges = (original: any, updated: any): boolean => {
  if (original === updated) return false;
  if (isEmpty(original) && isEmpty(updated)) return false;
  if (Array.isArray(original) && Array.isArray(updated)) {
    if (original.length !== updated.length) return true;
    return original.some((item, index) => hasChanges(item, updated[index]));
  }
  if (isPlainObject(original) && isPlainObject(updated)) {
    const keys = new Set([...Object.keys(original), ...Object.keys(updated)]);
    return Array.from(keys).some((key) =>
      hasChanges(original[key], updated[key]),
    );
  }
  // check if equal but different types
  if (typeof original === 'string' && typeof updated === 'number') {
    return Number(original) !== updated;
  }
  if (typeof original === 'number' && typeof updated === 'string') {
    return original !== Number(updated);
  }
  return original !== updated;
};

export const SubmissionField: React.FC<{
  label: string;
  originalValue?: any;
  changedValue?: any;
  showOriginal?: boolean;
  renderValue: (value: any) => React.ReactNode;
}> = ({
  label,
  originalValue,
  changedValue,
  showOriginal = false,
  renderValue,
}) => {
  const changed = showOriginal
    ? hasChanges(originalValue, changedValue)
    : false;

  const EmptyPlaceholder = <span></span>;

  if (!showOriginal) {
    const singleCellContent = isEmptyValue(changedValue)
      ? EmptyPlaceholder
      : renderValue(changedValue);
    return (
      <FieldContainer>
        <Field>
          <FieldLabel>{label}:</FieldLabel> {singleCellContent}
        </Field>
      </FieldContainer>
    );
  }

  return (
    <FieldContainer>
      <Field changed={changed}>
        <FieldLabel>{label}:</FieldLabel>{' '}
        {isEmptyValue(originalValue)
          ? EmptyPlaceholder
          : renderValue(originalValue)}
      </Field>

      <Field changed={changed}>
        <FieldLabel>{label}:</FieldLabel>{' '}
        {isEmptyValue(changedValue)
          ? EmptyPlaceholder
          : renderValue(changedValue)}
      </Field>
    </FieldContainer>
  );
};

export const TracksComparisonField: React.FC<{
  originalTracks?: IReleaseChanges['tracks'];
  changedTracks?: IReleaseChanges['tracks'];
  showOriginal?: boolean;
}> = ({ originalTracks = [], changedTracks = [], showOriginal = false }) => {
  const EmptyPlaceholder = <span aria-hidden>—</span>;

  if (!showOriginal) {
    if (!changedTracks || changedTracks.length === 0) {
      return (
        <FieldContainer>
          <Field>
            <FieldLabel>Tracks:</FieldLabel> {EmptyPlaceholder}
          </Field>
        </FieldContainer>
      );
    }

    return (
      <FieldContainer>
        <Field>
          <FieldLabel>Tracks:</FieldLabel>
          {changedTracks.map((t, index) => (
            <TrackField key={index}>
              <span>
                {t.track} | {t.title}
              </span>
              <span>{millisecondsToTimeString(t.durationMs)}</span>
            </TrackField>
          ))}
        </Field>
      </FieldContainer>
    );
  }

  return (
    <FieldContainer>
      <Field>
        <FieldLabel>Tracks:</FieldLabel>
        {originalTracks.map((originalTrack, i) => {
          const changedTrack = originalTrack.id
            ? changedTracks.find((t) => t.id === originalTrack.id)
            : null;

          const deleted = !changedTrack;

          const changed =
            changedTrack && hasChanges(originalTrack || {}, changedTrack || {});

          return (
            <TrackField
              key={originalTrack.id}
              deleted={deleted}
              changed={changed}
            >
              <span>
                {originalTrack
                  ? `${originalTrack.id ? `${originalTrack.id} | ` : ''}${originalTrack.track} | ${originalTrack.title}`
                  : EmptyPlaceholder}
              </span>
              <span>
                {originalTrack
                  ? millisecondsToTimeString(originalTrack.durationMs)
                  : ''}
              </span>
            </TrackField>
          );
        })}
      </Field>

      <Field>
        <FieldLabel>Tracks:</FieldLabel>
        {changedTracks.map((changedTrack, i) => {
          const originalTrack = changedTrack.id
            ? originalTracks.find((t) => t.id === changedTrack.id)
            : null;

          const added = !changedTrack.id || !originalTrack;

          const changed =
            originalTrack && hasChanges(originalTrack, changedTrack);

          return (
            <TrackField key={i} changed={changed} added={added}>
              <span>
                {changedTrack
                  ? `${changedTrack.id ? `${changedTrack.id} | ` : ''}${changedTrack.track} | ${changedTrack.title}`
                  : EmptyPlaceholder}
              </span>
              <span>
                {changedTrack
                  ? millisecondsToTimeString(changedTrack.durationMs)
                  : ''}
              </span>
            </TrackField>
          );
        })}
      </Field>
    </FieldContainer>
  );
};

interface SubmissionActionsProps {
  id: string;
  status: SubmissionStatus;
  voteFn: (params: { submissionId: string; vote: VoteType }) => Promise<any>;
}

export const SubmissionActions = ({
  id,
  status,
  voteFn,
}: SubmissionActionsProps) => {
  const { canVoteOnSubmissions } = useAuth();
  const { mutateAsync: vote, data, isLoading } = useMutation(voteFn);

  if (
    !canVoteOnSubmissions ||
    !(
      status === SubmissionStatus.OPEN ||
      status === SubmissionStatus.AUTO_APPROVED
    )
  )
    return <div></div>;

  return (
    <Fragment>
      {data ? (
        <span>Ok</span>
      ) : (
        <Group gap="lg">
          <IconButton
            title="Vote Up"
            onClick={() => vote({ submissionId: id, vote: VoteType.UP })}
            disabled={isLoading}
          >
            <IconArrowBigUp />
          </IconButton>
          <IconButton
            title="Vote Down"
            onClick={() => vote({ submissionId: id, vote: VoteType.DOWN })}
            disabled={isLoading}
          >
            <IconArrowBigDown />
          </IconButton>
        </Group>
      )}
      {isLoading && <span>loading..</span>}
    </Fragment>
  );
};

export type DiscardSubmissionFn = (submissionId: string) => Promise<void>;

interface SubmissionItemWrapperProps {
  children: React.ReactElement | React.ReactElement[];
  link?: string;
  voteFn: (params: { submissionId: string; vote: VoteType }) => Promise<any>;
  hideUser?: boolean;
  submission:
    | IArtistSubmission
    | ILabelSubmission
    | IReleaseSubmission
    | IGenreSubmission;
  submissionType: 'artist' | 'label' | 'release' | 'genre';
  fullPage?: boolean;
}

export const SubmissionItemWrapper = ({
  children,
  link,
  voteFn,
  hideUser,
  submission,
  submissionType,
  fullPage,
}: SubmissionItemWrapperProps) => {
  const { colors } = useTheme();
  const { me } = useAuth();
  const qc = useQueryClient();

  const navigate = useNavigate();

  const color =
    submission.submissionStatus === SubmissionStatus['DISAPPROVED']
      ? colors.error
      : submission.submissionStatus === SubmissionStatus['APPROVED']
        ? colors.highlight
        : colors.text;

  const { mutateAsync: discardReleaseSubmissionFn } = useMutation(
    api.discardMyReleaseSubmission,
  );

  const { mutateAsync: discardArtistSubmissionFn } = useMutation(
    api.discardMyArtistSubmission,
  );
  const { mutateAsync: discardLabelSubmissionFn } = useMutation(
    api.discardMyLabelSubmission,
  );
  const { mutateAsync: discardGenreSubmissionFn } = useMutation(
    api.discardMyGenreSubmission,
  );

  const handleDiscard = async () => {
    const confirmed = confirm(
      'Are you sure you want to discard this contribution?',
    );

    if (!confirmed) return;

    if (submissionType === 'release') {
      await discardReleaseSubmissionFn(submission.id);
      qc.resetQueries(cacheKeys.releaseSubmissionsKey());
    } else if (submissionType === 'artist') {
      await discardArtistSubmissionFn(submission.id);
      qc.resetQueries(cacheKeys.artistSubmissionsKey());
    } else if (submissionType === 'label') {
      await discardLabelSubmissionFn(submission.id);
      qc.resetQueries(cacheKeys.labelSubmissionsKey());
    } else if (submissionType === 'genre') {
      await discardGenreSubmissionFn(submission.id);
      qc.resetQueries(cacheKeys.genreSubmissionsKey());
    }
  };

  const submissionLink =
    submissionType === 'release'
      ? getReleaseSubmissionPath({ releaseSubmissionId: submission.id })
      : submissionType === 'artist'
        ? getArtistSubmissionPath({ artistSubmissionId: submission.id })
        : submissionType === 'label'
          ? getLabelSubmissionPath({ labelSubmissionId: submission.id })
          : submissionType === 'genre'
            ? getGenreSubmissionPath({ genreSubmissionId: submission.id })
            : null;

  return (
    <div
      css={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        marginBottom: '6px',
        backgroundColor: theme.colors.background_sub,
        borderRadius: theme.border_radius.base,
      })}
    >
      {link && (
        <FlexChild align="flex-end">
          <Link to={link}>Link</Link>
        </FlexChild>
      )}
      <div>{children}</div>
      <Group justify="apart" wrap>
        <Group align="center" gap="lg">
          {submission.userId !== me.id &&
            !submission.votes.some((v) => v.userId === me.id) && (
              <SubmissionActions
                id={submission.id}
                status={submission.submissionStatus}
                voteFn={voteFn}
              />
            )}

          {!fullPage ? (
            <IconButton
              title="Comments"
              num={Number(submission.commentsCount)}
              onClick={() => navigate(submissionLink)}
              active={Number(submission.commentsCount) > 0}
            >
              <IconMessage />
            </IconButton>
          ) : null}

          <div
            css={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${color}`,
              borderRadius: theme.border_radius.base,
              width: '100px',
              margin: '16px 0',
            })}
          >
            <span
              css={(theme) => ({
                color: color,
                fontSize: theme.font.size.small,
              })}
            >
              {SubmissionStatus[submission.submissionStatus]}
            </span>
          </div>
        </Group>
        {!hideUser && <User user={submission.user} />}
      </Group>
      <Group justify="apart">
        <Stack>
          <Group wrap>
            {submission.votes.map((v) => (
              <Fragment>
                <User user={v.user} avatarOnly />
                {v.type === VoteType.UP ? (
                  <IconArrowBigUp
                    css={({ colors }) => ({ color: colors.highlight })}
                  />
                ) : (
                  <IconArrowBigDown
                    css={({ colors }) => ({ color: colors.error })}
                  />
                )}
              </Fragment>
            ))}
          </Group>
        </Stack>
        <Group gap="md">
          <Typography>{formatDateTime(submission.createdAt)}</Typography>
          {me?.id === submission.user.id &&
            !submission.votes.length &&
            dayjs().diff(submission.createdAt, 'hour') < 1 &&
            (submission.submissionStatus === SubmissionStatus.OPEN ||
              submission.submissionStatus ===
                SubmissionStatus.AUTO_APPROVED) && (
              <Button danger onClick={handleDiscard}>
                Discard
              </Button>
            )}
        </Group>
      </Group>
    </div>
  );
};
