import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Popover as TinyPopover } from 'react-tiny-popover';

const TooltipContainer = styled.div`
  padding: 6px 8px;
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  font-size: ${({ theme }) => theme.font.size.small};
  color: ${({ theme }) => theme.colors.text};
  max-width: 200px;
  z-index: 1000;
`;

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsOpen(true);
    }, 200);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsOpen(false);
  };

  const onClick = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    if (!isOpen) {
      setIsOpen(true);

      // Auto close after 3 seconds
      const id = setTimeout(() => {
        setIsOpen(false);
        setTimeoutId(null);
      }, 3000);
      setTimeoutId(id);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <TinyPopover
      isOpen={isOpen}
      positions={['top', 'bottom', 'left', 'right']}
      reposition={true}
      content={() => <TooltipContainer>{content}</TooltipContainer>}
      containerStyle={{
        zIndex: '1000',
      }}
    >
      <div
        // desktop
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // mobile
        onClick={onClick}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
    </TinyPopover>
  );
};
