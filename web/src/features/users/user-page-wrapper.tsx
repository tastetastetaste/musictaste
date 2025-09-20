import { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { Outlet, useParams } from 'react-router-dom';
import { IUserProfileResponse } from 'shared';
import { Feedback } from '../../components/feedback';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { SOMETHING_WENT_WRONG } from '../../static/feedback';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { useAuth } from '../account/useAuth';
import { ReportDialog } from '../reports/report-dialog';
import { UserThemeProvider } from '../theme/user-theme-provider';
import { UserOverview } from './user-overview';

export type UserPageOutletContext = {
  isUserMyself: boolean;
} & IUserProfileResponse;

const UserPageWrapper: React.FC = () => {
  const { username } = useParams();

  const { me, isAdmin } = useAuth();

  const [openReport, setOpenReport] = useState(false);

  const { data, isLoading } = useQuery(
    cacheKeys.userProfileKey(username),
    () => api.getUserProfile(username!),
    {
      enabled: !!username,
    },
  );

  const { mutate: updateContributorStatusMutation } = useMutation(
    api.updateUserContributorStatus,
  );

  const { mutate: updateSupporterStatusMutation } = useMutation(
    api.updateUserSupporterStatus,
  );

  const updateContributorStatus = () => {
    const status = prompt(
      '0=Not Contributor, 20=Contributor, 40=Trusted Contributor, 60=Editor, 80=Admin',
    );
    if (status) {
      updateContributorStatusMutation(
        {
          userId: data.user.id,
          status: parseInt(status),
        },
        {
          onSuccess: () => {
            alert('Updated');
          },
        },
      );
    }
  };

  const updateSupporterStatus = () => {
    const status = prompt('0=Not Supporter, 10=Supporter');
    if (status) {
      updateSupporterStatusMutation(
        {
          userId: data.user.id,
          supporter: parseInt(status),
        },
        {
          onSuccess: () => {
            alert('Updated');
          },
        },
      );
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isLoading && !data) {
    return <Feedback message={SOMETHING_WENT_WRONG} />;
  }

  const isUserMyself = (me?.id && me.id === data.user.id) || false;

  return (
    <UserThemeProvider user={data.user}>
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
          ...(isAdmin
            ? [
                {
                  label: 'Contributor Status',
                  action: updateContributorStatus,
                },
                {
                  label: 'Supporter Status',
                  action: updateSupporterStatus,
                },
              ]
            : []),
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
    </UserThemeProvider>
  );
};

export default UserPageWrapper;
