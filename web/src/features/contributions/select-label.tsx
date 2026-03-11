import { useQuery, useQueryClient } from '@tanstack/react-query';
import { forwardRef, useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { useSnackbar } from '../../hooks/useSnackbar';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';
import { LABEL_REFERENCE_PATTERN } from 'shared';

const formatLabelLabel = (label: any) =>
  label.name +
  (label.nameLatin ? ` [${label.nameLatin}]` : '') +
  (label.disambiguation ? ` (${label.disambiguation})` : '');

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
    const { snackbar } = useSnackbar();
    const queryClient = useQueryClient();

    const { data, isLoading, refetch, fetchStatus } = useQuery(
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

    const handleInputChange = (v: any) => {
      const match = v.match(LABEL_REFERENCE_PATTERN);
      if (match) {
        const labelId = match[1];
        setQuery('');

        queryClient
          .fetchQuery(cacheKeys.labelKey(labelId), () => api.getLabel(labelId))
          .then(({ label }) => {
            const newOption = {
              value: label.id,
              label: formatLabelLabel(label),
            };

            const currentValues = Array.isArray(field.value) ? field.value : [];
            if (
              !currentValues.some((val: any) => val.value === newOption.value)
            ) {
              const newSelected = [...currentValues, newOption];
              onChange(newSelected);
              updateLabelsIds(newSelected.map((option: any) => option.value));
            }
          })
          .catch(() => {
            snackbar('Failed to select label');
          });
      } else {
        setQuery(v);
      }
    };

    return (
      <Select
        {...field}
        ref={ref}
        onChange={(selected: { value: string; label: string }[]) => {
          onChange(selected);
          updateLabelsIds(selected.map((option) => option.value));
        }}
        isLoading={isLoading && fetchStatus !== 'idle'}
        isMulti={true}
        options={
          data?.labels &&
          data.labels.map((label) => ({
            value: label.id,
            label: formatLabelLabel(label),
          }))
        }
        placeholder="Labels"
        inputValue={query}
        onInputChange={handleInputChange}
      />
    );
  },
);
