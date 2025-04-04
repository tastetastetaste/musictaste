import { IUserProfileResponse } from 'shared';
import { useQuery } from 'react-query';
import { Outlet, useParams } from 'react-router-dom';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { Feedback } from '../../components/feedback';
import { useAuth } from '../account/useAuth';
import { UserOverview } from './user-overview';
import { useState } from 'react';
import { ReportDialog } from '../reports/report-dialog';
import { cacheKeys } from '../../utils/cache-keys';

export type UserPageOutletContext = {
  isUserMyself: boolean;
} & IUserProfileResponse;

const UserPageWrapper: React.FC = () => {
  const { username } = useParams();

  const { me } = useAuth();

  const [openReport, setOpenReport] = useState(false);

  const { data, isLoading } = useQuery(
    cacheKeys.userProfileKey(username),
    () => api.getUserProfile(username!),
    {
      enabled: !!username,
    },
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && !data) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }

  const isUserMyself = (me?.id && me.id === data.user.id) || false;

  return (
    <AppPageWrapper
      title={data.user.name + ' (@' + data.user.username + ') '}
      menu={[
        {
          label: 'Contributions',
          to: `/${data.user.username}/contributions/releases`,
        },
        {
          label: 'Report',
          action: () => setOpenReport(true),
        },
      ]}
      image={data.user.image?.md}
    >
      <Stack>
        <UserOverview user={data} isUserMyself={isUserMyself} />
        <Outlet context={{ ...data, isUserMyself }} />
      </Stack>
      <ReportDialog
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
        id={data.user.id}
        type="user"
      />
    </AppPageWrapper>
  );
};

export default UserPageWrapper;
