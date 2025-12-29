import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AccountStatus, IUserProfileResponse, ReportType } from 'shared';
import { Feedback } from '../../components/feedback';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
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

  const { mutate: updateAccountStatusMutation } = useMutation(
    api.updateAccountStatus,
  );

  const { mutate: sendNotificationMutation } = useMutation(
    api.sendNotification,
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
    const status = prompt('0=Not Supporter, 10=Supporter, 100=Owner');
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

  const updateAccountStatus = () => {
    const status = prompt(
      '10=Not Confirmed, 20=Confirmed, 50=Warned, 80=Banned, 100=Deleted',
    );
    if (status) {
      updateAccountStatusMutation(
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

  const sendNotification = () => {
    const message = prompt('Notification message:');
    if (message) {
      const link = prompt('Link:');
      sendNotificationMutation(
        {
          userId: data.user.id,
          message,
          link,
        },
        {
          onSuccess: () => {
            alert('Notification sent');
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
          ...(!isUserMyself
            ? [
                {
                  label: 'Report',
                  action: () => setOpenReport(true),
                },
              ]
            : []),
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
                {
                  label: 'Account Status',
                  action: updateAccountStatus,
                },
                {
                  label: 'Send Notification',
                  action: sendNotification,
                },
              ]
            : []),
        ]}
        image={data.user.image?.md}
      >
        <Stack>
          <UserOverview
            user={data}
            isUserMyself={isUserMyself}
            accountStatus={data.user.accountStatus}
          />
          {data.user.accountStatus === AccountStatus.DELETED ? (
            <Typography>This account has been deleted.</Typography>
          ) : data.user.accountStatus === AccountStatus.BANNED ? (
            <Typography>This account has been banned.</Typography>
          ) : (
            <Outlet context={{ ...data, isUserMyself }} />
          )}
        </Stack>
        <ReportDialog
          isOpen={openReport}
          onClose={() => setOpenReport(false)}
          id={data.user.id}
          type={ReportType.USER}
        />
      </AppPageWrapper>
    </UserThemeProvider>
  );
};

export default UserPageWrapper;
