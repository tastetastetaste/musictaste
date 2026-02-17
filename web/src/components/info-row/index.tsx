import { ReactNode } from 'react';
import { Group } from '../flex/group';
import { Typography } from '../typography';

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, children }) => {
  return (
    <div
      css={{
        minHeight: '36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Group gap={5} align="center">
        <Typography
          color="sub"
          css={{
            flex: '120px 0 0',
          }}
        >
          {label}
        </Typography>
        {children}
      </Group>
    </div>
  );
};
