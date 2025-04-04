import { EntriesSortByEnum, IUser } from 'shared';
import { api } from '../../utils/api';
import { Fragment } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useOutletContext } from 'react-router-dom';
import { FlexChild } from '../../components/flex/flex-child';
import { Grid } from '../../components/flex/grid';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { Stack } from '../../components/flex/stack';
import { Link } from '../../components/links/link';
import { Loading } from '../../components/loading';
import { Release } from '../releases/release';
import { RELEASE_GRID_PADDING } from '../releases/releases-virtual-grid';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import { List } from '../lists/list';
import { Review } from '../reviews/review';
import { UserPageOutletContext } from './user-page-wrapper';
import { UserGenresChart, UserRatingsChart } from './user-profile-charts';
import { LIST_GRID_PADDING } from '../lists/lists-list-renderer';
import { cacheKeys } from '../../utils/cache-keys';
import { updateReviewAfterVote_2 } from '../reviews/update-review-after-vote';

const BioSection = ({ bio }: { bio?: string | null }) =>
  bio ? <Markdown>{bio}</Markdown> : <div></div>;

const RecentlyAddedReleases: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = useQuery(
    cacheKeys.entriesKey({
      userId,
      sortBy: EntriesSortByEnum.EntryDate,
      page: 1,
      pageSize: 10,
    }),
    () =>
      api.getEntries({
        userId,
        sortBy: EntriesSortByEnum.EntryDate,
        page: 1,
        pageSize: 10,
      }),
  );

  if (isLoading) {
    return <Loading />;
  }

  const releases = data?.entries.length !== 0 && data?.entries.slice(0, 10);

  return (
    <Grid cols={[2, 5]} gap={RELEASE_GRID_PADDING}>
      {releases &&
        releases.map((ur) => (
          <Release key={ur.id} release={ur.release!} entry={ur} size="lg" />
        ))}
    </Grid>
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

  const lists = data && data.lists.length !== 0 && data?.lists.slice(0, 6);

  return (
    <Fragment>
      <Link size="title-lg" to={`/${username}/lists`}>
        Recent Lists
      </Link>
      {lists && (
        <Grid cols={[1, 2, 3]} gap={LIST_GRID_PADDING}>
          {lists.map((list) => (
            <List key={list.id} list={list} withoutUser />
          ))}
        </Grid>
      )}
    </Fragment>
  );
};

const UserProfilePage = () => {
  const { user } = useOutletContext<UserPageOutletContext>();

  return (
    <Fragment>
      <ResponsiveRow breakpoint="md">
        <FlexChild grow shrink>
          <Typography size="title-lg">About Me</Typography>
          <BioSection bio={user.bio} />
        </FlexChild>
        <FlexChild grow shrink>
          <ResponsiveRow breakpoint="sm">
            <FlexChild grow shrink>
              <Typography size="title-lg">Ratings</Typography>
              <UserRatingsChart userId={user.id} />
            </FlexChild>
            <FlexChild grow shrink>
              <Typography size="title-lg">Top Genres</Typography>
              <UserGenresChart userId={user.id} />
            </FlexChild>
          </ResponsiveRow>
        </FlexChild>
      </ResponsiveRow>
      <Stack gap="lg">
        <Link
          size="title-lg"
          to={{
            pathname: `/${user.username}/music`,
            search: 'sb?dateAdded',
          }}
        >
          Recently Added
        </Link>

        <RecentlyAddedReleases userId={user.id} />
        <Reviews user={user} />
        <Lists username={user.username} userId={user.id} />
      </Stack>
    </Fragment>
  );
};

export default UserProfilePage;
