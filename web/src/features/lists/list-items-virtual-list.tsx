import { InfiniteData } from '@tanstack/react-query';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { Virtuoso } from 'react-virtuoso';
import { IListItemsResponse } from 'shared';
import { ListItem } from './list-item';

const Header = ({ context: { children } }: any) => {
  return <div css={{ marginBottom: '18px' }}>{children}</div>;
};

export const ListItemsVirtualList: React.FC<{
  data: InfiniteData<IListItemsResponse>;
  loadMore: () => Promise<any>;
  hasMore: boolean;
  ranked?: boolean;
  children?: JSX.Element | JSX.Element[];
}> = ({ data, loadMore, hasMore, ranked, children }) => {
  const { currentItems, totalItems, itemsPerPage, totalPages } =
    data.pages[data.pages.length - 1];

  return (
    <ReactVirtualizedAutoSizer disableHeight>
      {({ width }) => {
        const size = width < 580 ? 'sm' : width < 940 ? 'md' : 'lg';

        const defaultHeight = size === 'sm' ? 90 : 220;

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

              const item = data.pages[page].items[indexInPage];

              return (
                <ListItem
                  item={item}
                  index={index}
                  ranked={ranked}
                  size={size}
                />
              );
            }}
            useWindowScroll
            defaultItemHeight={defaultHeight}
            overscan={1000}
            endReached={hasMore ? loadMore : undefined}
          />
        );
      }}
    </ReactVirtualizedAutoSizer>
  );
};
