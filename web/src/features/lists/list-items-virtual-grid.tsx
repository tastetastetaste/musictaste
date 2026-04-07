import { InfiniteData } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import { IListItemsResponse } from 'shared';
import { Group } from '../../components/flex/group';
import { Typography } from '../../components/typography';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Release } from '../releases/release';
import { RELEASE_GRID_PADDING } from '../releases/releases-virtual-grid';
import { getRowIndexes } from '../users/user-music-virtual-grid';
import { useElementHeight } from '../../hooks/useElementHeight';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export const ListItemsVirtualGrid: React.FC<{
  data: InfiniteData<IListItemsResponse>;
  loadMore: () => Promise<any>;
  hasMore: boolean;
  ranked?: boolean;
  children?: JSX.Element | JSX.Element[];
}> = ({ data, loadMore, hasMore, ranked, children }) => {
  const sm = useMediaQuery({ down: 'sm' });

  const md = useMediaQuery({ down: 'md' });

  const { height: firstRowHeight, ref: firstRowRef } = useElementHeight();

  const [defaultRowHeight, setDefaultRowHeight] = useLocalStorage(
    'listItemsDefaultRowHeight',
    230,
  );

  useEffect(() => {
    if (firstRowHeight !== 0 && firstRowHeight !== defaultRowHeight) {
      setDefaultRowHeight(firstRowHeight);
    }
  }, [firstRowHeight]);

  const { currentItems, totalItems, itemsPerPage, totalPages } =
    data.pages[data.pages.length - 1];

  const itemsPerRow = sm ? 3 : md ? 4 : 5;

  const remoteRowCount = Math.ceil(totalItems / itemsPerRow);

  const loadedRowCount = Math.ceil(currentItems / itemsPerRow);

  return (
    <div>
      {children}
      <Virtuoso
        useWindowScroll
        totalCount={loadedRowCount}
        overscan={1000}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          minHeight: loadedRowCount * defaultRowHeight,
        }}
        endReached={hasMore ? loadMore : undefined}
        itemContent={(n) => {
          const inx = getRowIndexes(n, itemsPerRow, currentItems);

          return (
            <Group
              justify="start"
              align="start"
              ref={n === 0 ? firstRowRef : undefined}
            >
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
        defaultItemHeight={defaultRowHeight}
      />
    </div>
  );
};
