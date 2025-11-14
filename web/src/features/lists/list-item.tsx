import { IListItem } from 'shared';
import { CardContainer } from '../../components/containers/card-container';
import { FlexChild } from '../../components/flex/flex-child';
import { Group } from '../../components/flex/group';
import { Stack } from '../../components/flex/stack';
import {
  ArtistsLinks,
  ReleaseImageLink,
  ReleaseTitleLink,
} from '../releases/release/shared';
import { Typography } from '../../components/typography';
import { getYearFromDate } from '../../utils/date-format';
import { formatReleaseType } from '../releases/format-release-type';
import { getArtistPath, getReleasePath } from 'shared';
import { ReleaseActions } from '../releases/release-actions/release-actions';
import { Markdown } from '../../components/markdown';

interface IListItemProps {
  item: Pick<IListItem, 'id' | 'release' | 'note'>;
  index: number;
  ranked?: boolean;
  size: 'sm' | 'md' | 'lg';
}

export const ListItem: React.FC<IListItemProps> = ({
  item: { release, note },
  index,
  ranked,
  size,
}) => {
  const mdScreen = size === 'md';
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
            <div css={{ width: '80px' }}>
              <Group justify="center">
                <Typography size="title-lg">{index + 1}</Typography>
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
            <ArtistsLinks artists={release.artists} />
            <ReleaseTitleLink
              to={getReleasePath({ releaseId: release.id })}
              title={release.title}
              latinTitle={release.titleLatin}
            />
            {note ? <Markdown>{note}</Markdown> : null}
            <Typography size="small">
              {`${getYearFromDate(release.date)} · ${formatReleaseType(release.type)}`}
            </Typography>
          </Stack>
        </FlexChild>
        <div
          style={{
            alignSelf: 'flex-end',
          }}
        >
          <ReleaseActions id={release.id} date={release.date} />
        </div>
      </Group>
    </CardContainer>
  );
};
