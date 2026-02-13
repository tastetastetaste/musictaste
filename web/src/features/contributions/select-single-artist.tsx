import { useQuery } from '@tanstack/react-query';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { IArtistSummary } from 'shared';

export const SelectSingleArtist = forwardRef(
  (
    {
      updateMainArtistId,
      onChange,
      filterCondition,
      ...field
    }: ControllerRenderProps<any, 'mainArtist'> & {
      updateMainArtistId: any;
      filterCondition?: (artist: IArtistSummary) => boolean;
    },
    ref,
  ) => {
    const [query, setQuery] = useState('');

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

    return (
      <Select
        {...field}
        ref={ref}
        onChange={(selected: { value: string; label: string } | null) => {
          onChange(selected);
          updateMainArtistId(selected?.value);
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
        isMulti={false}
        options={
          data?.artists &&
          (filterCondition
            ? data.artists.filter(filterCondition)
            : data.artists
          ).map(({ id, name, nameLatin, disambiguation, mainArtist }) => ({
            value: id,
            label:
              name +
              (nameLatin ? ` [${nameLatin}]` : '') +
              (disambiguation || mainArtist
                ? ` (${disambiguation || mainArtist?.name})`
                : ''),
          }))
        }
        placeholder="Select Main Artist"
        onInputChange={(v: any) => {
          if (v !== '') {
            setQuery(v);
            refetch();
          }
        }}
      />
    );
  },
);

SelectSingleArtist.displayName = 'SelectSingleArtist';
