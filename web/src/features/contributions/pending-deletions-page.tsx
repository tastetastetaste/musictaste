import { useMutation, useQuery } from 'react-query';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { useAuth } from '../account/useAuth';
import { SubmissionStatus } from 'shared';
import { ArtistSubmissionItem } from './artist-submission-list';
import { LabelSubmissionItem } from './label-submission-list';
import { ReleaseSubmissionItem } from './release-submission-list';
import { Group } from '../../components/flex/group';
import { Button } from '../../components/button';

const PendingDeletionsPage = () => {
  const { isLoading, isAdmin } = useAuth();

  const { data: releasesData, isLoading: isLoading2 } = useQuery(
    'pending-deletions-releases',
    () =>
      api.getReleaseSubmissions({
        page: 1,
        status: SubmissionStatus.PENDING_ENTITY_DELETION,
      }),
    {
      enabled: isAdmin,
    },
  );
  const { data: artistsData, isLoading: isLoading3 } = useQuery(
    'pending-deletions-artists',
    () =>
      api.getArtistSubmissions({
        page: 1,
        status: SubmissionStatus.PENDING_ENTITY_DELETION,
      }),
    {
      enabled: isAdmin,
    },
  );
  const { data: labelsData, isLoading: isLoading4 } = useQuery(
    'pending-deletions-labels',
    () =>
      api.getLabelSubmissions({
        page: 1,
        status: SubmissionStatus.PENDING_ENTITY_DELETION,
      }),
    {
      enabled: isAdmin,
    },
  );

  const { mutateAsync, isLoading: isDeleting } = useMutation(
    api.processPendingDeletion,
    {
      onSuccess: () => {
        location.reload();
      },
    },
  );

  if (isLoading || isLoading2 || isLoading3 || isLoading4) {
    return <Loading />;
  }
  return (
    <AppPageWrapper>
      <Stack gap={10}>
        <Typography size="title-lg">Pending Deletions</Typography>
      </Stack>
      <div>
        <Group justify="apart" align="center">
          <Typography size="title">Releases</Typography>
          <Button
            disabled={isDeleting || !releasesData?.releases.length}
            onClick={() =>
              mutateAsync({
                releaseSubmissionIds: releasesData.releases.map((s) => s.id),
              })
            }
          >
            Delete All
          </Button>
        </Group>
        {releasesData?.releases.map((s) => (
          <ReleaseSubmissionItem key={s.id} submission={s} />
        ))}

        <Group justify="apart" align="center">
          <Typography size="title">Artists</Typography>
          <Button
            disabled={isDeleting || !artistsData?.artists.length}
            onClick={() =>
              mutateAsync({
                artistSubmissionIds: artistsData.artists.map((s) => s.id),
              })
            }
          >
            Delete All
          </Button>
        </Group>
        {artistsData?.artists.map((s) => (
          <ArtistSubmissionItem key={s.id} submission={s} />
        ))}
        <Group justify="apart" align="center">
          <Typography size="title">Labels</Typography>
          <Button
            disabled={isDeleting || !labelsData?.labels.length}
            onClick={() =>
              mutateAsync({
                labelSubmissionIds: labelsData.labels.map((s) => s.id),
              })
            }
          >
            Delete All
          </Button>
        </Group>
        {labelsData?.labels.map((s) => (
          <LabelSubmissionItem key={s.id} submission={s} />
        ))}
      </div>
    </AppPageWrapper>
  );
};

export default PendingDeletionsPage;
