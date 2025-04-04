import { Theme, useTheme } from '@emotion/react';
import { forwardRef } from 'react';
import ReactSelect, { StylesConfig } from 'react-select';

const customStyles: (theme: Theme) => StylesConfig = (theme) => ({
  container: (provided, state) => ({
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
export const Select = forwardRef((props: any, ref) => {
  const theme = useTheme();

  return <ReactSelect ref={ref} {...props} styles={customStyles(theme)} />;
});
