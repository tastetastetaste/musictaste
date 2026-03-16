import styled from '@emotion/styled';
import ReactDOM from 'react-dom';
import { Typography } from '../typography';
import { Stack } from '../flex/stack';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const DialogBox = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 20px;
  max-width: 500px;
  width: 100%;
  z-index: 2001;
  max-height: 80%;
  overflow-y: scroll;
`;

interface DialogProps {
  title: string;
  children: any;
  onClose: any;
  isOpen: boolean;
}

export const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  if (!isOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <Overlay
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <DialogBox
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <Stack gap="sm">
          <Typography size="title-lg">{title}</Typography>
          {children}
        </Stack>
      </DialogBox>
    </Overlay>,
    document.body,
  );
};

export default Dialog;
