import { useQuery } from '@tanstack/react-query';
import { GENRE_REFERENCE_PATTERN } from 'shared';
import { cacheKeys } from '../../utils/cache-keys';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useMemo, useState } from 'react';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';

export const SelectGenres = ({
  onChange,
  filter,
  isMulti = false,
  value = null,
}: {
  onChange: (value: string | string[]) => void;
  filter?: (value: string) => boolean;
  isMulti?: boolean;
  value?: string | string[];
}) => {
  const { snackbar } = useSnackbar();
  const [query, setQuery] = useState('');

  const { data, isLoading, fetchStatus } = useQuery(cacheKeys.genresKey(), () =>
    api.getGenres(),
  );

  const selectedGenres = useMemo(() => {
    if (!value) return null;
    return Array.isArray(value)
      ? value.map((v) => ({
          value: v,
          label: data?.genres.find((g) => g.id === v)?.name || v,
        }))
      : {
          value,
          label: data?.genres.find((g) => g.id === value)?.name || value,
        };
  }, [value, data]);

  const handleInputChange = (v: any) => {
    const match = v.match(GENRE_REFERENCE_PATTERN);
    if (match) {
      const genreId = match[1];
      setQuery('');

      const genre = data?.genres.find((g) => g.id === genreId);
      if (genre) {
        const newValue = genre.id;
        onChange(
          isMulti && Array.isArray(value)
            ? [...value, newValue]
            : isMulti
              ? [newValue]
              : newValue,
        );
      } else {
        snackbar('Failed to select genre');
      }
    } else {
      setQuery(v);
    }
  };
  return (
    <Select
      name="genreSelect"
      value={selectedGenres}
      onChange={(selected: { value: string; label: string }) => {
        if (!selected) return;
        const newValue = Array.isArray(selected)
          ? selected.map((s) => s.value)
          : selected.value;
        onChange(newValue);
        setQuery('');
      }}
      isLoading={isLoading && fetchStatus !== 'idle'}
      isMulti={isMulti}
      options={
        data?.genres &&
        (filter ? data.genres.filter((g) => filter(g.id)) : data.genres).map(
          (g) => ({
            value: g.id,
            label: g.name,
          }),
        )
      }
      placeholder="Select genre..."
      inputValue={query}
      onInputChange={handleInputChange}
    />
  );
};
