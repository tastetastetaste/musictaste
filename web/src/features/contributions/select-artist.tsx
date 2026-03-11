import { useQuery, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { IArtistSummary, ARTIST_REFERENCE_PATTERN } from 'shared';

const formatArtistLabel = (artist: any) =>
  artist.name +
  (artist.nameLatin ? ` [${artist.nameLatin}]` : '') +
  (artist.disambiguation || artist.mainArtist
    ? ` (${artist.disambiguation || artist.mainArtist?.name})`
    : '');

export const SelectArtist = forwardRef(
  (
    {
      updateArtistsIds,
      updateArtistId,
      placeholder = 'Artists',
      onChange,
      filterCondition,
      isMulti = true,
      ...field
    }: ControllerRenderProps<any, any> & {
      updateArtistsIds?: any;
      updateArtistId?: any;
      placeholder?: string;
      filterCondition?: (artist: IArtistSummary) => boolean;
      isMulti?: boolean;
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');
    const { snackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const { data, isLoading, refetch, fetchStatus } = useQuery(
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

    const handleInputChange = (v: any) => {
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

            if (isMulti) {
              const currentValues = Array.isArray(field.value)
                ? field.value
                : [];
              if (
                !currentValues.some((val: any) => val.value === newOption.value)
              ) {
                const newSelected = [...currentValues, newOption];
                onChange(newSelected);
                if (updateArtistsIds)
                  updateArtistsIds(
                    newSelected.map((option: any) => option.value),
                  );
              }
            } else {
              onChange(newOption);
              if (updateArtistId) updateArtistId(newOption.value);
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
        {...field}
        ref={ref}
        onChange={(selected: any) => {
          onChange(selected);
          if (isMulti) {
            if (updateArtistsIds)
              updateArtistsIds(
                (selected as { value: string; label: string }[]).map(
                  (option) => option.value,
                ),
              );
          } else {
            if (updateArtistId) updateArtistId(selected?.value);
          }
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
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
