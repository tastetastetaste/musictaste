import { EntriesSortByEnum } from 'shared';
import { useQuery, useQueryClient } from 'react-query';
import { Grid } from './components/flex/grid';
import { Stack } from './components/flex/stack';
import { Link } from './components/links/link';
import { List } from './features/lists/list';
import { Release } from './features/releases/release';
import { RELEASE_GRID_PADDING } from './features/releases/releases-virtual-grid';
import { Review } from './features/reviews/review';
import AppPageWrapper from './layout/app-page-wrapper';
import { api } from './utils/api';
import { Feedback } from './components/feedback';
import { LIST_GRID_PADDING } from './features/lists/lists-list-renderer';
import { cacheKeys } from './utils/cache-keys';
import { updateReviewAfterVote_2 } from './features/reviews/update-review-after-vote';

const HomePage = () => {
  const queryClient = useQueryClient();
  const reviewsCacheKey = cacheKeys.entriesKey({
    page: 1,
    pageSize: 12,
    withReview: true,
    sortBy: EntriesSortByEnum.ReviewTop,
  });

  const { data: reviewsData } = useQuery(reviewsCacheKey, () =>
    api.getEntries({
      page: 1,
      pageSize: 12,
      withReview: true,
      sortBy: EntriesSortByEnum.ReviewTop,
    }),
  );

  const { data: newReleasesData } = useQuery(cacheKeys.newReleasesKey(1), () =>
    api.getNewReleases(1),
  );
  const { data: recentlyAddedReleasesData } = useQuery(
    cacheKeys.recentlyAddedReleasesKey(1),
    () => api.getRecentlyAddedReleases(1),
  );
  const { data: listsData } = useQuery(cacheKeys.newListsKey(1), () =>
    api.getNewLists(1),
  );

  const reviews = reviewsData?.entries;

  const newReleases = newReleasesData?.releases;
  const recentlyAddedReleases = recentlyAddedReleasesData?.releases;

  const lists = listsData?.lists;

  return (
    <AppPageWrapper>
      <Stack gap="lg">
        <Link to="/releases/new" size="title-lg">
          New Releases
        </Link>
        <Grid cols={[2, 6]} gap={RELEASE_GRID_PADDING}>
          {newReleases &&
            (newReleases.length > 12
              ? newReleases.slice(0, 12)
              : newReleases
            ).map((r) => <Release key={r.id} release={r} />)}
        </Grid>
        <Stack gap="lg">
          <Link to="/reviews/top" size="title-lg">
            Top Recent Reviews
          </Link>
          {reviews && reviews.length === 0 && (
            <Feedback message="No recent reviews" />
          )}
          {reviews &&
            (reviews.length > 10 ? reviews.slice(0, 10) : reviews).map(
              (entry) => (
                <Review
                  key={entry.id}
                  entry={entry}
                  updateAfterVote={(id, vote) =>
                    updateReviewAfterVote_2({
                      id,
                      vote,
                      cacheKey: reviewsCacheKey,
                      queryClient,
                    })
                  }
                />
              ),
            )}
        </Stack>
        <Stack gap="lg">
          <Link to="/lists/new" size="title-lg">
            Latest Lists
          </Link>
          {lists && lists.length === 0 && <Feedback message="No lists yet" />}
          <Grid cols={[1, 2, 3]} gap={LIST_GRID_PADDING}>
            {lists &&
              (lists.length > 6 ? lists.slice(0, 6) : lists).map((list) => (
                <List key={list.id} list={list} />
              ))}
          </Grid>
        </Stack>
        <Link to="/releases/recently-added" size="title-lg">
          Recently Added
        </Link>
        <Grid cols={[2, 6]} gap={RELEASE_GRID_PADDING}>
          {recentlyAddedReleases &&
            (recentlyAddedReleases.length > 12
              ? recentlyAddedReleases.slice(0, 12)
              : recentlyAddedReleases
            ).map((r) => <Release key={r.id} release={r} />)}
        </Grid>
      </Stack>
    </AppPageWrapper>
  );
};

export default HomePage;
