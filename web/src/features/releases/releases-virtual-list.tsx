import { InfiniteData } from '@tanstack/react-query';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { Virtuoso } from 'react-virtuoso';
import { IReleasesResponse } from 'shared';
import { FetchMoreOnClick } from '../../components/fetch-more';
import { ReleaseListItem } from './release-list-item';

const Header = ({ context: { children } }: any) => {
  return children ? <div css={{ marginBottom: '18px' }}>{children}</div> : null;
};

export const ReleasesVirtualList: React.FC<{
  releases: InfiniteData<IReleasesResponse>;
  loadMore: () => Promise<any>;
  hasMore: boolean;
  ranked?: boolean;
  manualLoad?: boolean;
  children?: JSX.Element | JSX.Element[];
}> = ({ releases, loadMore, hasMore, ranked, manualLoad, children }) => {
  const { currentItems, itemsPerPage } =
    releases.pages[releases.pages.length - 1];

  return (
    <div>
      <ReactVirtualizedAutoSizer disableHeight>
        {({ width }) => {
          const size = width < 580 ? 'sm' : width < 940 ? 'md' : 'lg';
          const defaultHeight = size === 'sm' ? 110 : 220;

          return (
            <Virtuoso
              context={{ children }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                width,
                minHeight: currentItems * defaultHeight,
              }}
              totalCount={currentItems}
              components={{
                Header,
              }}
              itemContent={(index) => {
                const page = Math.floor(index / itemsPerPage);
                const indexInPage =
                  itemsPerPage - ((page + 1) * itemsPerPage - index);

                const release = releases.pages[page].releases[indexInPage];

                return (
                  <ReleaseListItem
                    release={release}
                    index={index}
                    ranked={ranked}
                    size={size}
                  />
                );
              }}
              useWindowScroll
              defaultItemHeight={defaultHeight}
              overscan={1000}
              endReached={
                manualLoad ? undefined : hasMore ? loadMore : undefined
              }
            />
          );
        }}
      </ReactVirtualizedAutoSizer>
      {manualLoad && hasMore && <FetchMoreOnClick handleFetchMore={loadMore} />}
    </div>
  );
};
