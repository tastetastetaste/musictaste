import { useTheme } from '@emotion/react';
import { IconArrowBigDown, IconArrowBigUp } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { Fragment } from 'react';
import {
  IArtistSubmission,
  IGenreSubmission,
  ILabelSubmission,
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
  originalTracks?: Array<{
    id?: string;
    track?: string;
    title?: string;
    durationMs?: number;
  }>;
  changedTracks?: Array<{
    id?: string;
    track?: string;
    title?: string;
    durationMs?: number;
  }>;
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
        <Group gap={30}>
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

export const SubmissionItemWrapper = ({
  children,
  link,
  voteFn,
  discardFn,
  hideUser,
  submission,
  submissionType,
}: {
  children: React.ReactElement | React.ReactElement[];
  link?: string;
  voteFn: (params: { submissionId: string; vote: VoteType }) => Promise<any>;
  discardFn?: DiscardSubmissionFn;
  hideUser?: boolean;
  submission:
    | IArtistSubmission
    | ILabelSubmission
    | IReleaseSubmission
    | IGenreSubmission;
  submissionType: 'artist' | 'label' | 'release' | 'genre';
}) => {
  const { colors } = useTheme();
  const { me } = useAuth();
  const qc = useQueryClient();

  const color =
    submission.submissionStatus === SubmissionStatus['DISAPPROVED']
      ? colors.error
      : submission.submissionStatus === SubmissionStatus['APPROVED']
        ? colors.highlight
        : colors.text;

  const handleDiscard = async () => {
    const confirmed = confirm(
      'Are you sure you want to discard this contribution?',
    );

    if (!confirmed) return;

    if (discardFn) {
      await discardFn(submission.id);
      qc.resetQueries(cacheKeys.releaseSubmissionsKey());
      qc.resetQueries(cacheKeys.artistSubmissionsKey());
      qc.resetQueries(cacheKeys.labelSubmissionsKey());
    }
  };

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
        <Group align="center">
          {!submission.votes.some((v) => v.userId === me.id) && (
            <SubmissionActions
              id={submission.id}
              status={submission.submissionStatus}
              voteFn={voteFn}
            />
          )}

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
        {submissionType !== 'genre' &&
          me?.id === submission.user.id &&
          dayjs().diff(submission.createdAt, 'hour') < 1 && (
            <Button danger onClick={handleDiscard}>
              Discard
            </Button>
          )}
      </Group>
      <Group>
        {submission.votes.map((v) => (
          <Group>
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
          </Group>
        ))}
      </Group>
    </div>
  );
};
