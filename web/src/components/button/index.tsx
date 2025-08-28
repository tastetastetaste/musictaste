import styled from '@emotion/styled';

interface ButtonProps {
  variant?: 'main' | 'text' | 'highlight';
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  danger?: boolean;
}

const StyledButton = styled.button<{ danger?: boolean; variant?: string }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: ${({ theme }) => theme.border_radius.base};
  border: none;
  text-decoration: none;
  cursor: pointer;
  padding: 6px;
  margin: 0;
  background-color: ${({ theme, danger, variant }) =>
    danger
      ? theme.colors.error
      : variant === 'highlight'
        ? theme.colors.highlight
        : theme.colors.background_sub};
  color: ${({ theme, danger, variant }) =>
    danger || variant === 'highlight'
      ? theme.colors.background
      : theme.colors.text};
  transition: background-color 0.1s ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.text};
    color: ${({ theme }) => theme.colors.background};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }

  &:disabled {
    opacity: 0.5;
    background-color: ${({ theme, danger }) =>
      danger ? theme.colors.error : theme.colors.background_sub};
    color: ${({ theme, danger }) =>
      danger ? theme.colors.background : theme.colors.text};
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
    danger ? theme.colors.error : theme.colors.primary};
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:active {
    color: ${({ theme, danger }) =>
      danger ? theme.colors.error : theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    color: ${({ theme, danger }) =>
      danger ? theme.colors.error : theme.colors.primary};
    cursor: not-allowed;
  }

  span {
    display: block;
    width: 100%;
    text-align: center;
  }
`;

export const Button = ({
  children,
  type = 'button',
  ...props
}: ButtonProps) => {
  const content = <span>{children}</span>;

  if (props.variant === 'text') {
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
