import { ICurrentUserResponse } from 'shared';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../account/useAuth';
import AppPageWrapper from '../../layout/app-page-wrapper';

export type SettingsPageOutletContext = {
  user: NonNullable<ICurrentUserResponse['user']>;
};

const SettingsPageWrapper: React.FC = () => {
  const { me, isLoading } = useAuth();

  const navigate = useNavigate();

  if (!isLoading && !me) {
    navigate('/');
  }

  const arr = [
    { to: `/settings/profile`, label: 'Profile' },
    { to: `/settings/image`, label: 'Image' },
    { to: `/settings/account`, label: 'Account' },
  ];

  return (
    <AppPageWrapper title="Settings" navigation={arr}>
      {me ? <Outlet context={{ user: me }} /> : <div></div>}
    </AppPageWrapper>
  );
};

export default SettingsPageWrapper;
