import { Theme, useTheme } from '@emotion/react';
import { forwardRef } from 'react';
import ReactSelect, {
  createFilter,
  StylesConfig,
  components,
  Props as ReactSelectProps,
} from 'react-select';

export type SelectValue = string | string[] | null;

export interface SelectOption {
  value: string;
  label: string;
}

export type SelectType = SelectOption | SelectOption[];

export interface SelectProps extends ReactSelectProps {
  icon?: React.ReactNode;
}

const customStyles: (theme: Theme) => StylesConfig = (theme) => ({
  container: (provided, state) => ({
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
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  valueContainer: (provided) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
  }),
});
const ValueContainer = (props: any) => {
  const theme = useTheme();
  const icon = props.selectProps?.icon;

  return (
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
};

export const Select = forwardRef<any, SelectProps>((props, ref) => {
  const theme = useTheme();

  return (
    <ReactSelect
      {...props}
      ref={ref}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      classNamePrefix="react-select"
      filterOption={createFilter({
        stringify: (option) => option.label,
      })}
      styles={customStyles(theme)}
      components={props.icon ? { ValueContainer } : undefined}
    />
  );
});
