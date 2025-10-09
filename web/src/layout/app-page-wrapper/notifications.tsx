import { IconBellFilled } from '@tabler/icons-react';
import { Fragment, useEffect, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { useNavigate } from 'react-router-dom';
import { getUserPath, INotification } from 'shared';
import { Button } from '../../components/button';
import { Feedback } from '../../components/feedback';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Link } from '../../components/links/link';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { Avatar } from '../../features/users/avatar';
import { useNotifications } from '../../hooks/useNotifications';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Stack } from '../../components/flex/stack';
import { Sidebar } from '../sidebar/sidebar';
import { IconButton } from '../../components/icon-button';
import { formatRelativeTimeShort } from '../../utils/date-format';

const NotificationItem = ({
  notification,
  onClose,
}: {
  notification: INotification;
  onClose: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <div
      css={{
        cursor: 'pointer',
      }}
      onClick={() => {
        navigate(notification.link);
        onClose();
      }}
    >
      <Group gap="md" align="center">
        <FlexChild basis="50px" grow={0} shrink={0}>
          <Link
            to={getUserPath({ username: notification.user.username })}
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              alt={notification.user.username}
              src={notification.user.image?.sm}
            />
          </Link>
        </FlexChild>
        <Typography>
          <Link
            to={getUserPath({ username: notification.user.username })}
            onClick={(e) => e.stopPropagation()}
          >
            {notification.user.name}
          </Link>{' '}
          {notification.message}{' '}
          <Typography color="sub" inline>
            {formatRelativeTimeShort(notification.createdAt)}
          </Typography>
        </Typography>
        {/* dot to indicate unread */}
        {!notification.read && (
          <div
            css={(theme) => ({
              width: '0.5rem',
              height: '0.5rem',
              backgroundColor: theme.colors.error,
              borderRadius: '50%',
            })}
          />
        )}
      </Group>
    </div>
  );
};

const NotificationsSidebarContent = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      cacheKeys.notificationsKey(),
      async ({ pageParam = 1 }) => api.getNotifications(pageParam),
      {
        getNextPageParam: (lastPage, pages) =>
          pages.length < lastPage.totalPages
            ? lastPage.currentPage + 1
            : undefined,
      },
    );

  const { data: unreadCount, isFetching: unreadCountIsFetching } = useQuery(
    cacheKeys.unreadNotificationsCountKey(),
    () => api.getUnreadNotificationsCount(),
  );

  const { mutate: markAllAsRead } = useMutation(api.markAllAsRead, {
    onSuccess: () => {
      queryClient.setQueryData(cacheKeys.notificationsKey(), (old: any) => {
        const updatedPages = old.pages.map((page: any) => {
          return {
            ...page,
            notifications: page.notifications.map((notification) => ({
              ...notification,
              read: true,
            })),
          };
        });
        return {
          ...old,
          pages: updatedPages,
        };
      });

      queryClient.setQueryData(cacheKeys.unreadNotificationsCountKey(), () => ({
        count: 0,
      }));
    },
  });

  useEffect(() => {
    return () => {
      // mark all as read on unmount
      if (!unreadCountIsFetching && unreadCount?.count) markAllAsRead();
    };
  }, [unreadCount, unreadCountIsFetching]);

  return (
    <Stack gap="md">
      {isFetching && !isFetchingNextPage && <Loading small />}
      {data && data.pages[0].totalItems > 0 ? (
        data.pages.map((page) => (
          <Fragment key={page.currentPage}>
            {page.notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </Fragment>
        ))
      ) : (
        <Feedback message="No new notifications" />
      )}

      {hasNextPage && (
        <div className="p-4 border-t">
          <Button
            variant="text"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </Stack>
  );
};

const Notifications = () => {
  const [open, setOpen] = useState(false);

  const { unreadCount } = useNotifications();

  return (
    <Fragment>
      <Sidebar
        isOpen={open}
        onClose={() => setOpen(false)}
        position="right"
        title="Notifications"
      >
        <NotificationsSidebarContent onClose={() => setOpen(false)} />
      </Sidebar>
      <div
        css={{
          position: 'relative',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '0.5rem',
        }}
      >
        <IconButton onClick={() => setOpen(!open)} title="Notifications">
          <IconBellFilled />
        </IconButton>
        {unreadCount && unreadCount > 0 ? (
          <span
            css={(theme) => ({
              position: 'absolute',
              top: '-1px',
              right: '-1px',
              backgroundColor: theme.colors.error,
              color: theme.colors.background,
              borderRadius: '9999px',
              height: '18px',
              width: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 12,
            })}
          >
            {unreadCount}
          </span>
        ) : null}
      </div>
    </Fragment>
  );
};

export default Notifications;
