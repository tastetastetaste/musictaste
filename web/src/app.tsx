import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Fragment, lazy, Suspense, useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useRouteError,
} from 'react-router-dom';
import { Button } from './components/button';
import { Feedback } from './components/feedback';
import { Stack } from './components/flex/stack';
import { Loading as Fallback, Loading } from './components/loading';
import RulesPage from './docs/rules';
import { useAuth, UseAuthProvider } from './features/account/useAuth';
import GenreSubmissionsList from './features/contributions/genre-submission-list';
import GenrePage from './features/genres/genre-page';
import { ThemeProvider } from './features/theme/useTheme';
import { ScreenSizeProvider } from './hooks/useMediaQuery';
import { NotificationProvider } from './hooks/useNotifications';
import { SnackbarProvider, useSnackbar } from './hooks/useSnackbar';
import { SocketProvider } from './hooks/useSocket';
import AppPageWrapper from './layout/app-page-wrapper';
import NotFoundPage from './layout/not-found-page';
import { AUTH_REQUIRED_PAGE, SOMETHING_WENT_WRONG } from './static/feedback';
import { FindReleasesType } from 'shared';

const UserPageWrapper = lazy(
  () => import('./features/users/user-page-wrapper'),
);
const UserContributionsPageWrapper = lazy(
  () => import('./features/contributions/user-contributions-page-wrapper'),
);
const ContributionsPageWrapper = lazy(
  () => import('./features/contributions/contributions-page-wrapper'),
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
const UserProfilePage = lazy(
  () => import('./features/users/user-profile-page'),
);
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
const SettingsProfilePage = lazy(
  () => import('./features/settings/settings-profile-page'),
);
const SettingsImagePage = lazy(
  () => import('./features/settings/settings-image-page'),
);
const SettingsAccountPage = lazy(
  () => import('./features/settings/settings-account-page'),
);
const SettingsContentPage = lazy(
  () => import('./features/settings/settings-content-page'),
);
const SearchPage = lazy(() => import('./features/search/search-page'));
const SearchArtistPage = lazy(
  () => import('./features/search/search-artist-page'),
);
const SearchLabelPage = lazy(
  () => import('./features/search/search-label-page'),
);
const SearchGenrePage = lazy(
  () => import('./features/search/search-genre-page'),
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
const ReleasesPageWrapper = lazy(
  () => import('./features/releases/releases-page-wrapper'),
);
const ReleasesListRenderer = lazy(
  () => import('./features/releases/releases-list-renderer'),
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
const EditArtistPage = lazy(
  () => import('./features/contributions/edit-artist-page'),
);
const EditLabelPage = lazy(
  () => import('./features/contributions/edit-label-page'),
);
const AddReleasePage = lazy(
  () => import('./features/contributions/add-release-page'),
);
const EditReleasePage = lazy(
  () => import('./features/contributions/edit-release-page'),
);
const AddGenrePage = lazy(
  () => import('./features/contributions/add-genre-page'),
);
const EditGenrePage = lazy(
  () => import('./features/contributions/edit-genre-page'),
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
const LabelPage = lazy(() => import('./features/labels/label-page'));
const GenresPage = lazy(() => import('./features/genres/genres-page'));
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
const ContributingPage = lazy(() => import('./docs/contributing'));
const SupportUsPage = lazy(
  () => import('./features/supporters/support-us-page'),
);

const ReleaseSubmissionsList = lazy(
  () => import('./features/contributions/release-submission-list'),
);
const ArtistSubmissionsList = lazy(
  () => import('./features/contributions/artist-submission-list'),
);
const LabelSubmissionsList = lazy(
  () => import('./features/contributions/label-submission-list'),
);

const HistoryPageWrapper = lazy(
  () => import('./features/contributions/history-page-wrapper'),
);

const PendingDeletionsPage = lazy(
  () => import('./features/contributions/pending-deletions-page'),
);

const MergePage = lazy(() => import('./features/contributions/merge-page'));

const ReleaseSubmissionPage = lazy(
  () => import('./features/contributions/release-submission-page'),
);
const ArtistSubmissionPage = lazy(
  () => import('./features/contributions/artist-submission-page'),
);
const LabelSubmissionPage = lazy(
  () => import('./features/contributions/label-submission-page'),
);
const GenreSubmissionPage = lazy(
  () => import('./features/contributions/genre-submission-page'),
);

const ThemePage = lazy(() => import('./features/theme/theme-page'));

const QueryProvider = ({ children }: { children: any }) => {
  const { snackbar } = useSnackbar();

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 30,
        retry: (failureCount, error) => {
          if (
            // @ts-expect-error ...
            error?.response?.status === 404 ||
            // @ts-expect-error ...
            error?.response?.status === 401
          )
            return false;
          return failureCount < 3;
        },
      },
      mutations: {
        onError: (error: any) => {
          let message = error?.response?.data?.message || SOMETHING_WENT_WRONG;
          if (Array.isArray(message)) {
            message = message[0];
          }
          snackbar(message, {
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
      <SocketProvider>
        <NotificationProvider>
          <Outlet />
        </NotificationProvider>
      </SocketProvider>
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

const AuthRequiredPage = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isLoggedIn } = useAuth();

  if (isLoading) return <Loading />;

  if (!isLoggedIn) {
    return (
      <AppPageWrapper>
        <Feedback message={AUTH_REQUIRED_PAGE} />
      </AppPageWrapper>
    );
  }
  return children;
};

const AdminRequiredPage = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isLoggedIn, isAdmin } = useAuth();

  if (isLoading) return <Loading />;

  if (!isLoggedIn || !isAdmin) {
    return <NotFoundPage />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: 'account/confirm/:token',
    element: (
      <Suspense fallback={<Fallback />}>
        <ConfirmEmailPage />
      </Suspense>
    ),
  },
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
        path: 'theme',
        element: (
          <Suspense fallback={<Fallback />}>
            <ThemePage />
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
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <UserContributionsPageWrapper />
            </Suspense>
          </AuthRequiredPage>
        ),
        children: [
          {
            path: 'releases',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleaseSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'artists',
            element: (
              <Suspense fallback={<Fallback />}>
                <ArtistSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'labels',
            element: (
              <Suspense fallback={<Fallback />}>
                <LabelSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'genres',
            element: (
              <Suspense fallback={<Fallback />}>
                <GenreSubmissionsList />
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
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <SettingsPageWrapper />
            </Suspense>
          </AuthRequiredPage>
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
            path: 'content',
            element: (
              <Suspense fallback={<Fallback />}>
                <SettingsContentPage />
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
            path: 'label',
            element: (
              <Suspense fallback={<Fallback />}>
                <SearchLabelPage />
              </Suspense>
            ),
          },
          {
            path: 'genre',
            element: (
              <Suspense fallback={<Fallback />}>
                <SearchGenrePage />
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
        element: (
          <Suspense fallback={<Fallback />}>
            <ReleasesPageWrapper />
          </Suspense>
        ),
        children: [
          { index: true, element: <Navigate to="/releases/new" replace /> },
          {
            path: 'new',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.NewPopular} />
              </Suspense>
            ),
          },
          {
            path: 'popular',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.Popular} />
              </Suspense>
            ),
          },
          {
            path: 'recently-added',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.RecentlyAdded} />
              </Suspense>
            ),
          },
          {
            path: 'upcoming',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.Upcoming} />
              </Suspense>
            ),
          },
          {
            path: 'top',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.Top} />
              </Suspense>
            ),
          },
          {
            path: 'top-2',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.Top2} />
              </Suspense>
            ),
          },
          {
            path: 'top-oty',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleasesListRenderer type={FindReleasesType.TopOTY} />
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
        path: 'contributions/artists/:id',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <EditArtistPage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/labels/:id',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <EditLabelPage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/releases/new',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <AddReleasePage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/releases/:id',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <EditReleasePage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/genres/new',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <AddGenrePage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/genres/:id',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <EditGenrePage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/pending-deletions',
        element: (
          <AdminRequiredPage>
            <Suspense fallback={<Fallback />}>
              <PendingDeletionsPage />
            </Suspense>
          </AdminRequiredPage>
        ),
      },
      {
        path: 'contributions/merge',
        element: (
          <AdminRequiredPage>
            <Suspense fallback={<Fallback />}>
              <MergePage />
            </Suspense>
          </AdminRequiredPage>
        ),
      },
      {
        path: 'contributions/release/:submissionId',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <ReleaseSubmissionPage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/artist/:submissionId',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <ArtistSubmissionPage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/label/:submissionId',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <LabelSubmissionPage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'contributions/genre/:submissionId',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <GenreSubmissionPage />
            </Suspense>
          </AuthRequiredPage>
        ),
      },
      {
        path: 'history',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <HistoryPageWrapper />
            </Suspense>
          </AuthRequiredPage>
        ),
        children: [
          {
            path: 'release/:id',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleaseSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'artist/:id',
            element: (
              <Suspense fallback={<Fallback />}>
                <ArtistSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'label/:id',
            element: (
              <Suspense fallback={<Fallback />}>
                <LabelSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'genre/:id',
            element: (
              <Suspense fallback={<Fallback />}>
                <GenreSubmissionsList />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: 'contributions',
        element: (
          <AuthRequiredPage>
            <Suspense fallback={<Fallback />}>
              <ContributionsPageWrapper />
            </Suspense>
          </AuthRequiredPage>
        ),
        children: [
          {
            path: 'releases',
            element: (
              <Suspense fallback={<Fallback />}>
                <ReleaseSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'artists',
            element: (
              <Suspense fallback={<Fallback />}>
                <ArtistSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'labels',
            element: (
              <Suspense fallback={<Fallback />}>
                <LabelSubmissionsList />
              </Suspense>
            ),
          },
          {
            path: 'genres',
            element: (
              <Suspense fallback={<Fallback />}>
                <GenreSubmissionsList />
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
              <AuthRequiredPage>
                <Suspense fallback={<Fallback />}>
                  <EditListPage />
                </Suspense>
              </AuthRequiredPage>
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
        path: 'label/:id',
        element: (
          <Suspense fallback={<Fallback />}>
            <LabelPage />
          </Suspense>
        ),
      },
      {
        path: 'genres',
        element: (
          <Suspense fallback={<Fallback />}>
            <GenresPage />
          </Suspense>
        ),
      },
      {
        path: 'genre/:id',
        element: (
          <Suspense fallback={<Fallback />}>
            <GenrePage />
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
      {
        path: 'contributing',
        element: (
          <Suspense fallback={<Fallback />}>
            <ContributingPage />
          </Suspense>
        ),
      },
      {
        path: 'rules',
        element: (
          <Suspense fallback={<Fallback />}>
            <RulesPage />
          </Suspense>
        ),
      },
      {
        path: 'support-us',
        element: (
          <Suspense fallback={<Fallback />}>
            <SupportUsPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function App() {
  return (
    <Fragment>
      <ScreenSizeProvider>
        <ThemeProvider>
          <SnackbarProvider>
            <QueryProvider>
              <RouterProvider router={router} />
              <ReactQueryDevtools />
            </QueryProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </ScreenSizeProvider>
    </Fragment>
  );
}

export default App;
