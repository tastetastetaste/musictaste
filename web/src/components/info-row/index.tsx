import { ReactNode } from 'react';
import { Group } from '../flex/group';
import { Typography } from '../typography';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, children }) => {
  const smallScreen = useMediaQuery({ down: 'sm' });
  return (
    <div
      css={{
        margin: '8px 0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Group gap={5} align="start">
        <Typography
          color="sub"
          css={{
            flex: smallScreen ? '110px 0 0' : '120px 0 0',
          }}
        >
          {label}
        </Typography>
        {children}
      </Group>
    </div>
  );
};
