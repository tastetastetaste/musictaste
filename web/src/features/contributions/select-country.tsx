import { useQuery } from '@tanstack/react-query';
import { forwardRef, useMemo } from 'react';
import {
  Select,
  SelectValue,
  SelectType,
} from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

interface SelectCountryProps {
  value?: SelectValue;
  onChange: (value: SelectValue, selected?: SelectType | null) => void;
  name?: string;
  placeholder?: string;
  isMulti?: boolean;
}

export const SelectCountry = forwardRef<any, SelectCountryProps>(
  (
    { placeholder = 'Country', onChange, isMulti = false, value, ...rest },
    ref,
  ) => {
    const { data, isLoading } = useQuery(cacheKeys.countriesKey(), () =>
      api.getCountries(),
    );

    const options = useMemo(() => {
      if (!data?.countries) return [];
      return data.countries.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    }, [data]);

    const selectedCountries = useMemo(() => {
      if (!value) return isMulti ? [] : null;
      if (Array.isArray(value)) {
        return options.filter((opt) => value.includes(opt.value));
      }
      return options.find((opt) => opt.value === value) || null;
    }, [value, options, isMulti]);

    const handleOnChange = (selected: SelectType | null) => {
      if (!selected) {
        onChange(isMulti ? [] : null, null);
        return;
      }

      const newValue = Array.isArray(selected)
        ? selected.map((s) => s.value)
        : selected.value;

      onChange(newValue, selected);
    };

    return (
      <Select
        {...rest}
        ref={ref}
        value={selectedCountries}
        onChange={handleOnChange}
        isLoading={isLoading}
        isMulti={isMulti}
        options={options}
        placeholder={placeholder}
      />
    );
  },
);
