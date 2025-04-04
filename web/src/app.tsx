import { Fragment, lazy, Suspense, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useRouteError,
} from 'react-router-dom';
import { Button } from './components/button';
import { Stack } from './components/flex/stack';
import { Loading as Fallback } from './components/loading';
import { UseAuthProvider } from './features/account/useAuth';
import { SnackbarProvider, useSnackbar } from './hooks/useSnackbar';
import { SOMETHING_WENT_WRONG } from './static/feedback';
import { ThemeProvider } from './theme/useTheme';

const UserPageWrapper = lazy(
  () => import('./features/users/user-page-wrapper'),
);
const UserContributionsPageWrapper = lazy(
  () => import('./features/users/user-contributions-page-wrapper'),
);
const SettingsPageWrapper = lazy(
  () => import('./features/settings/settings-page-wrapper'),
);
const SearchPageWrapper = lazy(
  () => import('./features/search/search-page-wrapper'),
);
const ReleasePageWrapper = lazy(
  () => import('./features/releases/release-page-wrapper'),
);

const LoginPage = lazy(() => import('./features/account/login-page'));
const HomePage = lazy(() => import('./home'));
const EmailNotConfirmedPage = lazy(
  () => import('./features/account/email-not-confirmed-page'),
);
const UserProfilePage = lazy(() => import('./features/users/user-profie-page'));
const UserMusicPage = lazy(() => import('./features/users/user-music-page'));
const UserListsPage = lazy(() => import('./features/users/user-lists-page'));
const UserReviewsPage = lazy(
  () => import('./features/users/user-reviews-page'),
);
const UserFollowingPage = lazy(
  () => import('./features/users/user-following-page'),
);
const UserFollowersPage = lazy(
  () => import('./features/users/user-followers-page'),
);
const UserContributionsReleasesPage = lazy(
  () => import('./features/users/user-contributions-releases-page'),
);
const UserContributionsArtistsPage = lazy(
  () => import('./features/users/user-contributions-artists-page'),
);
const UserContributionsLabelsPage = lazy(
  () => import('./features/users/user-contributions-labels-page'),
);
const SettingsProfilePage = lazy(
  () => import('./features/settings/settings-profile-page'),
);
const SettingsImagePage = lazy(
  () => import('./features/settings/settings-image-page'),
);
const SettingsAccountPage = lazy(
  () => import('./features/settings/settings-account-page'),
);
const SearchPage = lazy(() => import('./features/search/search-page'));
const SearchArtistPage = lazy(
  () => import('./features/search/search-artist-page'),
);
const SearchReleasePage = lazy(
  () => import('./features/search/search-release-page'),
);
const NewReviewsPage = lazy(
  () => import('./features/reviews/new-reviews-page'),
);
const TopReviewsPage = lazy(
  () => import('./features/reviews/top-reviews-page'),
);
const ReviewPage = lazy(() => import('./features/reviews/review-page'));
const NewReleasesPage = lazy(
  () => import('./features/releases/new-releases-page'),
);
const PopularReleasesPage = lazy(
  () => import('./features/releases/popular-releases-page'),
);
const RecentlyAddedReleasesPage = lazy(
  () => import('./features/releases/recently-added-releases-page'),
);
const TopReleasesPage = lazy(
  () => import('./features/releases/top-releases-page'),
);
const ReleaseReviewsPage = lazy(
  () => import('./features/releases/release-reviews-page'),
);
const ReleaseListsPage = lazy(
  () => import('./features/releases/release-lists-page'),
);
const ReleaseRatingsPage = lazy(
  () => import('./features/releases/release-ratings-page'),
);
const AddReleasePage = lazy(
  () => import('./features/contributions/add-release-page'),
);
const EditReleasePage = lazy(
  () => import('./features/contributions/edit-release-page'),
);
const ReleasesSubmissions = lazy(
  () => import('./features/contributions/releases-submissions-page'),
);
const NewListsPage = lazy(() => import('./features/lists/new-lists-page'));
const PopularListsPage = lazy(
  () => import('./features/lists/popular-lists-page'),
);
const EditListPage = lazy(() => import('./features/lists/edit-list-page'));
const ListPage = lazy(() => import('./features/lists/list-page'));
const PrivacyPolicyPage = lazy(() => import('./legal/privacy'));
const TermsAndConditionsPage = lazy(() => import('./legal/terms'));
const ArtistPage = lazy(() => import('./features/artists/artist-page'));
const ResetPasswordPage = lazy(
  () => import('./features/account/reset-password-page'),
);
const ForgotPasswordPage = lazy(
  () => import('./features/account/forgot-password-page'),
);
const ConfirmEmailPage = lazy(
  () => import('./features/account/confirm-email-page'),
);

