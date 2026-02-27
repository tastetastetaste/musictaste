import styled from '@emotion/styled';
import { IconRosetteDiscountCheckFilled } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { SupporterStatus } from 'shared';
import { Group } from '../../components/flex/group';
import { Typography } from '../../components/typography';
import { useAuth } from '../account/useAuth';

const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.highlight};
  background: ${({ theme }) =>
    `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.highlight} 100%)`};
  color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 12px;
  margin-top: 12px;
  border: none;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) =>
      `linear-gradient(135deg, ${theme.colors.highlight} 0%, ${theme.colors.primary} 100%)`};
  }
  &:active {
    background: ${({ theme }) =>
      `linear-gradient(135deg, ${theme.colors.highlight} 0%, ${theme.colors.primary} 100%)`};
  }
`;

function Support() {
  const navigate = useNavigate();

  const { isLoading, me } = useAuth();

  if (isLoading || me?.supporter >= SupporterStatus.SUPPORTER) return null;

  return (
    <StyledButton onClick={() => navigate('/support-us')}>
      <Group gap="md" align="center" justify="center">
        <IconRosetteDiscountCheckFilled />
        <Typography size="title-lg" color="bg">
          Become a Supporter
        </Typography>
      </Group>
    </StyledButton>
  );
}

export default Support;
