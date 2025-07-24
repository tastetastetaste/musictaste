import { useTheme } from '@emotion/react';
import { IconArrowBigDown, IconArrowBigUp } from '@tabler/icons-react';
import { Fragment } from 'react';
import { useMutation } from 'react-query';
import { SubmissionStatus, VoteType } from 'shared';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { useAuth } from '../account/useAuth';
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
    return <></>;

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
}: {
  children: React.ReactElement | React.ReactElement[];
  status: any;
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
      css={{
        borderBottom: `1px solid ${colors.text_sub}`,
        display: 'flex',
        alignItems: 'flex-end',
        padding: '10px 0',
        marginBottom: '6px',
      }}
    >
      <div css={{ flex: '1 1 0' }}>
        <Stack>{children}</Stack>
      </div>
      <div
        css={(theme) => ({
          flex: '0 0 100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${color}`,
          borderRadius: theme.border_radius.base,
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
    </div>
  );
};
