import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArtistType, IArtistResponse, IRelease, ReportType } from 'shared';
import { Grid } from '../../components/flex/grid';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { InfoRow } from '../../components/info-row';
import { Loading } from '../../components/loading';
import { Markdown } from '../../components/markdown';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { Release } from '../releases/release';
import { ArtistsLinks } from '../releases/release/shared';
import { RELEASE_GRID_GAP } from '../releases/releases-virtual-grid';
import { ReportDialog } from '../reports/report-dialog';

interface ReleasesSectionProps {
  title: string;
  releases: IRelease[];
  expand?: boolean;
}

const ReleasesSection: React.FC<ReleasesSectionProps> = ({
  title,
  releases,
  expand = false,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  if (releases.length === 0) return null;

  const sectionKey = `${title.toLowerCase().replace(/\s+/g, '_')}`;
  const isCollapsedParam = searchParams.get(sectionKey);

  const isCollapsed = isCollapsedParam ? isCollapsedParam === 'true' : !expand;

  const toggleCollapsed = () => {
    const newSearchParams = new URLSearchParams(searchParams);
    const newCollapsedState = !isCollapsed;

    newSearchParams.set(sectionKey, newCollapsedState.toString());
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleCollapsed();
    }
  };

  const sortedReleases = [...releases].sort(
    (a, b) => Number(new Date(b.date)) - Number(new Date(a.date)),
  );

  return (
    <>
      <div
        css={{ cursor: 'pointer', padding: '8px 0' }}
        onClick={toggleCollapsed}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${title} section`}
      >
        <Group gap="md" align="center">
          <Typography size="title-lg">{title}</Typography>
          <Typography size="title" color="sub">
            ({releases.length})
          </Typography>
          {isCollapsed ? (
            <IconChevronRight strokeWidth={3} />
          ) : (
            <IconChevronDown strokeWidth={3} />
          )}
        </Group>
      </div>
      {!isCollapsed && (
        <Grid cols={[2, 4, 4, 6]} gap={RELEASE_GRID_GAP}>
          {sortedReleases.map((release) => (
            <Release release={release} key={release.id} />
          ))}
        </Grid>
      )}
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
      title: 'Mixtapes',
      types: ['Mixtape'],
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
      title: 'Live',
      types: ['Live'],
    },
    {
      title: 'DJ Mixes',
      types: ['DJMix'],
    },
    {
      title: 'Compilations',
      types: ['Compilation'],
    },
    {
      title: 'Soundtracks',
      types: ['Soundtrack'],
    },
    {
      title: 'Remixes',
      types: ['Remix'],
    },
    {
      title: 'Covers',
      types: ['Cover'],
    },
    {
      title: 'Instrumentals',
      types: ['Instrumental'],
    },
    {
      title: 'Videos',
      types: ['Video'],
    },
    {
      title: 'Reissues',
      types: ['Reissue'],
    },
    {
      title: 'Other',
      types: ['Other'],
    },
    {
      title: 'Unofficial',
      types: ['Unofficial'],
    },
  ];

  let firstSectionExpanded = false;

  return (
    <Stack gap="sm">
      {sections.map((section) => {
        const filteredReleases = releases.filter((r) =>
          section.types.includes(r.type),
        );

        // expand first section that has releases and collapse other sections
        const expand = !firstSectionExpanded && filteredReleases.length > 0;
        if (expand) {
          firstSectionExpanded = true;
        }

        return (
          <ReleasesSection
            key={section.title}
            title={section.title}
            releases={filteredReleases}
            expand={expand}
          />
        );
      })}
    </Stack>
  );
};

const ArtistPage = () => {
  const { id } = useParams();

  const { snackbar } = useSnackbar();

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
          label: 'Edit',
          to: '/contributions/artists/' + artist?.id,
        },
        {
          label: 'History',
          to: '/history/artist/' + artist?.id,
        },
        {
          label: 'Copy ID',
          action: () => {
            navigator.clipboard.writeText(artist?.id || '');
            snackbar('ID copied to clipboard');
          },
        },
        {
          label: 'Copy Reference',
          action: () => {
            navigator.clipboard.writeText(`[[artist/${artist?.id}]]`);
            snackbar('Reference copied to clipboard');
          },
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
              minHeight: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '10px 0',
            }}
          >
            <Stack gap="lg">
              <Stack>
                <Typography size="title-xl" as="h1">
                  {artist.name}
                </Typography>
                {artist.nameLatin ? (
                  <Typography size="title-lg">{artist.nameLatin}</Typography>
                ) : (
                  ''
                )}
              </Stack>
              {((artist.type === ArtistType.Person ||
                artist.type === ArtistType.Alias) &&
                artist.groups?.filter((g) => g.current)?.length) ||
              (artist.type === ArtistType.Group &&
                artist.groupArtists?.filter((g) => g.current)?.length) ? (
                <InfoRow
                  label={
                    artist.type === ArtistType.Person ||
                    artist.type === ArtistType.Alias
                      ? 'Groups'
                      : 'Members'
                  }
                >
                  <ArtistsLinks
                    artists={
                      artist.type === ArtistType.Person ||
                      artist.type === ArtistType.Alias
                        ? artist.groups
                            ?.filter((g) => g.current)
                            .sort((a, b) =>
                              a.group.name.localeCompare(b.group.name),
                            )
                            .map((g) => g.group)
                        : artist.groupArtists
                            ?.filter((g) => g.current)
                            .sort((a, b) =>
                              a.artist.name.localeCompare(b.artist.name),
                            )
                            .map((g) => g.artist)
                    }
                  />
                </InfoRow>
              ) : null}
              {((artist.type === ArtistType.Person ||
                artist.type === ArtistType.Alias) &&
                artist.groups?.filter((g) => !g.current)?.length) ||
              (artist.type === ArtistType.Group &&
                artist.groupArtists?.filter((g) => !g.current)?.length) ? (
                <InfoRow
                  label={
                    artist.type === ArtistType.Person ||
                    artist.type === ArtistType.Alias
                      ? 'Former Groups'
                      : 'Former Members'
                  }
                >
                  <ArtistsLinks
                    artists={
                      artist.type === ArtistType.Person ||
                      artist.type === ArtistType.Alias
                        ? artist.groups
                            ?.filter((g) => !g.current)
                            .sort((a, b) =>
                              a.group.name.localeCompare(b.group.name),
                            )
                            .map((g) => g.group)
                        : artist.groupArtists
                            ?.filter((g) => !g.current)
                            .sort((a, b) =>
                              a.artist.name.localeCompare(b.artist.name),
                            )
                            .map((g) => g.artist)
                    }
                  />
                </InfoRow>
              ) : null}

              {artist.relatedArtists?.length > 0 ? (
                <InfoRow label="Related Artists">
                  <ArtistsLinks
                    artists={artist.relatedArtists.sort((a, b) =>
                      a.name.localeCompare(b.name),
                    )}
                  />
                </InfoRow>
              ) : null}
              {artist.mainArtist ? (
                <InfoRow label="Main Artist">
                  <ArtistsLinks artists={[artist.mainArtist]} />
                </InfoRow>
              ) : null}
              {artist.aliases?.length > 0 ? (
                <InfoRow label="Aliases">
                  <ArtistsLinks
                    artists={artist.aliases.sort((a, b) =>
                      a.name.localeCompare(b.name),
                    )}
                  />
                </InfoRow>
              ) : null}
            </Stack>
          </div>
          <Releases releases={data.releases} />
        </Stack>
      ) : (
        <div></div>
      )}
      <ReportDialog
        id={(data && data.artist && data.artist.id) || ''}
        type={ReportType.ARTIST}
        isOpen={openReport}
        onClose={() => setOpenReport(false)}
      />
    </AppPageWrapper>
  );
};

export default ArtistPage;
