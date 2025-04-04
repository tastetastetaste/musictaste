import { useState } from 'react';
import { useEffect } from 'react';
import ReactSelect, { ActionMeta, StylesConfig } from 'react-select';
import { Group } from '../flex/group';
import { useTheme } from '@emotion/react';
import { Theme } from '@emotion/react';
import { Typography } from '../typography';

const customStyles: (theme: Theme) => StylesConfig = (theme) => ({
  container: (provided) => ({
    ...provided,
    width: '100%',
  }),
  control: (provided, state) => ({
    ...provided,
    border: 'none',
    borderRadius: theme.border_radius.base,
    backgroundColor: theme.colors.complement,
    color: theme.colors.text,
    boxShadow: state.isFocused ? `0 0 0 2px ${theme.colors.text}` : 'none',
    padding: 0,
    minHeight: '30px',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: theme.border_radius.base,
    marginTop: '0',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? theme.colors.text
      : theme.colors.complement,
    color: state.isFocused ? theme.colors.complement : theme.colors.text,
    padding: '6px 10px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: theme.colors.main,
  }),
  input: (provided) => ({
    ...provided,
    color: theme.colors.text,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: theme.colors.text,
  }),
  multiValue: (provided) => ({
    ...provided,
    color: theme.colors.main,
    background: theme.colors.base,
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: theme.colors.main,
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    background: state.isFocused ? theme.colors.error : theme.colors.base,
    color: theme.colors.text,
    ':hover': {
      background: theme.colors.error,
      color: theme.colors.text,
    },
  }),
});

export interface DropdownProps {
  name?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange: (selected: { value: string; label: string }) => void;
  placeholder?: string | null;
  label?: string;
}

export function Dropdown({
  name,
  options,
  defaultValue,
  onChange,
  placeholder,
  label,
}: DropdownProps) {
  const [value, setValue] = useState<{ value: string; label: string }>();

  const theme = useTheme();

  useEffect(() => {
    setValue(options.find((o) => o.value === defaultValue) || undefined);
  }, [defaultValue, options]);

  const onSelectChange: (value: any, action: ActionMeta<any>) => void = (
    selected,
  ) => {
    typeof onChange === 'function' && onChange(selected);
    setValue(selected);
  };

  return (
    <Group gap="md">
      {label && <Typography whiteSpace="nowrap">{label}</Typography>}
      <ReactSelect
        name={name || 'filter'}
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={onSelectChange}
        isSearchable={false}
        styles={customStyles(theme)}
      />
    </Group>
  );
}
