import { InfiniteData } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import { IEntriesResponse } from 'shared';
import { Group } from '../../components/flex/group';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Release } from '../releases/release';
import { RELEASE_GRID_PADDING } from '../releases/releases-virtual-grid';

interface Props {
  ratings: InfiniteData<IEntriesResponse>;
  loadMore: () => Promise<any>;
  hasMore: boolean;
}

export const getRowIndexes = (
  rowIndex: number,
  maxItemsPerRow: number,
  itemsAmont: number,
) => {
  const result = [];
  const startIndex = rowIndex * maxItemsPerRow;

  for (
    let i = startIndex;
    i < Math.min(startIndex + maxItemsPerRow, itemsAmont);
    i++
  ) {
    result.push(i);
  }

  return result;
};

export const UserMusicVirtualGrid: React.FC<Props> = ({
  ratings,
  loadMore,
  hasMore,
}) => {
  const sm = useMediaQuery({ down: 'sm' });

  const md = useMediaQuery({ down: 'md' });

  const { currentItems, totalItems, itemsPerPage, totalPages } =
    ratings.pages[ratings.pages.length - 1];

  const defaultItemHeight = 330;

  const itemsPerRow = sm ? 3 : md ? 4 : 5;

  const remoteRowCount = Math.ceil(totalItems / itemsPerRow);

  const loadedRowCount = Math.ceil(currentItems / itemsPerRow);

  return (
    <Virtuoso
      useWindowScroll
      totalCount={loadedRowCount}
      overscan={3000}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        minHeight: loadedRowCount * defaultItemHeight,
      }}
      endReached={hasMore ? loadMore : undefined}
      itemContent={(n) => {
        const inx = getRowIndexes(n, itemsPerRow, currentItems);

        return (
          <Group justify="start">
            {inx.map((i) => {
              const page = Math.floor(i / itemsPerPage);

              const indexInPage =
                itemsPerPage - ((page + 1) * itemsPerPage - i);

              const entry = ratings.pages[page].entries[indexInPage];

              return (
                <div
                  key={entry.id}
                  style={{
                    flex: `0 0 ${100 / itemsPerRow}%`,
                    overflow: 'hidden',
                    padding: RELEASE_GRID_PADDING,
                  }}
                >
                  <Release release={entry.release!} entry={entry} />
                </div>
              );
            })}
          </Group>
        );
      }}
      defaultItemHeight={defaultItemHeight}
    />
  );
};
