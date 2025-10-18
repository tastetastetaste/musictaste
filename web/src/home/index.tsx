import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment } from 'react';
import { EntriesSortByEnum, FindReleasesType } from 'shared';
import { Feedback } from '../components/feedback';
import { Grid } from '../components/flex/grid';
import { Stack } from '../components/flex/stack';
import { Link } from '../components/links/link';
import { Loading } from '../components/loading';
import { useAuth } from '../features/account/useAuth';
import { List } from '../features/lists/list';
import { LIST_GRID_PADDING } from '../features/lists/lists-list-renderer';
import { Release } from '../features/releases/release';
import { RELEASE_GRID_GAP } from '../features/releases/releases-virtual-grid';
import { Review } from '../features/reviews/review';
import { updateReviewAfterVote_2 } from '../features/reviews/update-review-after-vote';
import Support from '../features/supporters/support';
import AppPageWrapper from '../layout/app-page-wrapper';
import { api } from '../utils/api';
import { cacheKeys } from '../utils/cache-keys';
import FeaturesOverview from './features-overview';
import ReviewsListRenderer from '../features/reviews/reviews-list-renderer';
import { useOnScreen } from '../hooks/useOnScreen';

const ROOT_MARGIN = '50px';

const TopReviewsSection = () => {
  const { ref, isIntersecting } = useOnScreen(ROOT_MARGIN);
  const queryClient = useQueryClient();
  const reviewsCacheKey = cacheKeys.entriesKey({
    page: 1,
    pageSize: 12,
    withReview: true,
    sortBy: EntriesSortByEnum.ReviewTop,
  });

  const { data: reviewsData } = useQuery(
    reviewsCacheKey,
    () =>
      api.getEntries({
        page: 1,
        pageSize: 12,
        withReview: true,
        sortBy: EntriesSortByEnum.ReviewTop,
      }),
    {
      enabled: isIntersecting,
    },
  );
  const reviews = reviewsData?.entries;
  return (
    <div ref={ref}>
      <Stack gap="lg">
        <Link to="/reviews/top" size="title-lg">
          Top Recent Reviews
        </Link>
        {reviews && reviews.length === 0 && (
          <Feedback message="No recent reviews" />
        )}
        {reviews &&
          reviews.map((entry) => (
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
          ))}
      </Stack>
    </div>
  );
};

const LatestListsSection = () => {
  const { ref, isIntersecting } = useOnScreen(ROOT_MARGIN);
  const { data: listsData } = useQuery(
    cacheKeys.newListsKey(1),
    () => api.getNewLists(1),
    {
      enabled: isIntersecting,
    },
  );
  const lists = listsData?.lists;
  return (
    <div ref={ref}>
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
    </div>
  );
};

const RecentlyAddedReleasesSection = () => {
  const { ref, isIntersecting } = useOnScreen(ROOT_MARGIN);
  const { data: recentlyAddedReleasesData } = useQuery(
    cacheKeys.releasesKey({
      type: FindReleasesType.Recent,
      page: 1,
      pageSize: 12,
    }),
    () => api.getReleases(FindReleasesType.Recent, 1, 12),
    {
      enabled: isIntersecting,
    },
  );
  const recentlyAddedReleases = recentlyAddedReleasesData?.releases;
  return (
    <div ref={ref}>
      <Stack gap="lg">
        <Link to="/releases/recently-added" size="title-lg">
          Recently Added
        </Link>
        <Grid cols={[2, 6]} gap={RELEASE_GRID_GAP}>
          {recentlyAddedReleases &&
            recentlyAddedReleases.map((r) => (
              <Release key={r.id} release={r} />
            ))}
        </Grid>
      </Stack>
    </div>
  );
};

const RecentReviewsSection = () => {
  const { ref, isIntersecting } = useOnScreen(ROOT_MARGIN);
  return (
    <div ref={ref}>
      <Stack gap="lg">
        <Link to="/reviews/recent" size="title-lg">
          Recent Reviews
        </Link>
        {isIntersecting ? (
          <ReviewsListRenderer sortBy={EntriesSortByEnum.ReviewDate} />
        ) : null}
      </Stack>
    </div>
  );
};

const HomePage = () => {
  const {
    data: newPopularReleasesData,
    isLoading: isLoadingNewPopularReleases,
  } = useQuery(
    cacheKeys.releasesKey({
      type: FindReleasesType.NewPopular,
      page: 1,
      pageSize: 12,
    }),
    () => api.getReleases(FindReleasesType.NewPopular, 1, 12),
  );

  const { isLoggedIn, isLoading } = useAuth();

  const newReleases = newPopularReleasesData?.releases;

  return (
    <AppPageWrapper>
      <Stack gap="lg">
        {!isLoading && !isLoggedIn && <FeaturesOverview />}

        <Link to="/releases/new" size="title-lg">
          New Releases
        </Link>
        {isLoadingNewPopularReleases ? (
          <Loading />
        ) : (
          <Grid cols={[2, 6]} gap={RELEASE_GRID_GAP}>
            {newReleases &&
              newReleases.map((r) => <Release key={r.id} release={r} />)}
          </Grid>
        )}
        {/* minimize layout shift */}
        {!isLoadingNewPopularReleases ? (
          <Fragment>
            <Support />
            <TopReviewsSection />
            <LatestListsSection />
            <RecentlyAddedReleasesSection />
            <RecentReviewsSection />
          </Fragment>
        ) : null}
      </Stack>
    </AppPageWrapper>
  );
};

export default HomePage;
