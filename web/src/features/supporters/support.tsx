import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { SupporterStatus } from 'shared';
import { Stack } from '../../components/flex/stack';
import { Typography } from '../../components/typography';
import { useAuth } from '../account/useAuth';

const StyledButton = styled.button`
  background: ${({ theme }) => theme.colors.highlight};
  color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.border_radius.base};
  padding: 18px;
  margin-top: 48px;
  margin-bottom: 24px;
  border: none;
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
  &:active {
    background: ${({ theme }) => theme.colors.primary};
  }
`;

function Support() {
  const navigate = useNavigate();

  const { isLoading, me } = useAuth();

  if (isLoading || me?.supporter === SupporterStatus.SUPPORTER) return null;

  return (
    <StyledButton onClick={() => navigate('/support-us')}>
      <Stack gap="md" align="center">
        <Typography size="title-lg" color="bg">
          Support your favorite music reviews site
        </Typography>
      </Stack>
    </StyledButton>
  );
}

export default Support;
