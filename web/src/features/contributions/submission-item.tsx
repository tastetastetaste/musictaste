import { useTheme } from '@emotion/react';
import { IconArrowBigDown, IconArrowBigUp } from '@tabler/icons-react';
import React, { Fragment } from 'react';
import { useMutation } from 'react-query';
import { IUser, SubmissionStatus, VoteType } from 'shared';
import { Group } from '../../components/flex/group';
import { IconButton } from '../../components/icon-button';
import { Link } from '../../components/links/link';
import { useAuth } from '../account/useAuth';
import { millisecondsToTimeString } from './release-tracks-fields';

import styled from '@emotion/styled';
import { User } from '../users/user';
import { FlexChild } from '../../components/flex/flex-child';

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

const TrackField = styled.div<{ changed?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 6px;
  border-radius: ${({ theme }) => theme.border_radius.base};
  border: ${(props) =>
    props.changed ? `2px solid ${props.theme.colors.highlight}` : 'none'};
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
const hasChanges = (original: any, updated: any): boolean => {
  if (original === updated) return false;
  if (Array.isArray(original) && Array.isArray(updated)) {
    if (original.length !== updated.length) return true;
    return original.some((item, index) => hasChanges(item, updated[index]));
  }
  if (typeof original === 'object' && typeof updated === 'object') {
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
    track?: string;
    title?: string;
    durationMs?: number;
  }>;
  changedTracks?: Array<{
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

  const maxLen = Math.max(originalTracks.length, changedTracks.length);

  return (
    <FieldContainer>
      <Field>
        <FieldLabel>Tracks:</FieldLabel>
        {Array.from({ length: maxLen }).map((_, i) => {
          const orig = originalTracks[i];
          const changed = changedTracks[i];
          const rowChanged = hasChanges(orig || {}, changed || {});

          return (
            <TrackField key={i} changed={rowChanged}>
              <span>
                {orig ? `${orig.track} | ${orig.title}` : EmptyPlaceholder}
              </span>
              <span>
                {orig ? millisecondsToTimeString(orig.durationMs) : ''}
              </span>
            </TrackField>
          );
        })}
      </Field>

      <Field>
        <FieldLabel>Tracks:</FieldLabel>
        {Array.from({ length: maxLen }).map((_, i) => {
          const orig = originalTracks[i];
          const changed = changedTracks[i];
          const rowChanged = hasChanges(orig || {}, changed || {});

          return (
            <TrackField key={i} changed={rowChanged}>
              <span>
                {changed
                  ? `${changed.track} | ${changed.title}`
                  : EmptyPlaceholder}
              </span>
              <span>
                {changed ? millisecondsToTimeString(changed.durationMs) : ''}
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
    <Group gap={10}>
      {data ? (
        <span>Ok</span>
      ) : (
        <Fragment>
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
        </Fragment>
      )}
      {isLoading && <span>loading..</span>}
    </Group>
  );
};

export const SubmissionItemWrapper = ({
  children,
  status,
  link,
  id,
  voteFn,
  user,
  hideUser,
}: {
  children: React.ReactElement | React.ReactElement[];
  status: any;
  link?: string;
  id: string;
  voteFn: (params: { submissionId: string; vote: VoteType }) => Promise<any>;
  user: IUser;
  hideUser?: boolean;
}) => {
  const { colors } = useTheme();
  const color =
    status === SubmissionStatus['DISAPPROVED']
      ? colors.error
      : status === SubmissionStatus['APPROVED']
        ? colors.highlight
        : colors.text;
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
        <Group align="center" gap="md">
          <SubmissionActions id={id} status={status} voteFn={voteFn} />
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
              {SubmissionStatus[status]}
            </span>
          </div>
        </Group>
        {!hideUser && <User user={user} />}
      </Group>
    </div>
  );
};
