import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArtistType, FindReleasesType, ReleaseType, ReportType } from 'shared';
import { Button } from '../../components/button';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { InfoRow } from '../../components/info-row';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { useSnackbar } from '../../hooks/useSnackbar';
import AppPageWrapper from '../../layout/app-page-wrapper';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { ArtistsLinks } from '../releases/release/shared';
import { ReportDialog } from '../reports/report-dialog';
import ReleasesListRenderer from '../releases/releases-list-renderer';

interface ArtistReleasesSectionProps {
  artistId: string;
  includeAliases: boolean;
  title: string;
  releaseType: ReleaseType;
  count: number;
  expand?: boolean;
}

const ArtistReleasesSection: React.FC<ArtistReleasesSectionProps> = ({
  artistId,
  includeAliases,
  title,
  releaseType,
  count,
  expand = false,
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  if (count === 0) return null;

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
            ({count})
          </Typography>
          {isCollapsed ? (
            <IconChevronRight strokeWidth={3} />
          ) : (
            <IconChevronDown strokeWidth={3} />
          )}
        </Group>
      </div>
      {!isCollapsed && (
        <ReleasesListRenderer
          type={FindReleasesType.New}
          artistId={artistId}
          releaseType={releaseType}
          includeAliases={includeAliases}
          manualLoad
        />
      )}
    </>
  );
};

const RELEASE_SECTIONS = [
  { title: 'Albums', releaseType: ReleaseType.LP },
  { title: 'Mixtapes', releaseType: ReleaseType.Mixtape },
  { title: 'EPs', releaseType: ReleaseType.EP },
  { title: 'Singles', releaseType: ReleaseType.Single },
  { title: 'Live', releaseType: ReleaseType.Live },
  { title: 'DJ Mixes', releaseType: ReleaseType.DJMix },
  {
    title: 'Compilations',
    releaseType: ReleaseType.Compilation,
  },
  {
    title: 'Soundtracks',
    releaseType: ReleaseType.Soundtrack,
  },
  { title: 'Remixes', releaseType: ReleaseType.Remix },
  { title: 'Covers', releaseType: ReleaseType.Cover },
  {
    title: 'Instrumentals',
    releaseType: ReleaseType.Instrumental,
  },
  { title: 'Videos', releaseType: ReleaseType.Video },
  { title: 'Reissues', releaseType: ReleaseType.Reissue },
  { title: 'Other', releaseType: ReleaseType.Other },
  {
    title: 'Unofficial',
    releaseType: ReleaseType.Unofficial,
  },
];

interface ArtistReleasesProps {
  artistId: string;
  includeAliases: boolean;
  releaseCounts: { type: ReleaseType; count: number }[];
  releaseCountsWithAliases?: { type: ReleaseType; count: number }[];
}

const ArtistReleases: React.FC<ArtistReleasesProps> = ({
  artistId,
  releaseCounts,
  releaseCountsWithAliases,
  includeAliases,
}) => {
  const currentCounts =
    includeAliases && releaseCountsWithAliases
      ? releaseCountsWithAliases
      : releaseCounts;

  let firstSectionExpanded = false;

  return (
    <Stack gap="sm">
      {RELEASE_SECTIONS.map((section) => {
        const count =
          currentCounts.find((c) => c.type === section.releaseType)?.count || 0;

        // expand first section that has releases and collapse other sections
        const expand = !firstSectionExpanded && count > 0;
        if (expand) {
          firstSectionExpanded = true;
        }

        return (
          <ArtistReleasesSection
            key={`${section.title}-${includeAliases}`}
            artistId={artistId}
            includeAliases={includeAliases}
            title={section.title}
            releaseType={section.releaseType}
            count={count}
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

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [includeAliases, setIncludeAliases] = useState(
    searchParams.get('includeAliases') === 'true',
  );

  const toggleIncludeAliases = () => {
    setIncludeAliases(!includeAliases);
    const newSearchParams = new URLSearchParams();
    if (!includeAliases) {
      newSearchParams.set('includeAliases', 'true');
    }
    navigate(`?${newSearchParams.toString()}`, { replace: true });
  };

  useEffect(() => {
    const includeAliasesParam = searchParams.get('includeAliases');
    const newIncludeAliasesParam = includeAliasesParam === 'true';
    if (newIncludeAliasesParam !== includeAliases) {
      setIncludeAliases(newIncludeAliasesParam);
    }
  }, [searchParams]);

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
            <Stack>
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
              {artist.country ? (
                <InfoRow label="Country">{artist.country.name}</InfoRow>
              ) : null}
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
              {artist.aliases?.length > 0 ? (
                <div css={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button variant="main" onClick={toggleIncludeAliases}>
                    {includeAliases
                      ? 'Hide Alias Releases'
                      : 'Show Alias Releases'}
                  </Button>
                </div>
              ) : null}
            </Stack>
          </div>
          <ArtistReleases
            artistId={artist.id}
            includeAliases={includeAliases}
            releaseCounts={data.releaseCounts}
            releaseCountsWithAliases={data.releaseCountsWithAliases}
          />
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
