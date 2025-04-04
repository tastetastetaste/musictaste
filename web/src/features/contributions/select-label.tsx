import { api } from '../../utils/api';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { useQuery } from 'react-query';
import { Select } from '../../components/inputs/select';
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
          data.labels.map(({ id, name }) => ({
            value: id,
            label: name,
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
