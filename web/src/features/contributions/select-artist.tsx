import { useQuery, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useState, useMemo, useEffect, useRef } from 'react';
import {
  Select,
  SelectValue,
  SelectOption,
  SelectType,
} from '../../components/inputs/select';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { IArtistSummary, ARTIST_REFERENCE_PATTERN } from 'shared';

const formatArtistLabel = (artist: IArtistSummary) =>
  artist.name +
  (artist.nameLatin ? ` [${artist.nameLatin}]` : '') +
  (artist.disambiguation || artist.mainArtist
    ? ` (${artist.disambiguation || artist.mainArtist?.name})`
    : '');

interface SelectArtistProps {
  value?: SelectValue;
  onChange: (value: SelectValue, selected?: SelectType | null) => void;
  name?: string;
  placeholder?: string;
  filterCondition?: (artist: IArtistSummary) => boolean;
  isMulti: boolean;
  icon?: React.ReactNode;
  availableArtists?: IArtistSummary[];
}

export const SelectArtist = forwardRef<any, SelectArtistProps>(
  (
    {
      placeholder = 'Artists',
      onChange,
      filterCondition,
      isMulti,
      value,
      availableArtists,
      ...rest
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const { snackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const availableOptionsRegistry = useRef<Map<string, SelectOption>>(
      new Map(),
    );

    // Add available artists to registry
    useEffect(() => {
      if (availableArtists) {
        availableArtists.forEach(
          (artist) =>
            !availableOptionsRegistry.current.has(artist.id) &&
            availableOptionsRegistry.current.set(artist.id, {
              value: artist.id,
              label: formatArtistLabel(artist),
            }),
        );
      }
    }, [availableArtists]);

    const selectedArtists = useMemo(() => {
      if (value === null) {
        return null;
      }
      return Array.isArray(value)
        ? value.map((v) => availableOptionsRegistry.current.get(v))
        : availableOptionsRegistry.current.get(value);
    }, [value, availableOptionsRegistry]);

    const valueArray = useMemo(() => {
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    }, [value]);

    const hasAllLocalData = valueArray.every((id) =>
      availableOptionsRegistry.current.has(id),
    );

    const { data: fetchedArtists } = useQuery({
      queryKey: cacheKeys.artistsKey(valueArray),
      queryFn: () => api.getArtists(valueArray),
      enabled: valueArray.length > 0 && !hasAllLocalData,
    });

    useEffect(() => {
      if (fetchedArtists) {
        fetchedArtists.forEach((a) => {
          availableOptionsRegistry.current.set(a.id, {
            value: a.id,
            label: formatArtistLabel(a),
          });
        });
      }
    }, [fetchedArtists]);

    const { data } = useQuery(
      cacheKeys.searchKey({
        q: query!,
        type: ['artists'],
        page: 1,
        pageSize: 12,
      }),
      () =>
        api.search({
          q: query!,
          type: ['artists'],
          page: 1,
          pageSize: 12,
        }),
      { enabled: !!query },
    );

    const handleOnChange = (selected: SelectType | null) => {
      if (!selected) {
        onChange(Array.isArray(value) ? [] : null, null);
        return;
      }

      const selectedArray = Array.isArray(selected) ? selected : [selected];
      selectedArray.forEach(
        (s) =>
          !availableOptionsRegistry.current.has(s.value) &&
          availableOptionsRegistry.current.set(s.value, {
            value: s.value,
            label: s.label,
          }),
      );

      const newValue = Array.isArray(selected)
        ? selected.map((s) => s.value)
        : selected.value;

      onChange(newValue, selected);
    };

    const handleInputChange = (v: string) => {
      const match = v.match(ARTIST_REFERENCE_PATTERN);
      if (match) {
        const artistId = match[1];
        setQuery('');

        queryClient
          .fetchQuery(cacheKeys.artistKey(artistId), () =>
            api.getArtist(artistId),
          )
          .then(({ artist }) => {
            if (filterCondition && !filterCondition(artist)) {
              snackbar('Failed to select artist');
              return;
            }

            const newOption = {
              value: artist.id,
              label: formatArtistLabel(artist),
            };
            if (!availableOptionsRegistry.current.has(newOption.value))
              availableOptionsRegistry.current.set(newOption.value, newOption);

            if (isMulti) {
              const currentValues = Array.isArray(value) ? value : [];
              if (!currentValues.some((val) => val === newOption.value)) {
                const newValues = [...currentValues, newOption.value];
                const newSelected = Array.isArray(selectedArtists) && [
                  ...selectedArtists,
                  newOption,
                ];
                onChange(newValues, newSelected);
              }
            } else {
              onChange(newOption.value, newOption);
            }
          })
          .catch(() => {
            snackbar('Failed to select artist');
          });
      } else {
        setQuery(v);
      }
    };

    return (
      <Select
        {...rest}
        value={selectedArtists}
        ref={ref}
        onChange={handleOnChange}
        isMulti={isMulti}
        options={
          data?.artists &&
          (filterCondition
            ? data.artists.filter(filterCondition)
            : data.artists
          ).map((artist: any) => ({
            value: artist.id,
            label: formatArtistLabel(artist),
          }))
        }
        placeholder={placeholder}
        inputValue={query}
        onInputChange={handleInputChange}
      />
    );
  },
);
