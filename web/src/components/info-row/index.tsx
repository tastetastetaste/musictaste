import { ReactNode } from 'react';
import { Group } from '../flex/group';
import { Typography } from '../typography';

interface InfoRowProps {
  label: string;
  children: ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, children }) => {
  return (
    <Group gap={5} align="start">
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
  );
};
