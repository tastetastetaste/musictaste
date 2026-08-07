import styled from '@emotion/styled';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { SupporterStatus } from 'shared';
import { Group } from '../../components/flex/group';
import { Typography } from '../../components/typography';
import { useAuth } from '../account/useAuth';
import { Stack } from '../../components/flex/stack';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.background_sub};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 18px;
`;

const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.highlight};
  color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  margin-top: 6px;
`;

function Support() {
  const navigate = useNavigate();

  const { isLoading, me } = useAuth();

  if (isLoading || !me || me.supporter >= SupporterStatus.SUPPORTER)
    return null;

  return (
    <Card>
      <Stack gap="sm" align="center">
        <Typography size="body" align="center">
          Unlock exclusive supporter perks for a full year and help keep the
          website alive and ad-free.
        </Typography>
        <Typography size="body" align="center">
          One-time donation, easy & secure payment.
        </Typography>
        <StyledButton onClick={() => navigate('/support-us')}>
          <Group gap="md" align="center" justify="center">
            <IconRosetteDiscountCheckFilled size={22} />
            <Typography size="body-bold" color="bg">
              Become a Supporter
            </Typography>
          </Group>
        </StyledButton>
      </Stack>
    </Card>
  );
}

export default Support;
