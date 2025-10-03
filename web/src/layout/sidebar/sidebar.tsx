import styled from '@emotion/styled';
import { useRef } from 'react';
import ReactDOM from 'react-dom';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';
import { Group } from '../../components/flex/group';
import { IconButton } from '../../components/icon-button';
import { IconX } from '@tabler/icons-react';
import { Typography } from '../../components/typography';

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

const SidabarBox = styled.div<{ position: 'left' | 'right' }>`
  background: ${({ theme }) => theme.colors.background};
  border-top-left-radius: ${({ theme }) => theme.border_radius.base};
  border-bottom-left-radius: ${({ theme }) => theme.border_radius.base};
  width: clamp(200px, 320px, 100%);
  max-width: calc(100% - 36px);
  height: 100%;
  padding: 25px 25px 0px;
  z-index: 2001;
  top: 0;
  ${({ position }) => (position === 'left' ? 'left: 0;' : 'right: 0;')};
  position: fixed;
  overflow-y: auto;
`;

export interface SidebarProps {
  isOpen: boolean;
  onClose: any;
  children: JSX.Element;
  position?: 'left' | 'right';
  title?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  children,
  isOpen,
  onClose,
  position = 'left',
  title,
}) => {
  const ref = useRef<any>();

  useOnClickOutside(ref, onClose);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <Overlay>
      <SidabarBox ref={ref} position={position}>
        <div css={{ paddingBottom: '20px' }}>
          {title ? (
            <Group justify="apart">
              <Typography size="title">{title}</Typography>
              <Group>
                <IconButton title="close" onClick={onClose}>
                  <IconX />
                </IconButton>
              </Group>
            </Group>
          ) : (
            <Group justify={position === 'left' ? 'end' : 'start'}>
              <IconButton title="close" onClick={onClose}>
                <IconX />
              </IconButton>
            </Group>
          )}
        </div>
        <div
          style={{
            height: '80%',
          }}
        >
          {children}
        </div>
      </SidabarBox>
    </Overlay>,
    document.body,
  );
};
