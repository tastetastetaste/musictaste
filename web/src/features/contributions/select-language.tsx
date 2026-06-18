import { useQuery } from '@tanstack/react-query';
import { forwardRef, useMemo } from 'react';
import {
  Select,
  SelectValue,
  SelectType,
} from '../../components/inputs/select';
import { api } from '../../utils/api';
import { cacheKeys } from '../../utils/cache-keys';

interface SelectLanguageProps {
  value?: SelectValue;
  onChange: (value: SelectValue, selected?: SelectType | null) => void;
  name?: string;
  placeholder?: string;
  isMulti: boolean;
}

export const SelectLanguage = forwardRef<any, SelectLanguageProps>(
  ({ placeholder = 'Language', onChange, isMulti, value, ...rest }, ref) => {
    const { data, isLoading } = useQuery(cacheKeys.languagesKey(), () =>
      api.getLanguages(),
    );

    const options = useMemo(() => {
      if (!data?.languages) return [];
      return data.languages.map(({ id, name }) => ({
        value: id,
        label: name,
      }));
    }, [data]);

    const selectedLanguages = useMemo(() => {
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
        value={selectedLanguages}
        onChange={handleOnChange}
        isLoading={isLoading}
        isMulti={isMulti}
        options={options}
        placeholder={placeholder}
      />
    );
  },
);
