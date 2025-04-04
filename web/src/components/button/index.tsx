import styled from '@emotion/styled';

interface ButtonProps {
  variant?: 'main' | 'text';
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  danger?: boolean;
}

const StyledButton = styled.button<{ danger?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.border_radius.base};
  border: none;
  text-decoration: none;
  cursor: pointer;
  padding: 6px;
  margin: 0;
  background-color: ${({ theme, danger }) =>
    danger ? theme.colors.error : theme.colors.complement};
  color: ${({ theme, danger }) =>
    danger ? theme.colors.base : theme.colors.text};
  transition: background-color 0.1s ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.base};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.main};
    color: ${({ theme }) => theme.colors.base};
  }

  &:disabled {
    opacity: 0.5;
    background-color: ${({ theme, danger }) =>
      danger ? theme.colors.error : theme.colors.complement};
    color: ${({ theme, danger }) =>
      danger ? theme.colors.base : theme.colors.text};
    cursor: not-allowed;
  }

  span {
    display: block;
    width: 100%;
    text-align: center;
  }
`;

const StyledTextButton = styled.button<{ danger?: boolean }>`
  font-size: ${({ theme }) => theme.font.size.body};
  padding: 4px 0;
  text-align: center;
  background: none;
  border: none;
  color: ${({ theme, danger }) =>
    danger ? theme.colors.error : theme.colors.main};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    color: ${({ theme, danger }) =>
      danger ? theme.colors.error : theme.colors.main};
  }

  &:disabled {
    opacity: 0.5;
    color: ${({ theme, danger }) =>
      danger ? theme.colors.error : theme.colors.main};
    cursor: not-allowed;
  }

  span {
    display: block;
    width: 100%;
    text-align: center;
  }
`;

export const Button = ({
  variant,
  children,
  type = 'button',
  ...props
}: ButtonProps) => {
  const content = <span>{children}</span>;

  if (variant === 'text') {
    return (
      <StyledTextButton {...props} type={type}>
        {content}
      </StyledTextButton>
    );
  }

  return (
    <StyledButton {...props} type={type}>
      {content}
    </StyledButton>
  );
};
