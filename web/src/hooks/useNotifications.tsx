import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useEffect } from 'react';
import { useAuth } from '../features/account/useAuth';
import { api } from '../utils/api';
import { cacheKeys } from '../utils/cache-keys';
import { useSnackbar } from './useSnackbar';
import { useSocket } from './useSocket';

const NotificationContext = createContext<{ unreadCount: number }>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { me, isLoggedIn } = useAuth();
  const { socket, isConnected, joinRoom, leaveRoom } = useSocket();

  const queryClient = useQueryClient();

  const { snackbar } = useSnackbar();

  const { data: unreadCountData } = useQuery(
    cacheKeys.unreadNotificationsCountKey(),
    () => api.getUnreadNotificationsCount(),
    {
      enabled: isLoggedIn,
    },
  );

  // Handle real-time notifications
  useEffect(() => {
    if (!socket || !isConnected || !me?.id) return;

    // Join notifications room
    const userRoomId = `user:${me.id}`;
    joinRoom(userRoomId);

    const handleNewNotification = (notification) => {
      const queryData = queryClient.getQueryData(cacheKeys.notificationsKey());

      if (queryData) {
        queryClient.setQueryData(cacheKeys.notificationsKey(), (old: any) => {
          const updatedPages = old.pages.map((page: any) => {
            if (page.currentPage === 1) {
              return {
                ...page,
                notifications: [notification, ...page.notifications],
                totalItems: page.totalItems + 1,
                currentItems: page.currentItems + 1,
              };
            }
            return page;
          });
          return {
            ...old,
            pages: updatedPages,
          };
        });
      }

      queryClient.setQueryData(
        cacheKeys.unreadNotificationsCountKey(),
        (old: any) => {
          return { count: (old?.count || 0) + 1 };
        },
      );

      snackbar(`${notification.user.name} ${notification.message}`);
    };

    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('new-notification', handleNewNotification);
      leaveRoom(userRoomId);
    };
  }, [socket, isConnected, me, joinRoom, leaveRoom]);

  const value = {
    unreadCount: unreadCountData?.count || 0,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
