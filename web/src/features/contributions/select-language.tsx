import { useQuery } from '@tanstack/react-query';
import { forwardRef } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

export const SelectLanguage = forwardRef(
  (
    {
      updateLanguagesIds,
      onChange,
      ...field
    }: ControllerRenderProps<any, 'languages'> & { updateLanguagesIds: any },
    ref,
  ) => {
    const { data, isLoading, refetch } = useQuery(
      cacheKeys.languagesKey(),
      () => api.getLanguages(),
    );

    return (
      <Select
        {...field}
        ref={ref}
        onChange={(selected: { value: string; language: string }[]) => {
          onChange(selected);
          updateLanguagesIds(selected.map((option) => option.value));
        }}
        isLoading={isLoading}
        isMulti={true}
        options={
          data?.languages &&
          data.languages.map(({ id, name }) => ({
            value: id,
            label: name,
          }))
        }
        placeholder="Language"
      />
    );
  },
);
