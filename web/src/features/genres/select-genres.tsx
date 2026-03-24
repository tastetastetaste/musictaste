import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GENRE_REFERENCE_PATTERN, IGenreSummary } from 'shared';
import { cacheKeys } from '../../utils/cache-keys';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useState } from 'react';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';

export type SelectGenresValue = {
  value: string;
  label: string;
};

export const SelectGenres = ({
  onChange,
  filter,
  isMulti = false,
  value = null,
}: {
  onChange: (value: SelectGenresValue | SelectGenresValue[]) => void;
  filter?: (value: SelectGenresValue) => boolean;
  isMulti?: boolean;
  value?: SelectGenresValue | SelectGenresValue[];
}) => {
  const queryClient = useQueryClient();
  const { snackbar } = useSnackbar();
  const [query, setQuery] = useState('');

  const {
    data: searchData,
    isLoading,
    fetchStatus,
  } = useQuery(
    cacheKeys.searchKey({
      q: query!,
      type: ['genres'],
      page: 1,
      pageSize: 12,
    }),
    () =>
      api.search({
        q: query!,
        type: ['genres'],
        page: 1,
        pageSize: 12,
      }),
    { enabled: !!query },
  );

  const handleInputChange = (v: any) => {
    const match = v.match(GENRE_REFERENCE_PATTERN);
    if (match) {
      const genreId = match[1];
      setQuery('');

      queryClient
        .fetchQuery(cacheKeys.genreKey(genreId), () => api.getGenre(genreId))
        .then(({ genre }) => {
          const newValue = { value: genre.id, label: genre.name };
          onChange(
            isMulti && Array.isArray(value)
              ? [...value, newValue]
              : isMulti
                ? [newValue]
                : newValue,
          );
        })
        .catch(() => {
          snackbar('Failed to select genre');
        });
    } else {
      setQuery(v);
    }
  };
  return (
    <Select
      name="genreSelect"
      value={value}
      onChange={(selected: { value: string; label: string }) => {
        if (!selected) return;
        onChange(selected);
        setQuery('');
      }}
      isLoading={isLoading && fetchStatus !== 'idle'}
      isMulti={isMulti}
      options={
        searchData?.genres &&
        (filter
          ? searchData.genres.filter((g) =>
              filter({ value: g.id, label: g.name }),
            )
          : searchData.genres
        ).map((g) => ({
          value: g.id,
          label: g.name,
        }))
      }
      placeholder="Release Genre"
      inputValue={query}
      onInputChange={handleInputChange}
    />
  );
};
