import {
  IconCirclePlus,
  IconLogout2,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getUserPath } from 'shared';
import { Link } from '../../components/links/link';
import { Menu } from '../../components/menu';
import { useAuth } from '../../features/account/useAuth';
import { Avatar } from '../../features/users/avatar';
import { api } from '../../utils/api';

const UserMenu = () => {
  const { isLoading, me } = useAuth();

  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { mutate: logout } = useMutation(api.logout, {
    onSuccess: () => {
      queryClient.invalidateQueries();
      navigate('/login');
    },
  });

  const avatarMenuItems = me
    ? [
        {
          to: getUserPath({ username: me.username }),
          label: 'Profile',
          icon: IconUser,
        },
        {
          to: '/settings/profile',
          label: 'Settings',
          icon: IconSettings,
        },
        {
          to: '/contributions/releases/new',
          label: 'Add Release',
          icon: IconCirclePlus,
        },
        {
          action: logout,
          label: 'Logout',
          icon: IconLogout2,
        },
      ]
    : [];

  return (
    <div>
      {isLoading ? (
        <div></div>
      ) : me ? (
        <Menu
          toggler={<Avatar src={me.image?.sm} alt={me.username} />}
          items={[...avatarMenuItems]}
        />
      ) : (
        <Link to="/login">login</Link>
      )}
    </div>
  );
};

export default UserMenu;
