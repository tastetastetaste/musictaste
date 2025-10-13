import { useQuery } from '@tanstack/react-query';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

export const SelectLabel = forwardRef(
  (
    {
      updateLabelsIds,
      onChange,
      ...field
    }: ControllerRenderProps<any, 'labels'> & { updateLabelsIds: any },
    ref,
  ) => {
    const [query, setQuery] = useState('');

    const { data, isLoading, refetch } = useQuery(
      cacheKeys.searchKey({
        q: query!,
        type: ['labels'],
        page: 1,
        pageSize: 12,
      }),
      () =>
        api.search({
          q: query!,
          type: ['labels'],
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
          updateLabelsIds(selected.map((option) => option.value));
        }}
        isLoading={isLoading}
        isMulti={true}
        options={
          data?.labels &&
          data.labels.map(({ id, name, nameLatin }) => ({
            value: id,
            label: name + (nameLatin ? ` (${nameLatin})` : ''),
          }))
        }
        placeholder="Label"
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
