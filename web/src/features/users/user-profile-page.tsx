import { Fragment } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { CommentEntityType, EntriesSortByEnum, IUser } from 'shared';
import { FlexChild } from '../../components/flex/flex-child';
import { Grid } from '../../components/flex/grid';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { Stack } from '../../components/flex/stack';
import { Link } from '../../components/links/link';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { List } from '../lists/list';
import { LIST_GRID_PADDING } from '../lists/lists-list-renderer';
import { Release } from '../releases/release';
import { RELEASE_GRID_GAP } from '../releases/releases-virtual-grid';
import { Review } from '../reviews/review';
import { updateReviewAfterVote_2 } from '../reviews/update-review-after-vote';
import { UserPageOutletContext } from './user-page-wrapper';
import { UserGenresChart, UserRatingsChart } from './user-profile-charts';
import { Comments } from '../comments/comments';

const BioSection = ({ bio }: { bio?: string | null }) =>
  bio ? <Markdown>{bio}</Markdown> : <div></div>;

const RecentlyAddedReleases: React.FC<{ userId: string; username: string }> = ({
  userId,
  username,
}) => {
  const NUMBER_OF_RELEASES = 8;

  const { data, isLoading } = useQuery(
    cacheKeys.entriesKey({
      userId,
      sortBy: EntriesSortByEnum.EntryDate,
      page: 1,
      pageSize: NUMBER_OF_RELEASES,
    }),
    () =>
      api.getEntries({
        userId,
        sortBy: EntriesSortByEnum.EntryDate,
        page: 1,
        pageSize: NUMBER_OF_RELEASES,
      }),
  );

  if (isLoading) {
    return <Loading />;
  }

  const releases =
    data?.entries.length !== 0 && data?.entries.slice(0, NUMBER_OF_RELEASES);

  return (
    <Fragment>
      {releases && (
        <Fragment>
          <Link
            size="title-lg"
            to={{
              pathname: `/${username}/music`,
              search: 'sb?dateAdded',
            }}
          >
            Recently Added
          </Link>
          <Grid cols={[2, 4]} gap={RELEASE_GRID_GAP}>
            {releases.map((ur) => (
              <Release key={ur.id} release={ur.release!} entry={ur} size="md" />
            ))}
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
};

const Reviews: React.FC<{ user: IUser }> = ({ user }) => {
  const qc = useQueryClient();

  const cacheKey = cacheKeys.entriesKey({
    page: 1,
    pageSize: 10,
    sortBy: EntriesSortByEnum.ReviewDate,
    userId: user.id,
    withReview: true,
  });

  const { data } = useQuery(cacheKey, () =>
    api.getEntries({
      page: 1,
      pageSize: 10,
      sortBy: EntriesSortByEnum.ReviewDate,
      userId: user.id,
      withReview: true,
    }),
  );

  const reviews = data?.entries?.slice(0, 10) ?? [];

  return (
    <Fragment>
      {reviews.length > 0 && (
        <Fragment>
          <Link size="title-lg" to={`/${user.username}/reviews`}>
            Recent Reviews
          </Link>
          <Stack gap="lg">
            {reviews.map((r) => (
              <Review
                key={r.id}
                entry={r}
                user={user}
                updateAfterVote={(id, vote) =>
                  updateReviewAfterVote_2({
                    id,
                    cacheKey,
                    queryClient: qc,
                    vote,
                  })
                }
              />
            ))}
          </Stack>
        </Fragment>
      )}
    </Fragment>
  );
};

const Lists: React.FC<{ username: string; userId: string }> = ({
  username,
  userId,
}) => {
  const { data } = useQuery(cacheKeys.userListsKey(userId, 1), () =>
    api.getUserLists(userId, 1),
  );

  const lists = data?.lists?.slice(0, 6) || [];

  return (
    <Fragment>
      {lists.length > 0 && (
        <Fragment>
          <Link size="title-lg" to={`/${username}/lists`}>
            Recent Lists
          </Link>
          <Grid cols={[1, 2, 3]} gap={LIST_GRID_PADDING}>
            {lists.map((list) => (
              <List key={list.id} list={list} withoutUser />
            ))}
          </Grid>
        </Fragment>
      )}
    </Fragment>
  );
};

const UserProfilePage = () => {
  const { user } = useOutletContext<UserPageOutletContext>();
  const { data: ratingBuckets, isLoading: isLoadingRatingBuckets } = useQuery(
    cacheKeys.userRatingBucketsKey(user.id),
    () => api.getUserRatingBuckets(user.id),
  );
  const hasRatings = !!ratingBuckets && ratingBuckets.some((b) => b.count > 0);

  const { data: genres, isLoading: isLoadingGenres } = useQuery(
    cacheKeys.userGenresKey(user.id),
    () => api.getUserGenres(user.id),
  );
  const hasGenres = !!genres && genres.length > 0;

  if (isLoadingRatingBuckets || isLoadingGenres) {
    return <Loading />;
  }

  return (
    <Fragment>
      <ResponsiveRow breakpoint="md">
        <FlexChild grow shrink>
          <Typography size="title-lg">About Me</Typography>
          <BioSection bio={user.bio} />
        </FlexChild>
        {hasRatings || hasGenres ? (
          <FlexChild grow shrink>
            <ResponsiveRow breakpoint="sm" gap="md">
              <FlexChild grow shrink>
                {hasRatings && <Typography size="title-lg">Ratings</Typography>}
                <UserRatingsChart userId={user.id} username={user.username} />
              </FlexChild>
              <FlexChild grow shrink>
                {hasGenres && (
                  <Typography size="title-lg">Top Genres</Typography>
                )}
                <UserGenresChart userId={user.id} username={user.username} />
              </FlexChild>
            </ResponsiveRow>
          </FlexChild>
        ) : null}
      </ResponsiveRow>
      <Stack gap="lg">
        <ResponsiveRow breakpoint="md" gap="md">
          {hasRatings ? (
            <FlexChild grow={3} shrink>
              <Stack gap="lg">
                <RecentlyAddedReleases
                  userId={user.id}
                  username={user.username}
                />
              </Stack>
            </FlexChild>
          ) : null}
          <FlexChild grow={1} shrink>
            <Stack gap="lg">
              <Typography size="title-lg">Shoutbox</Typography>
              <Comments
                entityType={CommentEntityType.SHOUTBOX}
                entityId={user.id}
              />
            </Stack>
          </FlexChild>
        </ResponsiveRow>
        <Reviews user={user} />
        <Lists username={user.username} userId={user.id} />
      </Stack>
    </Fragment>
  );
};

export default UserProfilePage;
