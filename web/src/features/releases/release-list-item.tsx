import { getReleasePath, IRelease, IReleaseWithStats } from 'shared';
import { CardContainer } from '../../components/containers/card-container';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { getYearFromDate } from '../../utils/date-format';
import { formatReleaseType } from './format-release-type';
import { ReleaseActions } from './release-actions/release-actions';
import {
  ArtistsLinks,
  ReleaseImageLink,
  ReleaseRatingsLink,
  ReleaseTitleLink,
} from './release/shared';

interface IReleaseListItemProps {
  release: IRelease | IReleaseWithStats;
  index: number;
  ranked?: boolean;
  size: 'sm' | 'md' | 'lg';
}

const isReleaseWithStats = (
  release: IRelease | IReleaseWithStats,
): release is IReleaseWithStats => {
  return 'stats' in release && !!release.stats;
};

export const ReleaseListItem: React.FC<IReleaseListItemProps> = ({
  release,
  index,
  ranked,
  size,
}) => {
  const smScreen = size === 'sm';

  return (
    <CardContainer
      css={{
        padding: '4px 0',
      }}
    >
      <Group gap={20}>
        <Group>
          {ranked && (
            <div css={{ width: smScreen ? '40px' : '80px' }}>
              <Group justify="center">
                <Typography size={smScreen ? 'title' : 'title-lg'}>
                  {index + 1}
                </Typography>
              </Group>
            </div>
          )}
          <div
            css={{
              height: smScreen ? '100px' : '200px',
              width: smScreen ? '100px' : '200px',
            }}
          >
            <ReleaseImageLink release={release} size={smScreen ? 'xs' : 'md'} />
          </div>
        </Group>
        <FlexChild grow>
          <Stack gap="sm">
            <ArtistsLinks artists={release.artists} truncate />
            <ReleaseTitleLink
              to={getReleasePath({ releaseId: release.id })}
              title={release.title}
              latinTitle={release.titleLatin}
            />
            {isReleaseWithStats(release) && release.stats?.ratingsCount > 0 ? (
              <ReleaseRatingsLink
                releaseId={release.id}
                rating={release.stats.ratingsAvg}
                count={release.stats.ratingsCount}
              />
            ) : null}

            <Group justify="apart">
              <Typography size="small" color="sub">
                {`${getYearFromDate(release.date)} · ${formatReleaseType(release.type)}`}
              </Typography>
              <ReleaseActions id={release.id} date={release.date} />
            </Group>
          </Stack>
        </FlexChild>
      </Group>
    </CardContainer>
  );
};
