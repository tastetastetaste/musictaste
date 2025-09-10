import { IArtistResponse, IRelease } from 'shared';
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

interface ReleasesSectionProps {
  title: string;
  releases: IRelease[];
}

const ReleasesSection: React.FC<ReleasesSectionProps> = ({
  title,
  releases,
}) => {
  if (releases.length === 0) return null;

  const sortedReleases = [...releases].sort(
    (a, b) => Number(new Date(b.date)) - Number(new Date(a.date)),
  );

  return (
    <>
      <Typography size="title-lg">{title}</Typography>
      <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_PADDING}>
        {sortedReleases.map((release) => (
          <Release release={release} key={release.id} />
        ))}
      </Grid>
    </>
  );
};

const Releases: React.FC<{ releases: IArtistResponse['releases'] }> = ({
  releases,
}) => {
  const sections = [
    {
      title: 'Albums',
      types: ['LP'],
    },
    {
      title: 'EPs',
      types: ['EP'],
    },
    {
      title: 'Singles',
      types: ['Single'],
    },
    {
      title: 'Mixtapes',
      types: ['Mixtape'],
    },
    {
      title: 'Live',
      types: ['Live'],
    },
    {
      title: 'Compilation',
      types: ['Compilation'],
    },
    {
      title: 'Reissue',
      types: ['Reissue'],
    },
    {
      title: 'Other',
      types: [
        'Other',
        'Instrumental',
        'Cover',
        'Soundtrack',
        'DJ',
        'Mix',
        'Video',
        'Remix',
      ],
    },
    {
      title: 'Unofficial',
      types: ['Unofficial'],
    },
  ];

  return (
    <Stack gap="sm">
      {sections.map((section) => {
        const filteredReleases = releases.filter((r) =>
          section.types.includes(r.type),
        );
        return (
          <ReleasesSection
            key={section.title}
            title={section.title}
            releases={filteredReleases}
          />
        );
      })}
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
          label: 'History',
          to: '/history/artist/' + artist?.id,
        },
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
