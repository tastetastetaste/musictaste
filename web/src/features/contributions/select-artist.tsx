import { api } from '../../utils/api';
import { forwardRef, useState, useEffect } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Select } from '../../components/inputs/select';
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

    const { data, isLoading, refetch } = useQuery(
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

    useEffect(() => {
      console.log('artist value', field.value);
    }, [field.value]);

    return (
      <Select
        {...field}
        ref={ref}
        onChange={(selected: { value: string; label: string }[]) => {
          onChange(selected);
          updateArtistsIds(selected.map((option) => option.value));
        }}
        isLoading={isLoading}
        isMulti={true}
        options={
          data?.artists &&
          data.artists.map(({ id, name }) => ({
            value: id,
            label: name,
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
