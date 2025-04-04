import styled from '@emotion/styled';
import { useQuery } from 'react-query';
import { Stack } from '../../components/flex/stack';
import { api } from '../../utils/api';
import { Loading } from '../../components/loading';
import { Typography } from '../../components/typography';
import { ArtistSearchLink, ReleaseSearchLink } from './search-links';
import { cacheKeys } from '../../utils/cache-keys';

const StyledSearchResultContainer = styled.div`
  position: absolute;
  z-index: 5;
`;

const StyledSearchResult = styled.div`
  background: ${({ theme }) => theme.colors.complement};
  width: 220px;
  height: 400px;
  z-index: 5;
  padding: 10px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
`;

export const QuickSearchResult = ({
  value,
  done,
}: {
  value?: string;
  done: () => any;
}) => {
  const { data, isLoading } = useQuery(
    cacheKeys.searchKey({
      q: value!,
      type: ['releases', 'artists'],
      page: 1,
      pageSize: 3,
    }),
    () =>
      api.search({
        q: value!,
        type: ['releases', 'artists'],
        page: 1,
        pageSize: 3,
      }),
    {
      enabled: !!value,
    },
  );

  return (
    <StyledSearchResultContainer>
      <StyledSearchResult>
        {isLoading ? (
          <Loading />
        ) : (
          <Stack gap="sm">
            <Typography size="body">Releases</Typography>
            <Stack gap="sm">
              {data &&
                data.releases &&
                data.releases.map((release) => (
                  <ReleaseSearchLink key={release.id} release={release} />
                ))}
            </Stack>

            <Typography size="body">Artists</Typography>
            <Stack gap="sm">
              {data &&
                data.artists &&
                data.artists.map((artist) => (
                  <ArtistSearchLink key={artist.id} artist={artist} />
                ))}
            </Stack>
          </Stack>
        )}
      </StyledSearchResult>
    </StyledSearchResultContainer>
  );
};
