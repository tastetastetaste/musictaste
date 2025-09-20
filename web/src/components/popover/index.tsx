import styled from '@emotion/styled';
import { Popover as TinyPopover } from 'react-tiny-popover';

const PopoverContainer = styled.div`
  width: 220px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 8px;
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  color: ${({ theme }) => theme.colors.text};
`;

export interface PopoverProps {
  content: JSX.Element;
  children: JSX.Element;
  title?: string;
  open: boolean;
  onClose: () => void;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  open,
  onClose,
}) => {
  return (
    <TinyPopover
      reposition={true}
      isOpen={open}
      onClickOutside={onClose}
      positions={['bottom', 'right', 'left', 'top']}
      content={() => <PopoverContainer>{content}</PopoverContainer>}
      containerStyle={{
        zIndex: '500',
      }}
    >
      {children}
    </TinyPopover>
  );
};
