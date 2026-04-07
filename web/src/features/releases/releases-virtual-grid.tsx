import { InfiniteData } from '@tanstack/react-query';
import { Virtuoso } from 'react-virtuoso';
import { IReleasesResponse } from 'shared';
import { Group } from '../../components/flex/group';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { getRowIndexes } from '../users/user-music-virtual-grid';
import { Release } from './release';
import { FetchMoreOnClick } from '../../components/fetch-more';
import { useElementHeight } from '../../hooks/useElementHeight';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useEffect } from 'react';

export const RELEASE_GRID_PADDING = '4px';
export const RELEASE_GRID_GAP = '8px';

export const ReleasesVirtualGrid: React.FC<{
  releases: InfiniteData<IReleasesResponse>;
  loadMore: () => Promise<any>;
  hasMore: boolean;
  children?: JSX.Element | JSX.Element[];
  manualLoad?: boolean;
}> = ({ releases, loadMore, hasMore, children, manualLoad }) => {
  const sm = useMediaQuery({ down: 'sm' });

  const md = useMediaQuery({ down: 'md' });

  const { height: firstRowHeight, ref: firstRowRef } = useElementHeight();

  const [defaultRowHeight, setDefaultRowHeight] = useLocalStorage(
    'releasesDefaultRowHeight',
    230,
  );

  useEffect(() => {
    if (firstRowHeight !== 0 && firstRowHeight !== defaultRowHeight) {
      setDefaultRowHeight(firstRowHeight);
    }
  }, [firstRowHeight]);

  const { currentItems, totalItems, itemsPerPage, totalPages } =
    releases.pages[releases.pages.length - 1];

  const itemsPerRow = sm ? 3 : md ? 4 : 6;

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
        endReached={manualLoad ? undefined : hasMore ? loadMore : undefined}
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

                const release = releases.pages[page].releases[indexInPage];

                return (
                  <div
                    key={release.id}
                    style={{
                      flex: `0 0 ${100 / itemsPerRow}%`,
                      overflow: 'hidden',
                      padding: RELEASE_GRID_PADDING,
                    }}
                  >
                    <Release release={release} />
                  </div>
                );
              })}
            </Group>
          );
        }}
        defaultItemHeight={defaultRowHeight}
      />
      {manualLoad && hasMore && <FetchMoreOnClick handleFetchMore={loadMore} />}
    </div>
  );
};
