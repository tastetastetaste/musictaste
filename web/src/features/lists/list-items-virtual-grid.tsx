import { IListItemsResponse } from 'shared';
import { InfiniteData } from 'react-query';
import { Virtuoso } from 'react-virtuoso';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Group } from '../../components/flex/group';
import { Release } from '../releases/release';
import { getRowIndexes } from '../users/user-music-virtual-grid';
import { RELEASE_GRID_PADDING } from '../releases/releases-virtual-grid';
import { Typography } from '../../components/typography';

export const ListItemsVirtualGrid: React.FC<{
  data: InfiniteData<IListItemsResponse>;
  loadMore: () => Promise<any>;
  hasMore: boolean;
  ranked?: boolean;
  children?: JSX.Element | JSX.Element[];
}> = ({ data, loadMore, hasMore, ranked, children }) => {
  const sm = useMediaQuery({ down: 'sm' });

  const md = useMediaQuery({ down: 'md' });

  const { currentItems, totalItems, itemsPerPage, totalPages } =
    data.pages[data.pages.length - 1];

  const defaultItemHeight = 330;

  const itemsPerRow = sm ? 2 : md ? 4 : 6;

  const remoteRowCount = Math.ceil(totalItems / itemsPerRow);

  const loadedRowCount = Math.ceil(currentItems / itemsPerRow);

  return (
    <div>
      {children}
      <Virtuoso
        useWindowScroll
        totalCount={loadedRowCount}
        overscan={3000}
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: loadedRowCount * defaultItemHeight,
        }}
        endReached={hasMore ? loadMore : undefined}
        itemContent={(n) => {
          const inx = getRowIndexes(n, itemsPerRow, currentItems);

          return (
            <Group justify="start" align="start">
              {inx.map((i) => {
                const page = Math.floor(i / itemsPerPage);

                const indexInPage =
                  itemsPerPage - ((page + 1) * itemsPerPage - i);

                const listItem = data.pages[page].items[indexInPage];

                return (
                  <div
                    key={listItem.id}
                    style={{
                      flex: `0 0 ${100 / itemsPerRow}%`,
                      overflow: 'hidden',
                      padding: RELEASE_GRID_PADDING,
                    }}
                  >
                    <div
                      css={{
                        margin: '4px 0',
                      }}
                    >
                      {ranked ? <Typography>{i + 1}</Typography> : undefined}
                    </div>
                    <Release release={listItem.release} />
                  </div>
                );
              })}
            </Group>
          );
        }}
        defaultItemHeight={defaultItemHeight}
      />
    </div>
  );
};
