import { IArtistResponse } from 'shared';
import { api } from '../../utils/api';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import { Grid } from '../../components/flex/grid';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Release } from '../releases/release';
import { Typography } from '../../components/typography';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { RELEASE_GRID_PADDING } from '../releases/releases-virtual-grid';
import { useState } from 'react';
import { ReportDialog } from '../reports/report-dialog';
import { cacheKeys } from '../../utils/cache-keys';

const Releases: React.FC<{ releases: IArtistResponse['releases'] }> = ({
  releases,
}) => {
  return (
    <Stack gap="sm">
      {releases.some((r) => r.type === 'LP') && (
        <Typography size="title-lg">Albums</Typography>
      )}
      <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_PADDING}>
        {releases
          .filter((r) => r.type === 'LP')
          .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
          .map((release) => (
            <Release release={release} key={release.id} />
          ))}
      </Grid>

      {releases.some((r) => r.type === 'EP') && (
        <Typography size="title-lg">EPs</Typography>
      )}
      <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_PADDING}>
        {releases
          .filter((r) => r.type === 'EP')
          .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
          .map((release) => (
            <Release release={release} key={release.id} />
          ))}
      </Grid>

      {releases.some((r) => r.type === 'Single') && (
        <Typography size="title-lg">Singles</Typography>
      )}
      <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_PADDING}>
        {releases
          .filter((r) => r.type === 'Single')
          .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
          .map((release) => (
            <Release release={release} key={release.id} />
          ))}
      </Grid>

      {releases.some(
        (r) => r.type !== 'LP' && r.type !== 'EP' && r.type !== 'Single',
      ) && <Typography size="title-lg">Other</Typography>}
      <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_PADDING}>
        {releases
          .filter(
            (r) => r.type !== 'LP' && r.type !== 'EP' && r.type !== 'Single',
          )
          .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)))
          .map((release) => (
            <Release release={release} key={release.id} />
          ))}
      </Grid>
    </Stack>
  );
};

const ArtistPage = () => {
  const { id } = useParams();

  const [openReport, setOpenReport] = useState(false);

  const { data, isLoading } = useQuery(
    cacheKeys.artistKey(id),
    () => api.getArtist(id!),
    {
      enabled: !!id,
    },
  );

  const artist = data && data.artist;

  return (
    <AppPageWrapper
      title={artist ? artist.name : ''}
      menu={[
        {
          label: 'Report',
          action: () => setOpenReport(true),
        },
      ]}
    >
      {isLoading ? <Loading /> : <div></div>}

      {artist ? (
        <Stack>
          <div
            css={{
              height: 280,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography size="title-xl" as="h1">
              {artist.name}
            </Typography>
          </div>
          <Releases releases={data.releases} />
        </Stack>
      ) : (
        <div></div>
      )}
      <ReportDialog
        id={(data && data.artist && data.artist.id) || ''}
        type="artist"
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
      />
    </AppPageWrapper>
  );
};

export default ArtistPage;
