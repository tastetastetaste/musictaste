import styled from '@emotion/styled';
import { IconExclamationCircle } from '@tabler/icons-react';
import { Group } from '../flex/group';
import { Typography } from '../typography';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin: 8px 0;
  background: ${({ theme }) => theme.colors.complement};
  border-radius: ${({ theme }) => theme.border_radius.base};
  color: ${({ theme }) => theme.colors.text};
`;

export const Feedback = ({ message }: { message: string }) => {
  return (
    <Container role="alert">
      <Group gap="sm">
        <IconExclamationCircle />
        <Typography whiteSpace="pre-wrap">{message}</Typography>
      </Group>
    </Container>
  );
};
