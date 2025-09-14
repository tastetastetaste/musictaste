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
import {
  getArtistPathname,
  getReleasePathname,
} from '../../utils/get-pathname';
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
        <Group gap={20}>
          {ranked && <Typography size="title-lg">{index + 1}</Typography>}
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
            <ArtistsLinks
              links={release.artists.map((a) => ({
                href: getArtistPathname(a.id),
                label: a.name,
              }))}
            />
            <ReleaseTitleLink to={getReleasePathname(release.id)}>
              {release.title}
            </ReleaseTitleLink>
            {note ? <Markdown>{note}</Markdown> : null}

            <Typography size="small">
              {`${getYearFromDate(release.date)} · ${release.type}`}
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
