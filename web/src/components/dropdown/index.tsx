import { Theme, useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import ReactSelect, {
  ActionMeta,
  StylesConfig,
  components,
} from 'react-select';
import { Group } from '../flex/group';
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
    backgroundColor: theme.colors.background_sub,
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
      : theme.colors.background_sub,
    color: state.isFocused ? theme.colors.background_sub : theme.colors.text,
    padding: '6px 10px',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: theme.colors.primary,
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
    color: theme.colors.primary,
    background: theme.colors.background,
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: theme.colors.primary,
  }),
  multiValueRemove: (provided, state) => ({
    ...provided,
    background: state.isFocused ? theme.colors.error : theme.colors.background,
    color: theme.colors.text,
    ':hover': {
      background: theme.colors.error,
      color: theme.colors.text,
    },
  }),
  valueContainer: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }),
});

export interface DropdownProps {
  name?: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  onChange: (selected: { value: string; label: string }) => void;
  placeholder?: string | null;
  label?: any;
  icon?: React.ReactNode;
}

export function Dropdown({
  name,
  options,
  defaultValue,
  onChange,
  placeholder,
  label,
  icon,
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

  const ValueContainer = (props: any) => (
    <components.ValueContainer {...props}>
      {icon && (
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            background: theme.colors.background_sub,
            borderRadius: '50%',
            padding: 2,
            marginRight: 6,
          }}
        >
          {icon}
        </span>
      )}
      {props.children}
    </components.ValueContainer>
  );

  return (
    <Group gap="md" align="center">
      {label && <Typography whiteSpace="nowrap">{label}</Typography>}
      <ReactSelect
        name={name || 'filter'}
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={onSelectChange}
        isSearchable={false}
        styles={customStyles(theme)}
        components={icon ? { ValueContainer } : undefined}
      />
    </Group>
  );
}
