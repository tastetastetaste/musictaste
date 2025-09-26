import { IconArrowDown, IconArrowUp, IconMessage } from '@tabler/icons-react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
  CommentEntityType,
  IEntry,
  IReview,
  IUserSummary,
  VoteType,
} from 'shared';
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
import { UpdateReviewAfterVoteFu } from './update-review-after-vote';
import { getReviewPathname } from '../../utils/get-pathname';
import { Comments } from '../comments/comments';

const ReviewActions = ({
  reviewId,
  entryId,
  countData: { netVotes, commentsCount, userVote },
  updateAfterVote,
  user,
}: {
  reviewId: string;
  entryId: string;
  countData: Pick<
    IReview,
    'netVotes' | 'totalVotes' | 'commentsCount' | 'userVote'
  >;
  updateAfterVote: UpdateReviewAfterVoteFu;
  user: IUserSummary;
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

  const linkTo = getReviewPathname(entryId);
  const linkState = {
    user,
  };

  if (!isLoggedIn)
    return (
      <Group gap="sm">
        <Group gap="sm">
          <IconArrowUp />+{netVotes}
        </Group>
        <IconButton
          title="Comments"
          num={Number(commentsCount)}
          onClick={() => navigate(linkTo, { state: linkState })}
        >
          <IconMessage />
        </IconButton>
        {/* {netVotes > 0 ? (
          <Group gap="sm">
            <IconArrowUp />
        +{netVotes}
          </Group>
        ) : (
          <Group gap="sm">
            <IconArrowDown />
            {netVotes}
          </Group>
        )} */}
      </Group>
    );

  return (
    <Group gap="sm">
      <Group>
        <IconButton
          title="upvote"
          onClick={() => vote(VoteType.UP)}
          active={userVote === VoteType.UP}
          disabled={!isLoggedIn}
        >
          <IconArrowUp />
        </IconButton>
        <Typography>{netVotes > 0 ? `+${netVotes}` : netVotes}</Typography>
        <IconButton
          title="downvote"
          onClick={() => vote(VoteType.DOWN)}
          active={userVote === VoteType.DOWN}
          disabled={!isLoggedIn}
        >
          <IconArrowDown />
        </IconButton>
      </Group>
      <IconButton
        title="Comments"
        num={Number(commentsCount)}
        onClick={() => navigate(linkTo, { state: linkState })}
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
  user?: IUserSummary;
}

export const Review: React.FC<ReviewProps> = ({
  entry,
  hideRelease,
  updateAfterVote,
  fullPage,
  user: userFromUserPage,
}) => {
  // user is null in user page
  // release is null in release page
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
            top: '80px',
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
              paddingLeft: '5px',
              paddingRight: '5px',
              fontSize: '13px',
              maxWidth: '100%',
              overflow: 'hidden',
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
                user={user || userFromUserPage}
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
          {fullPage && (
            <Comments entityType={CommentEntityType.REVIEW} entityId={id} />
          )}
        </Stack>
      </FlexChild>
    </Group>
  );
};
