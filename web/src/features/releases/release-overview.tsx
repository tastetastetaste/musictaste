import { ExplicitCoverArt, IReleaseCover, IReleaseFullInfo } from 'shared';
import { FlexChild } from '../../components/flex/flex-child';
import { ResponsiveRow } from '../../components/flex/responsive-row';
import { Stack } from '../../components/flex/stack';
import { InfoRow } from '../../components/info-row';
import { Typography } from '../../components/typography';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { formatReleaseDate } from '../../utils/date-format';
import { RatingCircle } from '../ratings/rating';
import { formatReleaseType } from './format-release-type';
import ReleaseGenreVote from './release-genre-vote';
import {
  ArtistsLinks,
  GenresLinks,
  hideExplicitCoverArtFn,
  LabelsLinks,
} from './release/shared';
import { useTheme } from '@emotion/react';
import { Group } from '../../components/flex/group';
import { ReleaseActionsFullPage } from './release-actions/release-actions-full-page';
import { useAuth } from '../account/useAuth';

const ReleaseInfo: React.FC<{
  release: any;
  isLoggedIn?: boolean;
}> = ({
  release: {
    id: releaseId,
    date,
    datePrecision,
    genres,
    labels,
    languages,
    type,
  },
  isLoggedIn,
}) => {
  const dateStr = formatReleaseDate(date, datePrecision);

  const languagesStr =
    languages && languages.map((lang: any) => lang.name).join(', ');

  return (
    <Stack>
      <InfoRow label="Date">
        <Typography>{dateStr}</Typography>
      </InfoRow>

      <InfoRow label="Type">
        <Typography>{formatReleaseType(type)}</Typography>
      </InfoRow>
      {languagesStr && (
        <InfoRow label="Language">
          <Typography>{languagesStr}</Typography>
        </InfoRow>
      )}
      {labels.length ? (
        <InfoRow label="Label">
          <LabelsLinks labels={labels} />
        </InfoRow>
      ) : null}
      <InfoRow label="Genre">
        <GenresLinks genres={genres} />
        {isLoggedIn && <ReleaseGenreVote releaseId={releaseId} />}
      </InfoRow>
    </Stack>
  );
};

const ReleaseCover: React.FC<{
  explicitCoverArt?: ExplicitCoverArt[];
  src?: IReleaseCover;
  alt: string;
}> = ({ src, alt, explicitCoverArt }) => {
  const { border_radius, colors } = useTheme();
  const size = 600;

  const hideExplicitCoverArt = hideExplicitCoverArtFn(explicitCoverArt);

  return (
    <img
      id="cover"
      src={
        hideExplicitCoverArt
          ? `/placeholder/explicit-lg.jpeg`
          : src
            ? src.lg
            : '/placeholder/lg.jpeg'
      }
      width={size}
      height={size}
      css={{
        maxWidth: '100%',
        width: size,
        borderRadius: border_radius.base,
        height: 'auto',
        boxShadow: `${colors.background} 0px 2px 3px`,
      }}
      alt={alt}
    />
  );
};

export const ReleaseOverview = ({ release }: { release: IReleaseFullInfo }) => {
  const { isLoggedIn } = useAuth();
  const mdScreen = useMediaQuery({ down: 'md' });
  return (
    <div
      css={
        mdScreen
          ? {
              maxWidth: '600px',
              alignSelf: 'center',
            }
          : {
              display: 'flex',
              padding: '0 58px',
              width: '100%',
            }
      }
    >
      <ResponsiveRow breakpoint="md" gap="xl">
        <FlexChild shrink grow maxWidth="600px">
          <ReleaseCover
            explicitCoverArt={release.explicitCoverArt}
            src={release.cover}
            alt={`${release.artists.map((a) => a.name).join(', ')} - ${release.title}`}
          />
        </FlexChild>
        <FlexChild
          grow
          shrink
          style={{
            paddingTop: mdScreen ? '0' : '40px',
            // maxWidth: smScreen ? '600px' : undefined,
          }}
        >
          <Stack gap="md">
            <Group align="center" justify="apart" gap="lg">
              <Stack>
                <ArtistsLinks artists={release.artists} />
                <Typography size="title-xl">{release.title}</Typography>
                {release.titleLatin && (
                  <Typography size="title-lg">{release.titleLatin}</Typography>
                )}
              </Stack>
              {release.stats?.ratingsCount > 0 && (
                <RatingCircle
                  rating={release.stats.ratingsAvg}
                  count={release.stats.ratingsCount}
                  lg
                />
              )}
            </Group>
            <ReleaseInfo release={release} isLoggedIn={isLoggedIn} />
            <div
              style={{
                paddingTop: '12px',
                paddingBottom: '12px',
              }}
            >
              {isLoggedIn && (
                <ReleaseActionsFullPage id={release.id} date={release.date} />
              )}
            </div>
          </Stack>
        </FlexChild>
      </ResponsiveRow>
    </div>
  );
};
