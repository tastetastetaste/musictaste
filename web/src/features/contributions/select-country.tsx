import { useQuery } from '@tanstack/react-query';
import { forwardRef, useEffect } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { Select } from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

export const SelectCountry = forwardRef(
  (
    {
      updateCountryId,
      onChange,
      ...field
    }: ControllerRenderProps<any, 'country'> & { updateCountryId: any },
    ref,
  ) => {
    const { data, isLoading } = useQuery(cacheKeys.countriesKey(), () =>
      api.getCountries(),
    );

    useEffect(() => {
      console.log(data);
    }, []);

    return (
      <Select
        {...field}
        ref={ref}
        onChange={(selected: { value: string; label: string }) => {
          onChange(selected);
          updateCountryId(selected?.value);
        }}
        isLoading={isLoading}
        isMulti={false}
        options={
          data?.countries &&
          data.countries.map(({ id, name }) => ({
            value: id,
            label: name,
          }))
        }
        placeholder="Country"
      />
    );
  },
);
