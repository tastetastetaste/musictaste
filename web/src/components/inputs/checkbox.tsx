import styled from '@emotion/styled';
import { forwardRef } from 'react';
import { Group } from '../flex/group';

const StyledHiddenCheckbox = styled.input`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
  display: flex;
`;

const StyledCheckbox = styled.div<{ active: boolean }>`
  display: inline-block;
  background: ${({ theme }) => theme.colors.text};
  height: 20px;
  width: 20px;
  border-radius: ${({ theme }) => theme.border_radius.base};

  svg {
    fill: none;
    stroke: ${({ theme }) => theme.colors.text};
    stroke-width: 2px;
    visibility: hidden;
  }

  ${({ active, theme }) =>
    active &&
    `
    background: ${theme.colors.accent};
    svg {
      visibility: visible;
    }
  `}
`;

interface CheckboxInputProps {
  checked: boolean;
  name: string;
  handleChange: React.ChangeEventHandler<HTMLInputElement>;
}

const CheckboxInput = forwardRef(
  ({ checked, name, handleChange }: CheckboxInputProps, ref) => {
    return (
      <div>
        <StyledHiddenCheckbox
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          name={name}
          ref={ref as any}
        />
        <StyledCheckbox active={checked}>
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </StyledCheckbox>
      </div>
    );
  },
);

interface CheckboxProps {
  name: string;
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export const Checkbox = forwardRef(
  ({ name, onChange, label, value }: CheckboxProps, ref) => {
    return (
      <label style={{ cursor: 'pointer' }}>
        <Group gap="sm">
          <CheckboxInput
            checked={value}
            handleChange={(e) => onChange(e.target.checked)}
            name={name}
            ref={ref}
          />
          {label && <span>{label}</span>}
        </Group>
      </label>
    );
  },
);