const SearchUserPage = lazy(() => import('./features/search/search-user-page'));

const QueryProvider = ({ children }: { children: any }) => {
  const { snackbar } = useSnackbar();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 30,
      },
      mutations: {
        onError: (error: any) => {
          snackbar(error?.response?.data?.message || SOMETHING_WENT_WRONG, {
            isError: true,
          });
        },
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const RootWrapper = () => {
  return (
    <UseAuthProvider>
      <Outlet />
    </UseAuthProvider>
  );
};

const RootErrorPage = () => {
  const error = useRouteError() as any;

  useEffect(() => {
    if (error && error.message.includes('dynamically imported module')) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }, [error]);

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <Stack gap="md">
          Unexpected error has occurred.
          <Button onClick={() => reset()}>Try again</Button>
          <pre style={{ whiteSpace: 'normal' }}>{error.message}</pre>
        </Stack>
      )}
    </QueryErrorResetBoundary>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<Fallback />}>
        <RootWrapper />
      </Suspense>
    ),
    errorElement: <RootErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Fallback />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'login',
        element: (
          <Suspense fallback={<Fallback />}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: 'confirm',
        element: (
          <Suspense fallback={<Fallback />}>
            <EmailNotConfirmedPage />
          </Suspense>
        ),
      },
      {
        path: ':username/contributions',
        element: (
          <Suspense fallback={<Fallback />}>
            <UserContributionsPageWrapper />
          </Suspense>
        ),
        children: [
          {
            path: 'releases',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserContributionsReleasesPage />
              </Suspense>
            ),
          },
          {
            path: 'artists',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserContributionsArtistsPage />
              </Suspense>
            ),
          },
          {
            path: 'labels',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserContributionsLabelsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: ':username',
        element: (
          <Suspense fallback={<Fallback />}>
            <UserPageWrapper />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Fallback />}>
                <UserProfilePage />
              </Suspense>
            ),
          },
          {
            path: 'music',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserMusicPage />
              </Suspense>
            ),
          },
          {
            path: 'lists',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserListsPage />
              </Suspense>
            ),
          },
          {
            path: 'reviews',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserReviewsPage />
              </Suspense>
            ),
          },
          {
            path: 'following',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserFollowingPage />
              </Suspense>
            ),
          },
          {
            path: 'followers',
            element: (
              <Suspense fallback={<Fallback />}>
                <UserFollowersPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Fallback />}>
            <SettingsPageWrapper />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="/settings/profile" replace /> },
          {
            path: 'profile',
            element: (
              <Suspense fallback={<Fallback />}>
                <SettingsProfilePage />
              </Suspense>
            ),
          },
          {
            path: 'image',
            element: (
              <Suspense fallback={<Fallback />}>
                <SettingsImagePage />
              </Suspense>
            ),
          },
          {
            path: 'account',
            element: (
              <Suspense fallback={<Fallback />}>
                <SettingsAccountPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'search',
        element: (
          <Suspense fallback={<Fallback />}>
            <SearchPageWrapper />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Fallback />}>
                <SearchPage />
              </Suspense>
            ),
          },
          {
            path: 'artist',
            element: (
              <Suspense fallback={<Fallback />}>
                <SearchArtistPage />
              </Suspense>
            ),
          },
          {
            path: 'release',
            element: (
              <Suspense fallback={<Fallback />}>
                <SearchReleasePage />
              </Suspense>
            ),
          },
          {
            path: 'user',
            element: (
              <Suspense fallback={<Fallback />}>
                <SearchUserPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'reviews',
        children: [
          { index: true, element: <Navigate to="/reviews/new" replace /> },
          {
            path: 'new',
            element: (
              <Suspense fallback={<Fallback />}>
                <NewReviewsPage />
              </Suspense>
            ),
          },
          {
            path: 'top',
            element: (
              <Suspense fallback={<Fallback />}>
                <TopReviewsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'review/:id',
        element: (
          <Suspense fallback={<Fallback />}>
            <ReviewPage />
          </Suspense>
        ),
      },
      {
        path: 'releases',
        children: [
          { index: true, element: <Navigate to="/releases/new" replace /> },
          {
            path: 'new',
            element: (
              <Suspense fallback={<Fallback />}>
                <NewReleasesPage />
              </Suspense>
            ),
          },
          {
            path: 'popular',
            element: (
              <Suspense fallback={<Fallback />}>
                <PopularReleasesPage />
              </Suspense>
            ),
          },
          {
            path: 'recently-added',
            element: (
              <Suspense fallback={<Fallback />}>
                <RecentlyAddedReleasesPage />
              </Suspense>
            ),
          },
          {
            path: 'top',
            element: (
              <Suspense fallback={<Fallback />}>
                <TopReleasesPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'release/:id',
        element: (
          <Suspense fallback={<Fallback />}>
            <ReleasePageWrapper />
          </Suspense>
        ),
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleaseReviewsPage />
              </Suspense>
            ),
          },
          {
            path: 'lists',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleaseListsPage />
              </Suspense>
            ),
          },
          {
            path: 'ratings',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleaseRatingsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'r',
        children: [
          {
            path: 'add',
            element: (
              <Suspense fallback={<Fallback />}>
                <AddReleasePage />
              </Suspense>
            ),
          },
          {
            path: 'edit/:id',
            element: (
              <Suspense fallback={<Fallback />}>
                <EditReleasePage />
              </Suspense>
            ),
          },
          {
            path: 'submissions',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesSubmissions />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'lists',
        children: [
          { index: true, element: <Navigate to="/lists/new" replace /> },
          {
            path: 'new',
            element: (
              <Suspense fallback={<Fallback />}>
                <NewListsPage />
              </Suspense>
            ),
          },
          {
            path: 'popular',
            element: (
              <Suspense fallback={<Fallback />}>
                <PopularListsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'list/:id',
        children: [
          {
            index: true,
            element: (
              <Suspense fallback={<Fallback />}>
                <ListPage />
              </Suspense>
            ),
          },
          {
            path: 'edit',
            element: (
              <Suspense fallback={<Fallback />}>
                <EditListPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'legal',
        children: [
          {
            path: 'privacy',
            element: (
              <Suspense fallback={<Fallback />}>
                <PrivacyPolicyPage />
              </Suspense>
            ),
          },
          {
            path: 'terms',
            element: (
              <Suspense fallback={<Fallback />}>
                <TermsAndConditionsPage />
              </Suspense>
            ),
          },
        ],
      },

      {
        path: 'artist/:id',
        element: (
          <Suspense fallback={<Fallback />}>
            <ArtistPage />
          </Suspense>
        ),
      },
      {
        path: 'account',
        children: [
          {
            path: 'password',
            children: [
              {
                path: 'new/:token',
                element: (
                  <Suspense fallback={<Fallback />}>
                    <ResetPasswordPage />
                  </Suspense>
                ),
              },
              {
                path: 'reset',
                element: (
                  <Suspense fallback={<Fallback />}>
                    <ForgotPasswordPage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'account/confirm/:token',
    element: (
      <Suspense fallback={<Fallback />}>
        <ConfirmEmailPage />
      </Suspense>
    ),
  },
]);

export function App() {
  return (
    <Fragment>
      <ThemeProvider>
        <SnackbarProvider>
          <QueryProvider>
            <RouterProvider router={router} />
            <ReactQueryDevtools />
          </QueryProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </Fragment>
  );
}

export default App;
