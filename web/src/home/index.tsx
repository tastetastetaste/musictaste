import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Fragment, useMemo } from 'react';
import { FindReleasesType, ReviewsSortByEnum, VoteType } from 'shared';
import { StickyContainer } from '../components/containers/sticky-container';
import { Feedback } from '../components/feedback';
import { FlexChild } from '../components/flex/flex-child';
import { Grid } from '../components/flex/grid';
import { Group } from '../components/flex/group';
import { Stack } from '../components/flex/stack';
import { Link } from '../components/links/link';
import { Loading } from '../components/loading';
import { useAuth } from '../features/account/useAuth';
import { List } from '../features/lists/list';
import { Release } from '../features/releases/release';
import { Review } from '../features/reviews/review';
import ReviewsListRenderer from '../features/reviews/reviews-list-renderer';
import { updateReviewAfterVote_2 } from '../features/reviews/update-review-after-vote';
import { useUserReviewVotes } from '../features/reviews/useUserReviewVotes';
import Support from '../features/supporters/support';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useOnScreen } from '../hooks/useOnScreen';
import AppPageWrapper from '../layout/app-page-wrapper';
import {
  LIST_GRID_GAP,
  RELEASE_GRID_GAP,
  SIDECONTENT_WIDTH,
} from '../static/spacing';
import { api } from '../utils/api';
import { cacheKeys } from '../utils/cache-keys';
import FeaturesOverview from './features-overview';

const ROOT_MARGIN = '100px';
const SECTION_MIN_HEIGHT = '500px';
const NEW_RELEASES_SECTION_MIN_HEIGHT = '250px';

const TopReviewsSection = () => {
  const queryClient = useQueryClient();
  const reviewsCacheKey = cacheKeys.reviewsKey({
    page: 1,
    pageSize: 12,
    sortBy: ReviewsSortByEnum.ReviewTop,
  });

  const { data: reviewsData } = useQuery(reviewsCacheKey, () =>
    api.getReviews({
      page: 1,
      pageSize: 12,
      sortBy: ReviewsSortByEnum.ReviewTop,
    }),
  );

  const reviewIds = useMemo(() => {
    return reviewsData?.entries?.map((e) => e.reviewId) || [];
  }, [reviewsData]);

  const { data: reviewVotes, updateVote } = useUserReviewVotes(reviewIds);

  const reviews = useMemo(() => {
    const votesMap = new Map<string, VoteType>();
    if (reviewVotes) {
      reviewVotes.forEach((v) => votesMap.set(v.reviewId, v.vote));
    }
    return reviewsData?.entries.map((e) => ({
      ...e,
      review: { ...e.review, userVote: votesMap.get(e.reviewId) },
    }));
  }, [reviewsData, reviewVotes]);

  return (
    <div css={{ minHeight: SECTION_MIN_HEIGHT }}>
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
              updateAfterVote={(vote) => {
                const id = entry.review.id;
                const currentUserVote = entry.review.userVote;
                updateVote(
                  id,
                  typeof currentUserVote === 'number' ? undefined : vote,
                );
                updateReviewAfterVote_2({
                  id,
                  vote,
                  currentUserVote,
                  cacheKey: reviewsCacheKey,
                  queryClient,
                });
              }}
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
    <div ref={ref} css={{ minHeight: SECTION_MIN_HEIGHT }}>
      <Stack gap="lg">
        <Link to="/lists/new" size="title-lg">
          Latest Lists
        </Link>
        {lists && lists.length === 0 && <Feedback message="No lists yet" />}
        <Grid cols={[1, 2, 3, 1]} gap={LIST_GRID_GAP}>
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
      type: FindReleasesType.RecentlyAdded,
      page: 1,
      pageSize: 12,
    }),
    () => api.getReleases(FindReleasesType.RecentlyAdded, 1, 12),
    {
      enabled: isIntersecting,
    },
  );
  const recentlyAddedReleases = recentlyAddedReleasesData?.releases;
  return (
    <div ref={ref} css={{ minHeight: SECTION_MIN_HEIGHT }}>
      <Stack gap="lg">
        <Link to="/releases/recently-added" size="title-lg">
          Recently Added
        </Link>
        <Grid cols={[3, 6]} gap={RELEASE_GRID_GAP}>
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
    <div ref={ref} css={{ minHeight: SECTION_MIN_HEIGHT }}>
      <Stack gap="lg">
        <Link to="/reviews/new" size="title-lg">
          New Reviews
        </Link>
        <ReviewsListRenderer
          sortBy={ReviewsSortByEnum.ReviewDate}
          queryEnabled={isIntersecting}
        />
      </Stack>
    </div>
  );
};

const NewReleasesSection = () => {
  const { ref, isIntersecting } = useOnScreen(ROOT_MARGIN);
  const {
    data: newPopularReleasesData,
    isLoading: isLoadingNewPopularReleases,
  } = useQuery(
    cacheKeys.releasesKey({
      type: FindReleasesType.NewPopular,
      page: 1,
      pageSize: 6,
    }),
    () => api.getReleases(FindReleasesType.NewPopular, 1, 6),
  );

  const newReleases = newPopularReleasesData?.releases;

  return (
    <div ref={ref} css={{ minHeight: NEW_RELEASES_SECTION_MIN_HEIGHT }}>
      <Stack gap="lg">
        <Link to="/releases/new" size="title-lg">
          New Releases
        </Link>
        {isLoadingNewPopularReleases ? (
          <Loading />
        ) : (
          <Grid cols={[3, 6, 6]} gap={RELEASE_GRID_GAP}>
            {newReleases &&
              newReleases
                .slice(0, 6)
                .map((r) => <Release key={r.id} release={r} />)}
          </Grid>
        )}
      </Stack>
    </div>
  );
};

const HomePage = () => {
  const { isLoading: isLoadingNewPopularReleases } = useQuery(
    cacheKeys.releasesKey({
      type: FindReleasesType.NewPopular,
      page: 1,
      pageSize: 10,
    }),
    () => api.getReleases(FindReleasesType.NewPopular, 1, 10),
  );

  const { isLoggedIn, isLoading } = useAuth();

  const isMobile = useMediaQuery({ down: 'lg' });

  return (
    <AppPageWrapper hideBackButton>
      <Stack gap="xl">
        {!isLoading && !isLoggedIn && <FeaturesOverview />}

        {/* minimize layout shift */}
        {!isLoadingNewPopularReleases ? (
          <Fragment>
            <NewReleasesSection />
            <Support />
            <Group gap="xl" align="start">
              <FlexChild grow>
                <Stack gap="xl">
                  <TopReviewsSection />
                  {isMobile ? <LatestListsSection /> : null}
                </Stack>
              </FlexChild>
              {!isMobile ? (
                <StickyContainer width={SIDECONTENT_WIDTH}>
                  <LatestListsSection />
                </StickyContainer>
              ) : null}
            </Group>
            <RecentlyAddedReleasesSection />
            <RecentReviewsSection />
          </Fragment>
        ) : (
          <Loading />
        )}
      </Stack>
    </AppPageWrapper>
  );
};

export default HomePage;
