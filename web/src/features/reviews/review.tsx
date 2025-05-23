import { IconArrowDown, IconArrowUp, IconMessage } from '@tabler/icons-react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { IEntry, IReview, VoteType } from 'shared';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { IconButton } from '../../components/icon-button';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { api } from '../../utils/api';
import { formatDate } from '../../utils/date-format';
import { useAuth } from '../account/useAuth';
import { RatingCircle } from '../ratings/rating';
import { Release } from '../releases/release';
import {
  FavoriteTracks,
  releaseImageWidthMap,
} from '../releases/release/shared';
import { User } from '../users/user';
import { ReviewComments } from './review-comments';
import { UpdateReviewAfterVoteFu } from './update-review-after-vote';

const ReviewActions = ({
  reviewId,
  entryId,
  countData: { netVotes, commentsCount, userVote },
  updateAfterVote,
}: {
  reviewId: string;
  entryId: string;
  countData: Pick<
    IReview,
    'netVotes' | 'totalVotes' | 'commentsCount' | 'userVote'
  >;
  updateAfterVote: UpdateReviewAfterVoteFu;
}) => {
  const { isLoggedIn } = useAuth();

  const navigate = useNavigate();

  const { mutateAsync: createVote } = useMutation(api.reviewVote);
  const { mutateAsync: removeVote } = useMutation(api.reviewRemoveVote);

  const vote = async (vote: VoteType) => {
    if (typeof userVote !== 'number') await createVote({ reviewId, vote });
    else await removeVote(reviewId);

    updateAfterVote(reviewId, vote);
  };

  if (!isLoggedIn) return <div></div>;

  return (
    <Group gap="sm">
      <Group>
        <IconButton
          title="upvote"
          onClick={() => vote(VoteType.UP)}
          active={userVote === VoteType.UP}
        >
          <IconArrowUp />
        </IconButton>
        {netVotes > 0 ? `+${netVotes}` : netVotes}
        <IconButton
          title="downvote"
          onClick={() => vote(VoteType.DOWN)}
          active={userVote === VoteType.DOWN}
        >
          <IconArrowDown />
        </IconButton>
      </Group>
      <IconButton
        title="Comments"
        num={Number(commentsCount)}
        onClick={() => navigate('/review/' + entryId)}
      >
        <IconMessage />
      </IconButton>
    </Group>
  );
};

export interface ReviewProps {
  entry: IEntry;
  hideRelease?: boolean;
  fullPage?: boolean;
  updateAfterVote: UpdateReviewAfterVoteFu;
}

export const Review: React.FC<ReviewProps> = ({
  entry,
  hideRelease,
  updateAfterVote,
  fullPage,
}) => {
  const { review, rating, user, release } = entry;

  const smallScreen = useMediaQuery({ down: 'md' });

  if (!review) return <div>no review</div>;

  const {
    id,
    body,
    netVotes,
    totalVotes,
    commentsCount,
    userVote,
    createdAt,
    updatedAt,
  } = review;

  const MDString = body;

  return (
    <Group align="start" gap="md">
      {!hideRelease && !smallScreen && release && (
        <div
          style={{
            flexBasis: releaseImageWidthMap.lg,
            maxWidth: releaseImageWidthMap.lg,
            flexGrow: 0,
            flexShrink: 0,
            position: 'sticky',
            top: '10px',
          }}
        >
          <Release release={release} size="lg" />
        </div>
      )}

      <FlexChild grow>
        <Stack gap="md">
          <Group justify="apart">
            <div>{user && <User user={user} />}</div>
            <RatingCircle rating={rating?.rating} lg={fullPage} />
          </Group>

          {!hideRelease && smallScreen && release && (
            <Release release={release} size="sm" />
          )}

          <div
            style={{
              minHeight: 235,
              padding: !smallScreen && '0 54px',
            }}
          >
            <Markdown>{MDString}</Markdown>
          </div>

          <Group justify="apart" align="center">
            <Group gap="md">
              <ReviewActions
                countData={{ netVotes, totalVotes, commentsCount, userVote }}
                reviewId={id}
                entryId={entry.id}
                updateAfterVote={updateAfterVote}
              />
              {fullPage && entry.hasTrackVotes && (
                <FavoriteTracks entryId={entry.id} />
              )}
            </Group>
            <Typography color="sub">
              {formatDate(createdAt)}
              {updatedAt !== createdAt && ' (Edited)'}
            </Typography>
          </Group>
          {fullPage && <ReviewComments reviewId={id} />}
        </Stack>
      </FlexChild>
    </Group>
  );
};
