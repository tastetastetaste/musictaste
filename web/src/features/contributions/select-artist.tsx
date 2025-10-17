import { useQuery } from '@tanstack/react-query';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

export const SelectArtist = forwardRef(
  (
    {
      updateArtistsIds,
      onChange,
      ...field
    }: ControllerRenderProps<any, 'artists'> & { updateArtistsIds: any },
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
        onChange={(selected: { value: string; label: string }[]) => {
          onChange(selected);
          updateArtistsIds(selected.map((option) => option.value));
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
        isMulti={true}
        options={
          data?.artists &&
          data.artists.map(({ id, name, nameLatin }) => ({
            value: id,
            label: name + (nameLatin ? ` [${nameLatin}]` : ''),
          }))
        }
        placeholder="Artist/Band"
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
