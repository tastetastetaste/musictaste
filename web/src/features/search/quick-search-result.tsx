import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ISearchResponse, SearchType } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Loading } from '../../components/loading';
import { Tabs } from '../../components/tabs';
import { mediaQueryMinWidth } from '../../hooks/useMediaQuery';
import {
  CONTENT_MAX_WIDTH,
  CONTENT_PADDING,
} from '../../layout/app-page-wrapper/shared';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import {
  ArtistSearchLink,
  GenreSearchLink,
  LabelSearchLink,
  ReleaseSearchLink,
} from './search-links';
import { User } from '../users/user';

const StyledSearchResultContainer = styled.div`
  position: absolute;
  z-index: 5;
  left: 0;
  right: 0;
  padding: 0 10px;

  ${mediaQueryMinWidth.md} {
    left: auto;
    right: auto;
    padding: 0;
  }
`;

const StyledSearchResult = styled.div`
  background: ${({ theme }) => theme.colors.background_sub};
  width: 100%;
  max-width: ${CONTENT_MAX_WIDTH};
  height: 400px;
  z-index: 5;
  padding: ${CONTENT_PADDING};
  margin-top: 16px;
  display: flex;
  flex-direction: column;

  ${mediaQueryMinWidth.md} {
    width: 400px;
    max-width: 400px;
  }
`;

const ResultsContainer = styled.div`
  overflow-y: auto;
  flex: 1;
`;

const SearchResults = ({
  data,
  activeTab,
}: {
  data: ISearchResponse;
  activeTab: SearchType;
}) => {
  switch (activeTab) {
    case 'releases':
      return (
        <Stack gap="sm">
          {data?.releases?.map((release) => (
            <ReleaseSearchLink key={release.id} release={release} />
          ))}
        </Stack>
      );
    case 'artists':
      return (
        <Stack gap="sm">
          {data?.artists?.map((artist) => (
            <ArtistSearchLink key={artist.id} artist={artist} />
          ))}
        </Stack>
      );
    case 'genres':
      return (
        <Stack gap="sm">
          {data?.genres?.map((genre) => (
            <GenreSearchLink key={genre.id} genre={genre} />
          ))}
        </Stack>
      );
    case 'labels':
      return (
        <Stack gap="sm">
          {data?.labels?.map((label) => (
            <LabelSearchLink key={label.id} label={label} />
          ))}
        </Stack>
      );
    case 'users':
      return (
        <Stack gap="sm">
          {data?.users?.map((user) => <User key={user.id} user={user} />)}
        </Stack>
      );
    default:
      return <Loading />;
  }
};

export const QuickSearchResult = ({ value }: { value?: string }) => {
  const [activeTab, setActiveTab] = useState<SearchType>('releases');

  const { data, isLoading } = useQuery(
    cacheKeys.searchKey({
      q: value!,
      type: [activeTab],
      page: 1,
      pageSize: 10,
    }),
    () =>
      api.search({
        q: value!,
        type: [activeTab],
        page: 1,
        pageSize: 10,
      }),
    {
      enabled: !!value,
    },
  );

  return (
    <StyledSearchResultContainer>
      <StyledSearchResult>
        <Tabs
          tabs={[
            { key: 'releases', label: 'Releases' },
            { key: 'artists', label: 'Artists' },
            { key: 'genres', label: 'Genres' },
            { key: 'labels', label: 'Labels' },
            { key: 'users', label: 'Users' },
          ]}
          activeTab={activeTab}
          onTabChange={(tabKey) => setActiveTab(tabKey as SearchType)}
        />
        <ResultsContainer>
          {isLoading ? (
            <Loading />
          ) : (
            <SearchResults data={data} activeTab={activeTab} />
          )}
        </ResultsContainer>
      </StyledSearchResult>
    </StyledSearchResultContainer>
  );
};
